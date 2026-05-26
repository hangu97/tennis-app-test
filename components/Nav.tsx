"use client";

import { useEffect, useState } from "react";
import TennisBall from "./TennisBall";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav__inner">
        <a href="#top" className="logo">
          <TennisBall size={28} />
          Rally
        </a>
        <div className="nav__links">
          <a href="#how">How it works</a>
          <a href="#why">Why Rally</a>
          <a href="#faq">FAQ</a>
          <a href="/login">Log in</a>
          <a href="/signup" className="btn btn-primary">
            Get matched
          </a>
        </div>
      </div>
    </nav>
  );
}
