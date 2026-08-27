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
} from "lucide-react";
import { useAuth } from "../store/AuthStore";
import { changePassword, updateMyProfile } from "@/lib/services/authService";

/**
 * Account drawer.
 *
 * Signed out: sign in / register.
 * Signed in:  profile and change password. The wishlist has its own
 *             drawer, opened from the navbar heart.
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
    authedCall,
    reloadUser,
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

  const signOut = async () => {
    setBusy(true);
    await logout();
    setBusy(false);
    setMode("signin");
    setNotice(null);
  };

  const field =
    "w-full border border-line py-3 pl-11 pr-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted";
  const primaryButton =
    "w-full bg-primary py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60";

  const heading = isAuthenticated
    ? "My Account"
    : mode === "signin"
      ? "Sign In"
      : "Create Account";

  const noticeBox = notice && (
    <div
      role="status"
      className={
        "mt-5 flex gap-3 border-l-[3px] bg-surface p-4 " +
        (notice.type === "error" ? "border-primary" : "border-secondary")
      }
    >
      {notice.type === "error" ? (
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
      <p className="text-[13px] leading-6 text-ink-soft">{notice.text}</p>
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
                  {user.isVerified && (
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-primary">
                      <BadgeCheck size={14} strokeWidth={2} />
                      Verified
                    </p>
                  )}
                </div>
              </div>

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
            </div>
          ) : (
            /* ================= Signed out ================= */
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
                    type="password"
                    required
                    value={form.password}
                    onChange={set("password")}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    placeholder="Password"
                    aria-label="Password"
                    tabIndex={open ? 0 : -1}
                    className={field}
                  />
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

              {noticeBox}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
