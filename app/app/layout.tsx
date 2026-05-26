"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { useStore } from "@/lib/store";

function Loader() {
  return (
    <div className="app-loading">
      <div className="app-loading__ball" />
      <p className="mono">Loading your court…</p>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, authed, configured, user } = useStore();
  const router = useRouter();

  // Auth guard: once the initial auth check is done, bounce anyone without a
  // session to login. (While a session exists but the profile is still loading,
  // we keep showing the loader rather than redirecting.)
  useEffect(() => {
    if (ready && configured && !authed) router.replace("/login");
  }, [ready, configured, authed, router]);

  if (configured && (!ready || !authed || !user)) {
    return <Loader />;
  }

  if (!configured) {
    return (
      <div className="app-loading">
        <div className="app-loading__ball" />
        <p className="mono" style={{ maxWidth: "32ch", textAlign: "center" }}>
          Supabase isn&apos;t configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppNav />
      <main className="app-main">{children}</main>
    </div>
  );
}
