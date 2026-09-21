"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import FieldError from "./FieldError";
import {
  MESSAGE_MAX,
  NAME_REJECTED,
  cleanEmail,
  cleanMessage,
  cleanName,
  validateEmail,
  validateMessage,
  validateName,
} from "@/lib/validation";

// How long the thank-you stays before the form comes back on its own. The
// "Send another message" button brings it back sooner.
const THANK_YOU_MS = 60_000;

const EMPTY = { name: "", email: "", message: "" };

const VALIDATORS = {
  name: validateName,
  email: validateEmail,
  message: validateMessage,
};

const inputClass =
  "w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary aria-invalid:border-danger";

const labelClass = "mb-1.5 block text-[13px] font-semibold text-ink-soft";

/**
 * The contact page's message form.
 *
 * Each field is kept clean as it is typed — the name takes letters and single
 * spaces only, the message never holds a double space, the email no whitespace
 * — and checked again on blur and on submit. Once everything is valid the form
 * is replaced by a thank-you, and comes back after a minute.
 *
 * NOTE: nothing is sent anywhere yet. Delivery (an email, an inbox in the admin
 * panel, ...) is deliberately not wired up; when it is, it belongs in `submit`
 * below, before `setSent`.
 */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  // Set once the form is accepted; holds who to thank.
  const [sent, setSent] = useState(null);

  const thanksRef = useRef(null);
  // Fields showing a "that character is not allowed" note. It is kept until the
  // field is left; clearing it on the very next key press would make it a
  // flicker nobody could read.
  const held = useRef({});

  // The thank-you gives way to the form again after a while.
  useEffect(() => {
    if (!sent) return;
    thanksRef.current?.focus();
    const timer = setTimeout(() => setSent(null), THANK_YOU_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  const change = (key, clean) => (e) => {
    const field = e.target;
    const raw = field.value;
    const caret = field.selectionStart;
    const next = clean(raw);

    setValues((current) => ({ ...current, [key]: next }));

    if (key === "name" && NAME_REJECTED.test(raw)) {
      // A digit or symbol was dropped. Say why, so the key press does not
      // just seem to do nothing.
      held.current.name = true;
      setErrors((current) => ({
        ...current,
        name: "Name can only contain letters and spaces.",
      }));
    } else if (errors[key] && !held.current[key]) {
      // Already flagged: re-check as they type so it clears the moment the
      // value is right, rather than waiting for the next blur.
      setErrors((current) => ({ ...current, [key]: VALIDATORS[key](next) }));
    }

    // Rewriting the value makes the browser drop the caret at the end, which
    // is wrong when the edit was in the middle of the text. Put it back.
    if (next !== raw && caret !== null) {
      const at = Math.max(0, caret - (raw.length - next.length));
      requestAnimationFrame(() => {
        try {
          field.setSelectionRange(at, at);
        } catch {
          // A field type that has no caret — nothing to restore.
        }
      });
    }
  };

  const blur = (key) => () => {
    held.current[key] = false;
    setErrors((current) => ({ ...current, [key]: VALIDATORS[key](values[key]) }));
  };

  const submit = (e) => {
    e.preventDefault();
    held.current = {};

    const found = {};
    for (const key of Object.keys(VALIDATORS)) {
      const problem = VALIDATORS[key](values[key]);
      if (problem) found[key] = problem;
    }
    setErrors(found);

    const first = Object.keys(found)[0];
    if (first) {
      e.currentTarget.elements[first]?.focus();
      return;
    }

    setSent({ name: values.name.trim(), email: values.email.trim() });
    setValues(EMPTY);
  };

  if (sent) {
    const firstName = sent.name.split(" ")[0];

    return (
      <div
        ref={thanksRef}
        role="status"
        tabIndex={-1}
        className="flex flex-col items-center border border-brandteal-300 bg-brandteal-100 px-6 py-12 text-center outline-none"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
          <CheckCircle2
            size={30}
            strokeWidth={1.8}
            className="text-brandteal-700"
          />
        </span>
        <h3 className="mt-5 text-xl font-bold uppercase tracking-[1px] text-brandteal-700">
          Thank you, {firstName}!
        </h3>
        <p className="mt-3 max-w-[340px] leading-7 text-ink-soft">
          We will reply to{" "}
          <span className="break-all font-semibold text-ink">{sent.email}</span>{" "}
          within one working day.
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-7 border-2 border-brandteal-700 px-7 py-3 text-[12px] font-semibold tracking-[2px] text-brandteal-700 transition-colors hover:bg-brandteal-700 hover:text-white"
        >
          SEND ANOTHER MESSAGE
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={values.name}
          onChange={change("name", cleanName)}
          onBlur={blur("name")}
          autoComplete="name"
          maxLength={100}
          required
          aria-required="true"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={inputClass}
        />
        <FieldError id="contact-name-error">{errors.name}</FieldError>
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Your email
        </label>
        {/* type="text" + inputMode: type="email" fields have no caret to
            restore after the whitespace is stripped. */}
        <input
          id="contact-email"
          name="email"
          type="text"
          inputMode="email"
          value={values.email}
          onChange={change("email", cleanEmail)}
          onBlur={blur("email")}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          required
          aria-required="true"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={inputClass}
        />
        <FieldError id="contact-email-error">{errors.email}</FieldError>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Your message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={values.message}
          onChange={change("message", cleanMessage)}
          onBlur={blur("message")}
          maxLength={MESSAGE_MAX}
          required
          aria-required="true"
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={inputClass}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <FieldError id="contact-message-error">{errors.message}</FieldError>
          </div>
          <p className="mt-1.5 shrink-0 text-[12px] tabular-nums text-muted">
            {values.message.length}/{MESSAGE_MAX}
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="bg-primary px-8 py-3 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        SEND MESSAGE
      </button>
    </form>
  );
}
