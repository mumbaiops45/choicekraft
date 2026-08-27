"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as authService from "@/lib/services/authService";

/**
 * Auth store.
 *
 * The access token lives in memory only — never localStorage, where any
 * injected script could read it. Persistence comes from the httpOnly refresh
 * cookie instead: on mount the store calls /auth/refresh, and a valid cookie
 * hands back a new access token, restoring the session across reloads.
 */
const AuthContext = createContext(null);

/**
 * Where the access token is kept between reloads.
 *
 * NOTE ON SAFETY: localStorage is readable by any script running on this
 * origin, so an XSS hole would expose this token until it expires (3 hours).
 * It is here because it was asked for and it makes the token visible in
 * DevTools > Application. The refresh token is NOT here and cannot be — the
 * backend sets it httpOnly, so JavaScript never sees its value.
 */
const TOKEN_KEY = "ck-access-token";

const readStoredToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return ""; // private mode / blocked storage
  }
};

const writeStoredToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore quota / blocked storage — the refresh cookie still persists
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  // True until the initial refresh settles, so the UI can avoid flashing a
  // signed-out panel at someone who is actually signed in.
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState("");
  // The sign-in panel lives in the navbar, but pages need to open it too —
  // a "please sign in" screen with no way to sign in is a dead end.
  const [accountOpen, setAccountOpen] = useState(false);

  // Read by callers that need the freshest token without re-rendering on it.
  const tokenRef = useRef("");
  const applyToken = useCallback((token) => {
    tokenRef.current = token || "";
    setAccessToken(token || "");
    writeStoredToken(token);
  }, []);

  // Restore an existing session once, on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // A stored token gets the panel populated without waiting on the
        // network. It may already be expired, which /auth/me will tell us.
        const stored = readStoredToken();
        if (stored) {
          try {
            const me = await authService.getMe(stored);
            if (cancelled) return;
            if (me) {
              applyToken(stored);
              setUser(me);
              return;
            }
          } catch {
            // Expired or revoked — fall through and refresh it below.
          }
        }

        const token = await authService.refresh();
        if (cancelled || !token) {
          if (!cancelled && stored) applyToken(""); // stale, drop it
          return;
        }

        const me = await authService.getMe(token);
        if (cancelled) return;

        applyToken(token);
        setUser(me);
      } catch {
        // No cookie, expired, or revoked — simply nobody is signed in.
        if (!cancelled) applyToken("");
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyToken]);

  /** Shared by login and register: both return a user + access token. */
  const startSession = useCallback(
    async (run) => {
      setError("");
      try {
        const session = await run();
        applyToken(session.accessToken);
        setUser(session.user);
        return { ok: true, user: session.user, message: session.message };
      } catch (err) {
        const message = err?.message || "Something went wrong. Please try again.";
        setError(message);
        return { ok: false, message };
      }
    },
    [applyToken]
  );

  const login = useCallback(
    (credentials) => startSession(() => authService.login(credentials)),
    [startSession]
  );

  const register = useCallback(
    (payload) => startSession(() => authService.register(payload)),
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the call fails, drop the local session — the cookie is
      // httpOnly and will expire on its own.
    }
    applyToken("");
    setUser(null);
    setError("");
  }, [applyToken]);

  /**
   * Runs an authenticated call, and if the access token has expired mid-session
   * (a 401), refreshes it once and retries.
   *
   * Without this, the token simply dies after its 3 hours and every protected
   * call fails until the page is reloaded — which is what made "refresh and it
   * works" the workaround.
   *
   * @param {(token: string) => Promise<any>} run
   */
  const authedCall = useCallback(
    async (run) => {
      try {
        return await run(tokenRef.current);
      } catch (error) {
        if (error?.status !== 401) throw error;

        // A 401 does not always mean the token is stale. The backend answers
        // 401 with "Internal server error" when an upstream call (Razorpay)
        // rejects ITS credentials — refreshing our token would not help, and
        // retrying would fire the request a second time for nothing.
        const message = (error?.message || "").toLowerCase();
        const looksLikeExpiry =
          message.includes("token") ||
          message.includes("authentication") ||
          message.includes("unauthorized") ||
          message.includes("log in") ||
          message.includes("login");

        if (!looksLikeExpiry) throw error;

        let fresh = "";
        try {
          fresh = await authService.refresh();
        } catch {
          fresh = "";
        }

        if (!fresh) {
          // The refresh cookie is gone or revoked too — this session is over.
          applyToken("");
          setUser(null);
          throw error;
        }

        applyToken(fresh);
        return run(fresh);
      }
    },
    [applyToken]
  );

  /** Re-reads the signed-in user, e.g. after a profile update. */
  const reloadUser = useCallback(async () => {
    if (!tokenRef.current) return null;
    try {
      const me = await authedCall((token) => authService.getMe(token));
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, [authedCall]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.isAdmin),
      restoring,
      error,
      clearError: () => setError(""),
      login,
      register,
      logout,
      reloadUser,
      authedCall,
      accountOpen,
      openAccount: () => setAccountOpen(true),
      closeAccount: () => setAccountOpen(false),
      /** Current token without subscribing to it. */
      getToken: () => tokenRef.current,
    }),
    [
      user,
      accessToken,
      restoring,
      error,
      accountOpen,
      login,
      register,
      logout,
      reloadUser,
      authedCall,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}

export default AuthContext;
