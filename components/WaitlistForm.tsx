"use client";

import { useState, type FormEvent } from "react";

export default function WaitlistForm({
  cta = "Get matched free",
}: {
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setError("Enter a valid email so we can send your matches.");
      return;
    }
    setError("");
    setDone(true);
    // In production: POST email to the waitlist endpoint here.
  }

  if (done) {
    return (
      <div>
        <div className="form-success">
          <span className="check">✓</span>
          <span>
            You&apos;re in. We&apos;ll text you your first match shortly —
            keep your racquet close.
          </span>
        </div>
        <p className="form-note">Spot reserved · no spam, ever</p>
      </div>
    );
  }

  return (
    <div>
      <form className="form" onSubmit={onSubmit} noValidate>
        <input
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          {cta} <span className="arrow">→</span>
        </button>
      </form>
      <p className="form-note">
        {error || "Free to join · No fees · No flakes · Cancel anytime"}
      </p>
    </div>
  );
}
