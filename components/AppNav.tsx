"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import TennisBall from "./TennisBall";
import { initials, useStore } from "@/lib/store";

const LINKS = [
  { href: "/app/availability", label: "My availability" },
  { href: "/app/players", label: "Find players" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/calendar", label: "Calendar" },
];

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, pendingIncomingCount } = useStore();
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="appnav">
      <div className="wrap appnav__inner">
        <Link href="/app/availability" className="logo appnav__logo">
          <TennisBall size={26} />
          Rally
        </Link>

        <button
          className="appnav__toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`appnav__links ${open ? "is-open" : ""}`}>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            const showBadge = l.href === "/app/requests" && pendingIncomingCount > 0;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "is-active" : ""}
                onClick={() => setOpen(false)}
              >
                {l.label}
                {showBadge && <span className="appnav__badge">{pendingIncomingCount}</span>}
              </Link>
            );
          })}

          <div className="appnav__user">
            {user && (
              <span className="appnav__avatar" title={user.name}>
                {initials(user.name)}
              </span>
            )}
            <button className="appnav__logout" onClick={onLogout}>
              Log out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
