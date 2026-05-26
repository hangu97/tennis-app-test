"use client";

/**
 * Rally — data + auth store, backed by Supabase.
 *
 * Auth uses Supabase Auth (email/password). All data lives in Postgres and is
 * read/written directly from the browser through supabase-js; row-level
 * security (see supabase/migrations) is what keeps each player scoped to their
 * own rows. Mutations update local state optimistically, then sync + refetch.
 *
 * The public context shape is intentionally the same one the pages already use,
 * so swapping the storage layer didn't require rewriting the UI.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

/* ----------------------------- Types ----------------------------- */

export type User = {
  id: string;
  name: string;
  email: string;
  ntrp: string;
  area: string;
  createdAt: number;
  seed?: boolean; // a built-in demo player (no auth account)
};

export type Availability = {
  userId: string;
  slots: string[]; // e.g. "Tue|Evening"
  note: string;
  updatedAt: number;
};

export type GameRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  date: string; // yyyy-mm-dd
  time: string; // Morning | Midday | Evening
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
};

export type Game = {
  id: string;
  requestId: string;
  players: [string, string];
  date: string;
  time: string;
  createdAt: number;
};

/* ------------------------- Constants / helpers ------------------------- */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const TIMES = ["Morning", "Midday", "Evening"] as const;

export function slotKey(day: string, time: string) {
  return `${day}|${time}`;
}
export function slotLabel(slot: string) {
  const [day, time] = slot.split("|");
  return `${day} · ${time}`;
}
export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* --------------------------- Row → app mappers --------------------------- */

type ProfileRow = { id: string; name: string; email: string | null; ntrp: string; area: string; is_demo: boolean; created_at: string };
type AvailabilityRow = { user_id: string; slots: string[]; note: string; updated_at: string };
type RequestRow = { id: string; from_user: string; to_user: string; play_date: string; play_time: string; message: string; status: GameRequest["status"]; created_at: string };
type GameRow = { id: string; request_id: string | null; players: string[]; play_date: string; play_time: string; created_at: string };

const toUser = (r: ProfileRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email ?? "",
  ntrp: r.ntrp,
  area: r.area,
  createdAt: Date.parse(r.created_at) || 0,
  seed: r.is_demo,
});
const toAvailability = (r: AvailabilityRow): Availability => ({
  userId: r.user_id,
  slots: r.slots ?? [],
  note: r.note ?? "",
  updatedAt: Date.parse(r.updated_at) || 0,
});
const toRequest = (r: RequestRow): GameRequest => ({
  id: r.id,
  fromUserId: r.from_user,
  toUserId: r.to_user,
  date: r.play_date,
  time: r.play_time,
  message: r.message ?? "",
  status: r.status,
  createdAt: Date.parse(r.created_at) || 0,
});
const toGame = (r: GameRow): Game => ({
  id: r.id,
  requestId: r.request_id ?? "",
  players: [r.players[0], r.players[1]] as [string, string],
  date: r.play_date,
  time: r.play_time,
  createdAt: Date.parse(r.created_at) || 0,
});

/* ------------------------------- Context ------------------------------- */

type AuthResult = { ok: true } | { ok: false; error: string };

type Ctx = {
  ready: boolean; // initial auth check finished
  authed: boolean; // a session exists (profile may still be loading)
  configured: boolean; // env vars are present
  user: User | null; // current player's profile

  signup: (input: { name: string; email: string; password: string; ntrp: string; area: string }) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;

  users: User[];
  userById: (id: string) => User | undefined;

  myAvailability: Availability | null;
  availabilityOf: (userId: string) => Availability | null;
  setMyAvailability: (slots: string[], note: string) => Promise<void>;

  players: { user: User; availability: Availability }[];

  incoming: GameRequest[];
  outgoing: GameRequest[];
  pendingIncomingCount: number;
  sendRequest: (input: { toUserId: string; date: string; time: string; message: string }) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;

  games: Game[];
};

