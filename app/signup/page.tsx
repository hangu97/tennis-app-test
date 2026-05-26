"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthAside from "@/components/AuthAside";
import { useStore } from "@/lib/store";

const LEVELS = [
  { v: "2.5", l: "2.5 · Just starting out" },
  { v: "3.0", l: "3.0 · Getting consistent" },
  { v: "3.5", l: "3.5 · Solid rallies" },
  { v: "4.0", l: "4.0 · Competitive" },
  { v: "4.5", l: "4.5 · Advanced" },
  { v: "5.0", l: "5.0+ · Tournament" },
];

export default function SignupPage() {
  const { ready, authed, signup } = useStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ntrp, setNtrp] = useState("3.5");
  const [area, setArea] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the form.
  useEffect(() => {
    if (ready && authed) router.replace("/app/availability");
  }, [ready, authed, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Tell us your name so partners know who they're hitting with.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (password.length < 6) return setError("Use a password of at least 6 characters.");
    if (!area.trim()) return setError("Add your area so we can match you with players nearby.");

    setSubmitting(true);
    const res = await signup({ name, email, password, ntrp, area });
    setSubmitting(false);
    if (!res.ok) return setError(res.error);
    router.push("/app/availability");
  }

  return (
    <div className="auth">
      <AuthAside />

      <main className="auth__main">
        <div className="auth__card">
          <div className="auth__head">
            <span className="eyebrow">Free forever · No card</span>
            <h1 className="display">Create your account</h1>
            <p>Join in 30 seconds and get matched with players at your level.</p>
          </div>

          <form className="auth__form-fields" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span>Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Rivera"
                autoComplete="name"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Skill level (NTRP)</span>
                <select value={ntrp} onChange={(e) => setNtrp(e.target.value)}>
                  {LEVELS.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Your area</span>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Neighborhood or city"
                  autoComplete="address-level2"
                />
              </label>
            </div>

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth__submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create account"} <span className="arrow">→</span>
            </button>

            <p className="auth__fine">
              By joining you agree to play fair and show up on time. No fees,
              no flakes.
            </p>
          </form>

          <p className="auth__switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
