"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { initials, useStore, type Game } from "@/lib/store";

const TIME_ORDER: Record<string, number> = { Morning: 0, Midday: 1, Evening: 2 };

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarPage() {
  const { games, userById, user } = useStore();
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  // Map of yyyy-mm-dd -> games on that day.
  const byDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const g of games) {
      const arr = map.get(g.date) ?? [];
      arr.push(g);
      map.set(g.date, arr);
    }
    return map;
  }, [games]);

  const todayStr = today.toISOString().slice(0, 10);

  const upcoming = useMemo(
    () =>
      [...games]
        .filter((g) => g.date >= todayStr)
        .sort((a, b) =>
          a.date === b.date
            ? (TIME_ORDER[a.time] ?? 0) - (TIME_ORDER[b.time] ?? 0)
            : a.date.localeCompare(b.date)
        ),
    [games, todayStr]
  );

  // Build the month grid (leading blanks for weekday alignment).
  const firstDow = new Date(cursor.y, cursor.m, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function partnerName(g: Game) {
    const otherId = g.players.find((p) => p !== user?.id);
    return otherId ? userById(otherId)?.name ?? "Player" : "Player";
  }

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.m + delta;
      return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Step 4</span>
          <h1 className="display page-title">Your games</h1>
          <p className="page-sub">
            {upcoming.length > 0 ? (
              <>
                <b>{upcoming.length}</b> game{upcoming.length === 1 ? "" : "s"} on
                the books. See you on court.
              </>
            ) : (
              <>No games scheduled yet — accept a request or reach out to lock one in.</>
            )}
          </p>
        </div>
      </div>

      <div className="cal-layout">
        <div className="card cal">
          <div className="cal__bar">
            <button className="cal__nav" aria-label="Previous month" onClick={() => shift(-1)}>
              ‹
            </button>
            <h2 className="cal__month display">{monthLabel(cursor.y, cursor.m)}</h2>
            <button className="cal__nav" aria-label="Next month" onClick={() => shift(1)}>
              ›
            </button>
          </div>

          <div className="cal__grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="cal__dow mono">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`b${i}`} className="cal__cell cal__cell--empty" />;
              const ds = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayGames = byDate.get(ds) ?? [];
              const isToday = ds === todayStr;
              return (
                <div key={ds} className={`cal__cell ${isToday ? "cal__cell--today" : ""} ${dayGames.length ? "cal__cell--has" : ""}`}>
                  <span className="cal__date">{day}</span>
                  {dayGames.map((g) => (
                    <span key={g.id} className="cal__pill" title={`${g.time} · ${partnerName(g)}`}>
                      {g.time[0]} {partnerName(g).split(" ")[0]}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="upcoming">
          <h2 className="upcoming__title mono">Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="empty empty--compact">
              <p>Nothing scheduled.</p>
              <Link href="/app/players" className="btn btn-ghost">
                Find players →
              </Link>
            </div>
          ) : (
            <ul className="upcoming__list">
              {upcoming.map((g) => (
                <li key={g.id} className="upcoming__item">
                  <span className="upcoming__date">
                    <b>{new Date(g.date + "T00:00:00").getDate()}</b>
                    <span className="mono">
                      {new Date(g.date + "T00:00:00").toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </span>
                  <span className="upcoming__detail">
                    <b>{partnerName(g)}</b>
                    <span className="mono">{g.time}</span>
                  </span>
                  <span className="upcoming__av">{initials(partnerName(g))}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