const StoreContext = createContext<Ctx | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [availability, setAvailability] = useState<Record<string, Availability>>({});
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  // Keep the latest auth id available inside callbacks without re-subscribing.
  const uidRef = useRef<string | null>(null);
  uidRef.current = authUserId;

  /* ------------------------ Data loading ------------------------ */

  const loadAll = useCallback(async (uid: string) => {
    const [profilesRes, availRes, reqRes, gameRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("availability").select("*"),
      supabase.from("requests").select("*").or(`from_user.eq.${uid},to_user.eq.${uid}`),
      supabase.from("games").select("*"), // RLS already limits this to my games
    ]);

    setUsers((profilesRes.data as ProfileRow[] | null)?.map(toUser) ?? []);
    const availMap: Record<string, Availability> = {};
    for (const row of (availRes.data as AvailabilityRow[] | null) ?? []) {
      availMap[row.user_id] = toAvailability(row);
    }
    setAvailability(availMap);
    setRequests((reqRes.data as RequestRow[] | null)?.map(toRequest) ?? []);
    setGames((gameRes.data as GameRow[] | null)?.map(toGame) ?? []);
  }, []);

  const refetchActivity = useCallback(async (uid: string) => {
    const [reqRes, gameRes] = await Promise.all([
      supabase.from("requests").select("*").or(`from_user.eq.${uid},to_user.eq.${uid}`),
      supabase.from("games").select("*"),
    ]);
    setRequests((reqRes.data as RequestRow[] | null)?.map(toRequest) ?? []);
    setGames((gameRes.data as GameRow[] | null)?.map(toGame) ?? []);
  }, []);

  const clearData = useCallback(() => {
    setUsers([]);
    setAvailability({});
    setRequests([]);
    setGames([]);
  }, []);

  /* ----------------------- Auth bootstrap ----------------------- */

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      if (!mounted) return;
      setAuthUserId(uid);
      if (uid) await loadAll(uid);
      if (mounted) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user.id ?? null;
      setAuthUserId(uid);
      if (uid) await loadAll(uid);
      else clearData();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadAll, clearData]);

  const user = useMemo(
    () => users.find((u) => u.id === authUserId) ?? null,
    [users, authUserId]
  );
  const userById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  /* ------------------------------ Auth ------------------------------- */

  const signup = useCallback<Ctx["signup"]>(async ({ name, email, password, ntrp, area }) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase isn't configured yet — add your env vars." };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim(), ntrp, area: area.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) {
      // Email confirmation is on for this project — see the README.
      return { ok: false, error: "Check your email to confirm your account, then log in." };
    }
    setAuthUserId(data.session.user.id);
    await loadAll(data.session.user.id);
    return { ok: true };
  }, [loadAll]);

  const login = useCallback<Ctx["login"]>(async (email, password) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase isn't configured yet — add your env vars." };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: "Email or password is incorrect." };
    setAuthUserId(data.session.user.id);
    await loadAll(data.session.user.id);
    return { ok: true };
  }, [loadAll]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);
    clearData();
  }, [clearData]);

  /* -------------------------- Availability --------------------------- */

  const myAvailability = useMemo(
    () => (authUserId ? availability[authUserId] ?? null : null),
    [availability, authUserId]
  );
  const availabilityOf = useCallback(
    (userId: string) => availability[userId] ?? null,
    [availability]
  );

  const setMyAvailability = useCallback<Ctx["setMyAvailability"]>(
    async (slots, note) => {
      const uid = uidRef.current;
      if (!uid) return;
      // Optimistic: reflect immediately so the page shows "saved".
      setAvailability((prev) => ({
        ...prev,
        [uid]: { userId: uid, slots, note, updatedAt: Date.now() },
      }));
      await supabase
        .from("availability")
        .upsert({ user_id: uid, slots, note, updated_at: new Date().toISOString() });
    },
    []
  );

  const players = useMemo(() => {
    if (!authUserId) return [];
    return users
      .filter((u) => u.id !== authUserId && availability[u.id]?.slots.length)
      .map((u) => ({ user: u, availability: availability[u.id] }))
      .sort((a, b) => b.availability.slots.length - a.availability.slots.length);
  }, [users, availability, authUserId]);

  /* ----------------------------- Requests ---------------------------- */

  const incoming = useMemo(
    () =>
      authUserId
        ? requests.filter((r) => r.toUserId === authUserId).sort((a, b) => b.createdAt - a.createdAt)
        : [],
    [requests, authUserId]
  );
  const outgoing = useMemo(
    () =>
      authUserId
        ? requests.filter((r) => r.fromUserId === authUserId).sort((a, b) => b.createdAt - a.createdAt)
        : [],
    [requests, authUserId]
  );
  const pendingIncomingCount = useMemo(
    () => incoming.filter((r) => r.status === "pending").length,
    [incoming]
  );

  const sendRequest = useCallback<Ctx["sendRequest"]>(
    async ({ toUserId, date, time, message }) => {
      const uid = uidRef.current;
      if (!uid) return;
      // Optimistic temp row so the player card flips to "Request sent".
      const tempId = `temp-${Date.now()}`;
      setRequests((prev) => [
        ...prev,
        { id: tempId, fromUserId: uid, toUserId, date, time, message: message.trim(), status: "pending", createdAt: Date.now() },
      ]);
      await supabase.from("requests").insert({
        from_user: uid,
        to_user: toUserId,
        play_date: date,
        play_time: time,
        message: message.trim(),
      });
      await refetchActivity(uid);
    },
    [refetchActivity]
  );

  const acceptRequest = useCallback<Ctx["acceptRequest"]>(
    async (id) => {
      const uid = uidRef.current;
      if (!uid) return;
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)));
      await supabase.from("requests").update({ status: "accepted" }).eq("id", id);
      await refetchActivity(uid); // pick up the game created by the trigger
    },
    [refetchActivity]
  );

  const declineRequest = useCallback<Ctx["declineRequest"]>(
    async (id) => {
      const uid = uidRef.current;
      if (!uid) return;
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "declined" } : r)));
      await supabase.from("requests").update({ status: "declined" }).eq("id", id);
    },
    []
  );

  /* ------------------------------ Games ------------------------------ */

  const myGames = useMemo(
    () =>
      authUserId
        ? games.filter((g) => g.players.includes(authUserId)).sort((a, b) => a.date.localeCompare(b.date))
        : [],
    [games, authUserId]
  );

  const value: Ctx = {
    ready,
    authed: !!authUserId,
    configured: isSupabaseConfigured,
    user,
    signup,
    login,
    logout,
    users,
    userById,
    myAvailability,
    availabilityOf,
    setMyAvailability,
    players,
    incoming,
    outgoing,
    pendingIncomingCount,
    sendRequest,
    acceptRequest,
    declineRequest,
    games: myGames,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
