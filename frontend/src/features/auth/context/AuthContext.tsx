"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/auth";

export interface AuthUser {
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (
    user: AuthUser,
    token: string
  ) => void;

  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setSessionToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setSessionToken(storedToken);
      setUser(storedUser);
    } else {
      clearAuthStorage();
      setSessionToken(null);
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = useCallback(
    (
      userData: AuthUser,
      accessToken: string
    ) => {
      setToken(accessToken);
      setStoredUser(userData);

      setSessionToken(accessToken);
      setUser(userData);
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthStorage();

    setSessionToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updatedUser: AuthUser) => {
      setStoredUser(updatedUser);
      setUser(updatedUser);
    },
    []
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated:
        Boolean(token) && Boolean(user),
      login,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );
  }

  return context;
}