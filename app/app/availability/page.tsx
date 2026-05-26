"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DAYS, TIMES, slotKey, useStore } from "@/lib/store";

export default function AvailabilityPage() {
  const { myAvailability, setMyAvailability, players } = useStore();

  const [slots, setSlots] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  // Seed local state from the store once it's hydrated.
  useEffect(() => {
    if (myAvailability) {
      setSlots(new Set(myAvailability.slots));
      setNote(myAvailability.note);
    }
  }, [myAvailability]);

  function toggle(key: string) {
    setSaved(false);
    setSlots((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function save() {
    setMyAvailability([...slots], note);
    setSaved(true);
  }

  // CRO nudge: how many nearby players overlap with the chosen slots.
  const matchCount = useMemo(() => {
    if (!slots.size) return 0;
    return players.filter((p) => p.availability.slots.some((s) => slots.has(s)))
      .length;
  }, [players, slots]);

  const dirty =
    !myAvailability ||
    note !== myAvailability.note ||
    slots.size !== myAvailability.slots.length ||
    [...slots].some((s) => !myAvailability.slots.includes(s));

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Step 1</span>
          <h1 className="display page-title">When do you play?</h1>
          <p className="page-sub">
            Tap the times you&apos;re usually free. The more you add, the faster
            you get matched — players with 4+ slots get hit up{" "}
            <b>3× more often</b>.
          </p>
        </div>
        <div className="match-meter">
          <span className="match-meter__num">{matchCount}</span>
          <span className="match-meter__label">
            player{matchCount === 1 ? "" : "s"} near you free at these times
          </span>
        </div>
      </div>

      <div className="card avail-card">
        <div className="avail-grid" role="group" aria-label="Weekly availability">
          <div className="avail-grid__corner" />
          {TIMES.map((t) => (
            <div key={t} className="avail-grid__colhead mono">
              {t}
            </div>
          ))}

          {DAYS.map((day) => (
            <div key={day} className="avail-grid__row">
              <div className="avail-grid__dayhead mono">{day}</div>
              {TIMES.map((time) => {
                const key = slotKey(day, time);
                const on = slots.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`slot ${on ? "slot--on" : ""}`}
                    aria-pressed={on}
                    onClick={() => toggle(key)}
                  >
                    {on ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <label className="field avail-note">
          <span>A note for partners (optional)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => {
              setSaved(false);
              setNote(e.target.value);
            }}
            placeholder="Your style, what you're looking for, court preferences…"
          />
        </label>
      </div>

      <div className="save-bar">
        <div className="save-bar__status">
          {saved && !dirty ? (
            <span className="save-bar__saved">✓ Saved · you&apos;re visible to players now</span>
          ) : (
            <span className="mono">
              {slots.size} slot{slots.size === 1 ? "" : "s"} selected
            </span>
          )}
        </div>
        <div className="save-bar__actions">
          {saved && !dirty && (
            <Link href="/app/players" className="btn btn-ghost">
              Find players <span className="arrow">→</span>
            </Link>
          )}
          <button className="btn btn-primary" onClick={save} disabled={!dirty}>
            {myAvailability ? "Save changes" : "Save availability"}
          </button>
        </div>
      </div>
    </div>
  );
}
