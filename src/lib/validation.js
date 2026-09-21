// ---------------------------------------------------------------------------
// Form validation shared by the contact form and the register form.
//
// Every `validate*` takes the raw field value and returns an error message, or
// "" when the value is fine. The `clean*` helpers are for onChange: they strip
// whatever a field must never contain, so the rules hold while typing and
// after a paste, not only when the form is submitted.
//
// The backend repeats the same rules for the contact form (contact.controller)
// — it cannot trust the browser — so change them in both places together.
// ---------------------------------------------------------------------------

const str = (value) => String(value ?? "");

// ---- Name -----------------------------------------------------------------

// Letters of any script (\p{M} = the combining marks Devanagari and similar
// scripts write vowels with), single spaces between words.
const NAME_STRICT = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
// Registration also takes the punctuation real surnames carry: D'Souza,
// Mary-Ann, Dr. Rao.
const NAME_WITH_PUNCTUATION = /^[\p{L}\p{M}][\p{L}\p{M}.'’-]*(?: [\p{L}\p{M}.'’-]+)*$/u;

/** Anything a name field must never hold in `strict` mode. */
export const NAME_REJECTED = /[^\p{L}\p{M}\s]/u;

/**
 * Keeps only letters and single spaces — digits and symbols are dropped, runs
 * of spaces collapse, and there is no leading space. A trailing space stays,
 * because the next word is about to follow it.
 */
export const cleanName = (value) =>
  str(value)
    .replace(/[^\p{L}\p{M}\s]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^ /, "");

/**
 * @param {string} value
 * @param {{ allowPunctuation?: boolean }} [options] letters and spaces only by
 *        default; `allowPunctuation` also permits . ' - for account names.
 */
export function validateName(value, { allowPunctuation = false } = {}) {
  const name = str(value).trim().replace(/\s+/g, " ");

  if (!name) return "Please enter your name.";

  const pattern = allowPunctuation ? NAME_WITH_PUNCTUATION : NAME_STRICT;
  if (!pattern.test(name)) {
    return allowPunctuation
      ? "Name can only contain letters, spaces and . ' -"
      : "Name can only contain letters and spaces.";
  }

  if (name.length < 2) return "Name must be at least 2 letters.";
  if (name.length > 100) return "Name cannot be longer than 100 characters.";
  return "";
}

// ---- Email ----------------------------------------------------------------

// local@domain.tld — letters, digits and ._%+- before the @, dot-separated
// labels after it (none starting or ending with a hyphen), and a TLD of at
// least two letters.
const EMAIL =
  /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/** Email addresses hold no whitespace at all. */
export const cleanEmail = (value) => str(value).replace(/\s/g, "");

export function validateEmail(value) {
  const email = str(value).trim();

  if (!email) return "Please enter your email address.";
  if (email.length > 254) return "That email address is too long.";

  const local = email.split("@")[0];
  if (
    !EMAIL.test(email) ||
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    email.includes("..")
  ) {
    return "Enter a valid email address, like name@example.com.";
  }

  return "";
}

// ---- Message --------------------------------------------------------------

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 1000;

/**
 * One space between words: a run of spaces or tabs collapses to a single
 * space, and there is nothing before the first word. Line breaks are kept.
 */
export const cleanMessage = (value) =>
  str(value)
    .replace(/[^\S\r\n]{2,}/g, " ")
    .replace(/^\s+/, "");

export function validateMessage(value) {
  const text = cleanMessage(value).trim();

  if (!text) return "Please write your message.";
  if (text.length < MESSAGE_MIN) {
    return `Message must be at least ${MESSAGE_MIN} characters.`;
  }
  if (text.length > MESSAGE_MAX) {
    return `Message cannot be longer than ${MESSAGE_MAX} characters.`;
  }
  if (!/\p{L}/u.test(text)) return "Please write your message in words.";
  return "";
}

// ---- Password (new accounts) ----------------------------------------------

export const PASSWORD_MIN = 8;
// bcrypt only looks at the first 72 bytes, so anything past that adds nothing.
export const PASSWORD_MAX = 72;

/** For choosing a password. Signing in only checks that one was entered. */
export function validateNewPassword(value) {
  const password = str(value);

  if (!password) return "Please choose a password.";
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password cannot be longer than ${PASSWORD_MAX} characters.`;
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return "Password needs at least one letter and one number.";
  }
  return "";
}
