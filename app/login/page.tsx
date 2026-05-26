"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthAside from "@/components/AuthAside";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { ready, authed, login } = useStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && authed) router.replace("/app/availability");
  }, [ready, authed, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setSubmitting(true);
    const res = await login(email, password);
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
            <span className="eyebrow">Welcome back</span>
            <h1 className="display">Log in to Rally</h1>
            <p>Pick up where you left off — your matches are waiting.</p>
          </div>

          <form className="auth__form-fields" onSubmit={onSubmit} noValidate>
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
                placeholder="Your password"
                autoComplete="current-password"
              />
            </label>

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth__submit" disabled={submitting}>
              {submitting ? "Logging in…" : "Log in"} <span className="arrow">→</span>
            </button>
          </form>

          <p className="auth__switch">
            New to Rally? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
