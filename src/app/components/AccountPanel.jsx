"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  UserCircle,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  LogOut,
  BadgeCheck,
  Phone,
  Package,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  MonitorSmartphone,
} from "lucide-react";
import { useAuth } from "../store/AuthStore";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerification,
  updateMyProfile,
  verifyEmail,
} from "@/lib/services/authService";

/**
 * Account drawer.
 *
 * Signed out: sign in / register, plus the forgot-password and reset steps.
 * Signed in:  profile, change password, email verification and session
 *             management. The wishlist has its own drawer, opened from the
 *             navbar heart.
 *
 * The access token never reaches this component's state — the auth store keeps
 * it in memory and hands it over via getToken() only when a call needs it.
 */
export default function AccountPanel({ open, onClose }) {
  const {
    user,
    isAuthenticated,
    restoring,
    login,
    register,
    logout,
    logoutEverywhere,
    authedCall,
    reloadUser,
    sessionExpired,
  } = useAuth();


  const [mode, setMode] = useState("signin");
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Forgot / reset password. The reset token arrives out of band, so the
  // second step asks for it rather than reading it from the URL.
  const [reset, setReset] = useState({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  });
  // Email verification, same two-step shape: ask for a token, then submit it.
  const [verifyToken, setVerifyToken] = useState("");
  const [verifySent, setVerifySent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Closing the panel clears whatever was typed or reported.
  useEffect(() => {
    if (!open) {
      setNotice(null);
      setForm({ name: "", email: "", password: "" });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setReset({
        email: "",
        token: "",
        password: "",
        confirmPassword: "",
      });
      setVerifyToken("");
      setVerifySent(false);
      setShowPassword(false);
    }
  }, [open]);

  // Keep the profile fields in step with whoever is signed in.
  useEffect(() => {
    setProfile({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  const set = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const setProfileField = (key) => (e) =>
    setProfile((current) => ({ ...current, [key]: e.target.value }));

  const setPasswordField = (key) => (e) =>
    setPasswords((current) => ({ ...current, [key]: e.target.value }));

  const setResetField = (key) => (e) =>
    setReset((current) => ({ ...current, [key]: e.target.value }));

  /** Moving between sign in / register / forgot / reset starts clean. */
  const go = (next) => {
    setMode(next);
    setNotice(null);
  };

  const fail = (text) => setNotice({ type: "error", text });
  const done = (text) => setNotice({ type: "success", text });

  // ----------------------------------------------------------------
  // Sign in / register
  // ----------------------------------------------------------------

  /**
   * The inputs carry `required`, but relying on browser validation alone means
   * a too-short password blocks the submit with no feedback from the app at
   * all — it just looks like the button does nothing. Check here and say what
   * is wrong.
   */
  const validate = () => {
    if (mode === "register" && form.name.trim().length < 2) {
      return "Please enter your full name.";
    }
    if (!form.email.trim()) return "Please enter your email address.";
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const problem = validate();
    if (problem) return fail(problem);

    setBusy(true);
    setNotice(null);

    const result =
      mode === "signin"
        ? await login({ email: form.email, password: form.password })
        : await register({
            name: form.name,
            email: form.email,
            password: form.password,
          });

    setBusy(false);

    if (result.ok) {
      setForm({ name: "", email: "", password: "" });
      setNotice(null);
      setTab("profile");
    } else {
      fail(result.message);
    }
  };

  // ----------------------------------------------------------------
  // Profile
  // ----------------------------------------------------------------

  const saveProfile = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (profile.name.trim().length < 2) return fail("Please enter your name.");

    setBusy(true);
    setNotice(null);
    try {
      await authedCall((token) =>
        updateMyProfile(token, {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        })
      );
      await reloadUser();
      done("Profile updated.");
    } catch (err) {
      fail(err?.message || "Could not update your profile.");
    } finally {
      setBusy(false);
    }
  };

  // ----------------------------------------------------------------
  // Change password
  // ----------------------------------------------------------------

  const submitPassword = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!passwords.currentPassword) return fail("Enter your current password.");
    if (passwords.newPassword.length < 8) {
      return fail("New password must be at least 8 characters.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return fail("New passwords do not match.");
    }

    setBusy(true);
    setNotice(null);
    try {
      await authedCall((token) =>
        changePassword(token, {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        })
      );
      // The backend revokes every session on success, so the local one is
      // already dead — sign out rather than keep a token that will 401.
      await logout();
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMode("signin");
      done("Password changed. Please sign in again.");
    } catch (err) {
      fail(err?.message || "Could not change your password.");
    } finally {
      setBusy(false);
    }
  };

  // ----------------------------------------------------------------
  // Forgot / reset password
  // ----------------------------------------------------------------

  /**
   * Step one. The backend answers the same way whether or not the address is
   * registered, so this never confirms who has an account here.
   */
  const requestReset = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!reset.email.trim()) return fail("Please enter your email address.");

    setBusy(true);
    setNotice(null);
    try {
      const result = await forgotPassword(reset.email.trim());
      setMode("reset");
      done(
        result.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (err) {
      fail(err?.message || "Could not start the password reset.");
    } finally {
      setBusy(false);
    }
  };

  /** Step two. Every other session is revoked, so nobody has to sign in here. */
  const submitReset = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!reset.token.trim()) return fail("Enter the reset code you received.");
    if (reset.password.length < 8) {
      return fail("Password must be at least 8 characters.");
    }
    if (reset.password !== reset.confirmPassword) {
      return fail("Passwords do not match.");
    }

    setBusy(true);
    setNotice(null);
    try {
      await resetPassword(reset.token.trim(), reset.password);
      setReset({ email: "", token: "", password: "", confirmPassword: "" });
      setMode("signin");
      done("Password reset. Please sign in with your new password.");
    } catch (err) {
      fail(err?.message || "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  // ----------------------------------------------------------------
  // Email verification
  // ----------------------------------------------------------------

  const requestVerification = async () => {
    if (busy) return;

    setBusy(true);
    setNotice(null);
    try {
      const result = await authedCall((token) => sendVerification(token));
      setVerifySent(true);
      done(result.message || "Verification link has been generated.");
    } catch (err) {
      fail(err?.message || "Could not send the verification link.");
    } finally {
      setBusy(false);
    }
  };

  const submitVerification = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!verifyToken.trim()) {
      return fail("Enter the verification code you received.");
    }

    setBusy(true);
    setNotice(null);
    try {
      // Public route — it identifies the account from the token itself, so no
      // access token goes with it.
      await verifyEmail(verifyToken.trim());
      setVerifyToken("");
      setVerifySent(false);
      await reloadUser();
      done("Email verified.");
    } catch (err) {
      fail(err?.message || "Could not verify your email.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    await logout();
    setBusy(false);
    setMode("signin");
    setNotice(null);
  };

  /** Ends every session, e.g. after signing in on a machine you do not own. */
  const signOutEverywhere = async () => {
    setBusy(true);
    const result = await logoutEverywhere();
    setBusy(false);
    setMode("signin");
    done(result.message);
  };

  const fieldBase =
    "w-full border border-line py-3 pl-11 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary";
  const field = fieldBase + " pr-4";
  /** Leaves room on the right for the show/hide button. */
  const fieldWithToggle = fieldBase + " pr-12";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted";
  const primaryButton =
    "w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";

  const HEADINGS = {
    signin: "Sign In",
    register: "Create Account",
    forgot: "Reset Password",
    reset: "New Password",
  };

  const heading = isAuthenticated
    ? "My Account"
    : HEADINGS[mode] || "Sign In";

  // An expired session opens this panel on its own, so it has to say why.
  // Anything the user does next replaces it with a live notice.
  const shownNotice =
    notice || (sessionExpired ? { type: "error", text: sessionExpired } : null);

  const noticeBox = shownNotice && (
    <div
      role="status"
      className={
        "mt-5 flex gap-3 border-l-[3px] bg-surface p-4 " +
        (shownNotice.type === "error" ? "border-primary" : "border-secondary")
      }
    >
      {shownNotice.type === "error" ? (
        <AlertCircle
          size={17}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-primary"
        />
      ) : (
        <CheckCircle2
          size={17}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-secondary"
        />
      )}
      <p className="text-[13px] leading-6 text-ink-soft">{shownNotice.text}</p>
    </div>
  );

  return (
    <div
      className={"fixed inset-0 z-[70] " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        aria-label="Close account panel"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={
          "absolute inset-0 bg-ink/60 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      <aside
        role="dialog"
        aria-label="Account"
        className={
          "absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[1.5px] text-ink">
            <UserCircle size={18} strokeWidth={2} className="text-primary" />
            {heading}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close account panel"
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {restoring ? (
            <p className="py-10 text-center text-[13px] text-muted">
              Checking your session…
            </p>
          ) : isAuthenticated ? (
            /* ================= Signed in ================= */
            <div>
              <div className="flex items-center gap-4 border border-line p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-[16px] font-bold text-primary-foreground">
                  {user.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-bold text-ink">
                    {user.name}
                  </p>
                  <p className="truncate text-[13px] text-muted">{user.email}</p>
                  {user.isVerified ? (
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-primary">
                      <BadgeCheck size={14} strokeWidth={2} />
                      Verified
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-muted">
                      <ShieldAlert size={14} strokeWidth={2} />
                      Not verified
                    </p>
                  )}
                </div>
              </div>

              {/* ---------------- Verify email ---------------- */}
              {!user.isVerified && (
                <div className="mt-4 border border-line bg-surface p-5">
                  <p className="text-[13px] leading-6 text-ink-soft">
                    Verify your email address so we can reach you about your
                    orders.
                  </p>

                  {!verifySent ? (
                    <button
                      onClick={requestVerification}
                      disabled={busy}
                      tabIndex={open ? 0 : -1}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-line bg-white py-3 text-[12px] font-semibold tracking-[1.5px] text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      <BadgeCheck size={15} strokeWidth={2} />
                      {busy ? "SENDING…" : "SEND VERIFICATION"}
                    </button>
                  ) : (
                    <form onSubmit={submitVerification} className="mt-4">
                      <div className="relative">
                        <KeyRound
                          size={17}
                          strokeWidth={1.8}
                          className={iconClass}
                        />
                        <input
                          type="text"
                          required
                          value={verifyToken}
                          onChange={(e) => setVerifyToken(e.target.value)}
                          placeholder="Verification code"
                          aria-label="Verification code"
                          tabIndex={open ? 0 : -1}
                          className={field + " bg-white"}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy}
                        tabIndex={open ? 0 : -1}
                        className={primaryButton + " mt-3"}
                      >
                        {busy ? "VERIFYING…" : "VERIFY EMAIL"}
                      </button>
                      <button
                        type="button"
                        onClick={requestVerification}
                        disabled={busy}
                        tabIndex={open ? 0 : -1}
                        className="mt-3 w-full text-[12px] text-primary hover:underline disabled:opacity-60"
                      >
                        Send another code
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="mt-6 grid grid-cols-2 border border-line">
                {[
                  ["profile", "PROFILE"],
                  ["password", "PASSWORD"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setTab(id);
                      setNotice(null);
                    }}
                    tabIndex={open ? 0 : -1}
                    className={
                      "py-3 text-[12px] font-semibold tracking-[1.5px] transition-colors " +
                      (tab === id
                        ? "bg-primary text-primary-foreground"
                        : "text-ink-soft hover:text-primary")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ---------------- Profile ---------------- */}
              {tab === "profile" && (
                <form onSubmit={saveProfile} className="mt-6 space-y-4">
                  <div className="relative">
                    <User size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={profile.name}
                      onChange={setProfileField("name")}
                      placeholder="Full name"
                      aria-label="Full name"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Phone size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={setProfileField("phone")}
                      placeholder="Phone number"
                      aria-label="Phone number"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Mail size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      aria-label="Email address"
                      tabIndex={-1}
                      className={
                        field + " cursor-not-allowed bg-surface text-muted"
                      }
                    />
                  </div>
                  <p className="text-[12px] leading-5 text-muted">
                    Your email address cannot be changed here.
                  </p>

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={open ? 0 : -1}
                    className={primaryButton}
                  >
                    {busy ? "SAVING…" : "SAVE CHANGES"}
                  </button>
                </form>
              )}

              {/* ---------------- Change password ---------------- */}
              {tab === "password" && (
                <form onSubmit={submitPassword} className="mt-6 space-y-4">
                  <div className="relative">
                    <Lock size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={setPasswordField("currentPassword")}
                      autoComplete="current-password"
                      placeholder="Current password"
                      aria-label="Current password"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={setPasswordField("newPassword")}
                      autoComplete="new-password"
                      placeholder="New password"
                      aria-label="New password"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="password"
                      required
                      value={passwords.confirmPassword}
                      onChange={setPasswordField("confirmPassword")}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      aria-label="Confirm new password"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <p className="text-[12px] leading-5 text-muted">
                    Changing your password signs you out of every device.
                  </p>

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={open ? 0 : -1}
                    className={primaryButton}
                  >
                    {busy ? "CHANGING…" : "CHANGE PASSWORD"}
                  </button>
                </form>
              )}

              {noticeBox}

              <Link
                href="/orders"
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-secondary py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Package size={15} strokeWidth={2} />
                MY ORDERS
              </Link>

              <button
                onClick={signOut}
                disabled={busy}
                tabIndex={open ? 0 : -1}
                className="mt-3 flex w-full items-center justify-center gap-2 border border-line py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
              >
                <LogOut size={15} strokeWidth={2} />
                {busy ? "SIGNING OUT…" : "SIGN OUT"}
              </button>

              {/* Ends the session everywhere, not just in this browser. */}
              <button
                onClick={signOutEverywhere}
                disabled={busy}
                tabIndex={open ? 0 : -1}
                className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-[12px] font-medium text-muted transition-colors hover:text-primary disabled:opacity-60"
              >
                <MonitorSmartphone size={15} strokeWidth={1.8} />
                Sign out on all devices
              </button>
            </div>
          ) : (
            /* ================= Signed out ================= */
            <>
              {(mode === "signin" || mode === "register") && (
                <>
              {/* Tabs */}
              <div className="grid grid-cols-2 border border-line">
                {["signin", "register"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setNotice(null);
                    }}
                    tabIndex={open ? 0 : -1}
                    className={
                      "py-3 text-[12px] font-semibold tracking-[1.5px] transition-colors " +
                      (mode === m
                        ? "bg-primary text-primary-foreground"
                        : "text-ink-soft hover:text-primary")
                    }
                  >
                    {m === "signin" ? "SIGN IN" : "REGISTER"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "register" && (
                  <div className="relative">
                    <User size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={set("name")}
                      autoComplete="name"
                      placeholder="Full name"
                      aria-label="Full name"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={17} strokeWidth={1.8} className={iconClass} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    placeholder="Email address"
                    aria-label="Email address"
                    tabIndex={open ? 0 : -1}
                    className={field}
                  />
                </div>

                <div className="relative">
                  <Lock size={17} strokeWidth={1.8} className={iconClass} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={set("password")}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    placeholder="Password"
                    aria-label="Password"
                    tabIndex={open ? 0 : -1}
                    className={fieldWithToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    tabIndex={open ? 0 : -1}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff size={17} strokeWidth={1.8} />
                    ) : (
                      <Eye size={17} strokeWidth={1.8} />
                    )}
                  </button>
                </div>

                {mode === "signin" && (
                  <div className="flex items-center justify-between text-[13px]">
                    <label className="flex cursor-pointer items-center gap-2 text-muted">
                      <input
                        type="checkbox"
                        tabIndex={open ? 0 : -1}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        // Carry over whatever they already typed.
                        setReset((current) => ({
                          ...current,
                          email: current.email || form.email,
                        }));
                        go("forgot");
                      }}
                      tabIndex={open ? 0 : -1}
                      className="text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  tabIndex={open ? 0 : -1}
                  className={primaryButton}
                >
                  {busy
                    ? mode === "signin"
                      ? "SIGNING IN…"
                      : "CREATING ACCOUNT…"
                    : mode === "signin"
                      ? "SIGN IN"
                      : "CREATE ACCOUNT"}
                </button>
              </form>
                </>
              )}

              {/* ---------------- Forgot password ---------------- */}
              {mode === "forgot" && (
                <form onSubmit={requestReset} className="space-y-4">
                  <p className="text-[13px] leading-6 text-muted">
                    Enter the email address on your account and we will send you
                    a code to set a new password.
                  </p>

                  <div className="relative">
                    <Mail size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="email"
                      required
                      value={reset.email}
                      onChange={setResetField("email")}
                      autoComplete="email"
                      placeholder="Email address"
                      aria-label="Email address"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={open ? 0 : -1}
                    className={primaryButton}
                  >
                    {busy ? "SENDING…" : "SEND RESET CODE"}
                  </button>

                  <div className="flex items-center justify-between text-[13px]">
                    <button
                      type="button"
                      onClick={() => go("signin")}
                      tabIndex={open ? 0 : -1}
                      className="flex items-center gap-1.5 text-muted hover:text-primary"
                    >
                      <ArrowLeft size={14} strokeWidth={2} />
                      Back to sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => go("reset")}
                      tabIndex={open ? 0 : -1}
                      className="text-primary hover:underline"
                    >
                      I already have a code
                    </button>
                  </div>
                </form>
              )}

              {/* ---------------- Set a new password ---------------- */}
              {mode === "reset" && (
                <form onSubmit={submitReset} className="space-y-4">
                  <p className="text-[13px] leading-6 text-muted">
                    Paste the reset code you received, then choose a new
                    password. The code is good for 15 minutes.
                  </p>

                  <div className="relative">
                    <KeyRound
                      size={17}
                      strokeWidth={1.8}
                      className={iconClass}
                    />
                    <input
                      type="text"
                      required
                      value={reset.token}
                      onChange={setResetField("token")}
                      placeholder="Reset code"
                      aria-label="Reset code"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="password"
                      required
                      value={reset.password}
                      onChange={setResetField("password")}
                      autoComplete="new-password"
                      placeholder="New password"
                      aria-label="New password"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={17} strokeWidth={1.8} className={iconClass} />
                    <input
                      type="password"
                      required
                      value={reset.confirmPassword}
                      onChange={setResetField("confirmPassword")}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      aria-label="Confirm new password"
                      tabIndex={open ? 0 : -1}
                      className={field}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    tabIndex={open ? 0 : -1}
                    className={primaryButton}
                  >
                    {busy ? "SAVING…" : "SET NEW PASSWORD"}
                  </button>

                  <button
                    type="button"
                    onClick={() => go("forgot")}
                    tabIndex={open ? 0 : -1}
                    className="flex items-center gap-1.5 text-[13px] text-muted hover:text-primary"
                  >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Send the code again
                  </button>
                </form>
              )}

              {noticeBox}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
