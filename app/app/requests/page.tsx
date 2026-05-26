"use client";

import { useState } from "react";
import Link from "next/link";
import { initials, useStore, type GameRequest } from "@/lib/store";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function RequestsPage() {
  const { incoming, outgoing, acceptRequest, declineRequest, userById } = useStore();
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");

  const pending = incoming.filter((r) => r.status === "pending");
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Step 3</span>
          <h1 className="display page-title">Match requests</h1>
          <p className="page-sub">
            {pending.length > 0 ? (
              <>
                You have <b>{pending.length}</b> request
                {pending.length === 1 ? "" : "s"} waiting. Accept to lock in a
                game — it goes straight to your calendar.
              </>
            ) : (
              <>You&apos;re all caught up. Sent requests show up here too.</>
            )}
          </p>
        </div>
        <div className="seg" role="tablist">
          <button className={tab === "incoming" ? "is-on" : ""} onClick={() => setTab("incoming")}>
            Incoming{pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
          <button className={tab === "sent" ? "is-on" : ""} onClick={() => setTab("sent")}>
            Sent
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="display empty__title">
            {tab === "incoming" ? "No requests yet" : "You haven't reached out yet"}
          </p>
          <p>
            {tab === "incoming"
              ? "When players invite you to hit, they'll show up here."
              : "Browse players free near you and send your first request."}
          </p>
          <Link href="/app/players" className="btn btn-ghost">
            Find players <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <div className="req-list">
          {list.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              direction={tab}
              counterpartName={
                tab === "incoming"
                  ? userById(r.fromUserId)?.name ?? "A player"
                  : userById(r.toUserId)?.name ?? "A player"
              }
              onAccept={() => acceptRequest(r.id)}
              onDecline={() => declineRequest(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  req,
  direction,
  counterpartName,
  onAccept,
  onDecline,
}: {
  req: GameRequest;
  direction: "incoming" | "sent";
  counterpartName: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <article className={`req-card req-card--${req.status}`}>
      <span className="req-card__av">{initials(counterpartName)}</span>

      <div className="req-card__body">
        <div className="req-card__top">
          <h3 className="req-card__name">
            {direction === "incoming" ? counterpartName : `To ${counterpartName}`}
          </h3>
          <span className={`status-pill status-pill--${req.status}`}>{req.status}</span>
        </div>

        <p className="req-card__when mono">
          {formatDate(req.date)} · {req.time}
        </p>

        {req.message && <p className="req-card__msg">&ldquo;{req.message}&rdquo;</p>}

        {direction === "incoming" && req.status === "pending" && (
          <div className="req-card__actions">
            <button className="btn btn-primary req-card__accept" onClick={onAccept}>
              Accept &amp; schedule
            </button>
            <button className="btn btn-ghost req-card__decline" onClick={onDecline}>
              Decline
            </button>
          </div>
        )}

        {req.status === "accepted" && (
          <Link href="/app/calendar" className="req-card__link">
            View on calendar →
          </Link>
        )}
      </div>
    </article>
  );
}
