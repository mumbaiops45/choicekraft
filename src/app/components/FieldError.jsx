import { AlertCircle } from "lucide-react";

/**
 * The message shown under a form field that failed validation. Renders nothing
 * while the field is fine. Point the input's aria-describedby at `id` so screen
 * readers announce it with the field.
 */
export default function FieldError({ id, children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-5 text-danger"
    >
      <AlertCircle size={13} strokeWidth={2.2} className="mt-[3px] shrink-0" />
      {children}
    </p>
  );
}
