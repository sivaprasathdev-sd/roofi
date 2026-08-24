import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clusters, states, users } from "@/data/mock-data";
import type { Role, UserRec } from "@/types";
import { api } from "@/services/api";

interface SessionValue {
  ready: boolean;
  user: UserRec | null;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  switchRole: (role: Role) => void;
  updateUser: (updatedUser: Partial<UserRec>) => void;
}

const KEY = "roofi.session.userId";
const USER_DATA_KEY = "roofi.session.userData";
const TOKEN_KEY = "roofi.session.token";
const SessionContext = createContext<SessionValue | null>(null);

const defaultUserFor = (role: Role): UserRec =>
  users.find((u) => u.role === role && u.status === "Active")!;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRec | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem(KEY);
    const savedUserData = localStorage.getItem(USER_DATA_KEY);

    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        setCurrentUser(parsed);
        setUserId(parsed.id);
      } catch (e) {
        // Fallback
      }
    } else if (savedUserId) {
      setUserId(savedUserId);
      const found = users.find((u) => u.id === savedUserId) ?? null;
      setCurrentUser(found);
    }
    setReady(true);
  }, []);

  const value = useMemo<SessionValue>(() => {
    const user = currentUser ?? users.find((u) => u.id === userId) ?? null;

    const signInHandler = async (credentials: { email: string; password: string }) => {
      // Validate exclusively against MongoDB API
      const res = await api.login({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
      if (res.user) {
        localStorage.setItem(KEY, res.user.id);
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(res.user));
        setUserId(res.user.id);
        setCurrentUser(res.user);
        return;
      }

      throw new Error("Invalid email or password. Credential mismatch.");
    };

    const setRole = (role: Role) => {
      const u = defaultUserFor(role);
      localStorage.setItem(KEY, u.id);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(u));
      setUserId(u.id);
      setCurrentUser(u);
    };

    const updateUserHandler = (updatedFields: Partial<UserRec>) => {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const merged = { ...prev, ...updatedFields };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(merged));
        // Also update local mock data if present
        const idx = users.findIndex((u) => u.id === merged.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx]!, ...merged };
        }
        return merged;
      });
    };

    return {
      ready,
      user,
      signIn: signInHandler,
      switchRole: setRole,
      updateUser: updateUserHandler,
      signOut: () => {
        localStorage.removeItem(KEY);
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUserId(null);
        setCurrentUser(null);
      },
    };
  }, [userId, currentUser, ready]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

export const roleLabel: Record<Role, string> = {
  ho: "HO Admin",
  state: "State HO / Admin",
  cluster: "Cluster",
};

/** Scope helpers — enforce visibility. */
export function useScope() {
  const { user } = useSession();
  const role: Role = user?.role ?? "ho";
  const stateId = user?.stateId;
  const clusterId = user?.clusterId;

  const visibleClusters = clusters.filter((c) =>
    role === "ho" ? true : role === "state" ? c.stateId === stateId : c.id === clusterId,
  );
  const visibleStates = role === "ho" ? states : states.filter((s) => s.id === stateId);

  function scope<
    T extends {
      stateId?: string | undefined;
      clusterId?: string | undefined;
      createdByRole?: string | undefined;
      createdBy?: string | undefined;
    },
  >(rows: T[]) {
    if (role === "ho") return rows;
    if (role === "state") {
      return rows.filter((r) => {
        if (r.stateId !== stateId) return false;
        if (r.createdByRole === "ho" || (r.createdBy && r.createdBy.includes("HO Admin")))
          return false;
        return true;
      });
    }
    return rows.filter((r) => {
      if (r.clusterId !== clusterId) return false;
      if (r.createdByRole === "ho" || (r.createdBy && r.createdBy.includes("HO Admin")))
        return false;
      return true;
    });
  }

  return {
    role,
    user,
    stateId,
    clusterId,
    visibleClusters,
    visibleStates,
    scope,
    canAssign: role !== "cluster",
  };
}
