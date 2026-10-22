"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, subscribeAuth, type LocalUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/types";

type AuthContextValue = {
  user: LocalUser | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser: LocalUser | null) {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    setProfile(await getUserProfile(currentUser.uid));
  }

  useEffect(() => {
    const initialUser = getCurrentUser();
    setUser(initialUser);
    loadProfile(initialUser).finally(() => setLoading(false));

    return subscribeAuth(async (nextUser) => {
      setUser(nextUser);
      await loadProfile(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    configured: true,
    refreshProfile: async () => loadProfile(user),
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
