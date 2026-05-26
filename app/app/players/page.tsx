"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  initials,
  slotLabel,
  TIMES,
  useStore,
  type Availability,
  type User,
} from "@/lib/store";

export default function PlayersPage() {
  const { players, myAvailability, outgoing, sendRequest, user } = useStore();
  const [level, setLevel] = useState<"all" | "match">("all");
  const [active, setActive] = useState<{ user: User; availability: Availability } | null>(null);

  const mySlots = useMemo(
    () => new Set(myAvailability?.slots ?? []),
    [myAvailability]
  );

  // Players I've already reached out to (and the outcome).
  const requestedTo = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of outgoing) map.set(r.toUserId, r.status);
    return map;
  }, [outgoing]);

  const visible = useMemo(() => {
    if (level === "all" || !user) return players;
    const mine = parseFloat(user.ntrp);
    return players.filter((p) => Math.abs(parseFloat(p.user.ntrp) - mine) <= 0.5);
  }, [players, level, user]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Step 2</span>
          <h1 className="display page-title">Players free near you</h1>
          <p className="page-sub">
            <b>{players.length}</b> player{players.length === 1 ? "" : "s"} have
            posted availability. Reach out — the average reply comes back the
            same day.
          </p>
        </div>
        <div className="seg" role="tablist" aria-label="Filter by level">
          <button
            className={level === "all" ? "is-on" : ""}
            onClick={() => setLevel("all")}
          >
            Everyone
          </button>
          <button
            className={level === "match" ? "is-on" : ""}
            onClick={() => setLevel("match")}
          >
            My level
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p className="display empty__title">No players to show yet</p>
          <p>Try widening your filter, or check back soon — new players join daily.</p>
          {level === "match" && (
            <button className="btn btn-ghost" onClick={() => setLevel("all")}>
              Show everyone
            </button>
          )}
        </div>
      ) : (
        <div className="player-grid">
          {visible.map(({ user: p, availability }) => {
            const status = requestedTo.get(p.id);
            const overlap = availability.slots.filter((s) => mySlots.has(s));
            return (
              <article key={p.id} className="player-card">
                <header className="player-card__head">
                  <span className="player-card__av">{initials(p.name)}</span>
                  <div>
                    <h3 className="player-card__name">{p.name}</h3>
                    <p className="player-card__meta">
                      <span className="tag tag--clay">{p.ntrp} NTRP</span>
                      <span className="player-card__area">📍 {p.area}</span>
                    </p>
                  </div>
                </header>

                {availability.note && (
                  <p className="player-card__note">{availability.note}</p>
                )}

                <div className="player-card__slots">
                  {availability.slots.map((s) => (
                    <span
                      key={s}
                      className={`tag ${mySlots.has(s) ? "tag--match" : ""}`}
                    >
                      {slotLabel(s)}
                    </span>
                  ))}
                </div>

                {overlap.length > 0 && (
                  <p className="player-card__overlap">
                    ✓ You both play {overlap.map(slotLabel).join(", ")}
                  </p>
                )}

                {status === "pending" ? (
                  <button className="btn btn-ghost player-card__cta" disabled>
                    Request sent · awaiting reply
                  </button>
                ) : status === "accepted" ? (
                  <Link href="/app/calendar" className="btn btn-ghost player-card__cta">
                    On your calendar →
                  </Link>
                ) : (
                  <button
                    className="btn btn-primary player-card__cta"
                    onClick={() => setActive({ user: p, availability })}
                  >
                    Reach out <span className="arrow">→</span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {active && (
        <ReachOutModal
          target={active}
          mySlots={mySlots}
          onClose={() => setActive(null)}
          onSend={(payload) => {
            sendRequest(payload);
            setActive(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------- Reach-out modal ---------------------------- */

function nextDateForDay() {
  // Default to tomorrow — a sensible, low-friction default.
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function ReachOutModal({
  target,
  mySlots,
  onClose,
  onSend,
}: {
  target: { user: User; availability: Availability };
  mySlots: Set<string>;
  onClose: () => void;
  onSend: (p: { toUserId: string; date: string; time: string; message: string }) => void;
}) {
  const { user } = useStore();

  // Pre-select a time that overlaps, so the form starts in a good state.
  const overlapSlot = target.availability.slots.find((s) => mySlots.has(s));
  const defaultTime = overlapSlot ? overlapSlot.split("|")[1] : target.availability.slots[0]?.split("|")[1] ?? "Evening";

  const [date, setDate] = useState(nextDateForDay());
  const [time, setTime] = useState(defaultTime);
  const [message, setMessage] = useState(
    `Hey ${target.user.name.split(" ")[0]} — I'm a ${user?.ntrp} in ${user?.area}. Want to hit?`
  );

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="modal__head">
          <span className="player-card__av">{initials(target.user.name)}</span>
          <div>
            <h3 className="modal__title display">Reach out to {target.user.name.split(" ")[0]}</h3>
            <p className="modal__meta">
              {target.user.ntrp} NTRP · {target.user.area}
            </p>
          </div>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} min={nextDateForDay()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Time</span>
            <div className="seg seg--full">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={time === t ? "is-on" : ""}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </label>
        </div>

        <label className="field">
          <span>Message</span>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <button
          className="btn btn-primary modal__send"
          onClick={() => onSend({ toUserId: target.user.id, date, time, message })}
        >
          Send request <span className="arrow">→</span>
        </button>
        <p className="auth__fine">They&apos;ll see your availability and can accept in one tap.</p>
      </div>
    </div>
  );
}
