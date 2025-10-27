import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  role?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isFetching: boolean;
  isPending: boolean;
  redirectToLogin: () => Promise<void>;
  exchangeCodeForSessionToken: (code: string, state?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_ENDPOINT = "/api/sessions";
const USER_INFO_ENDPOINT = "/api/users/me";
const LOGIN_ENDPOINT = "/api/oauth/google/redirect_url";
const LOGOUT_ENDPOINT = "/api/logout";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isPending, setIsPending] = useState<boolean>(false);

  const fetchCurrentUser = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(USER_INFO_ENDPOINT, {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as AuthUser;
      setUser(data);
    } catch (error) {
      console.error("Failed to load current user", error);
      setUser(null);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const redirectToLogin = useCallback(async () => {
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to start OAuth flow");
      }

      const data = (await response.json()) as { redirectUrl: string };
      if (!data?.redirectUrl) {
        throw new Error("Invalid redirect URL received");
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error("Failed to redirect to Google OAuth", error);
      throw error;
    }
  }, []);

  const exchangeCodeForSessionToken = useCallback(
    async (code: string, state?: string | null) => {
      if (!code) {
        return;
      }

      setIsPending(true);
      try {
        const response = await fetch(SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          const message = (errorPayload as { error?: string }).error ?? "Failed to establish session";
          throw new Error(message);
        }

        const result = (await response.json()) as { user?: AuthUser };
        if (result?.user) {
          setUser(result.user);
        } else {
          await fetchCurrentUser();
        }
      } catch (error) {
        console.error("Failed to exchange code for session token", error);
        setUser(null);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [fetchCurrentUser],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to call logout endpoint", error);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isFetching,
      isPending,
      redirectToLogin,
      exchangeCodeForSessionToken,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [user, isFetching, isPending, redirectToLogin, exchangeCodeForSessionToken, logout, fetchCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- Custom hook shares context from this module for convenience
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
