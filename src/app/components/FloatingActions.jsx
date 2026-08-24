"use client";

import { Phone } from "lucide-react";
import { WhatsAppIcon, whatsappHref } from "./BrandIcons";
import useFooterOffset from "../hooks/useFooterOffset";

const PHONE = "+917400181786";

/**
 * Floating contact stack pinned to the right edge, above the back-to-top
 * button. Sitewide, so a customer can reach you from any page.
 */
export default function FloatingActions() {
  const footerOffset = useFooterOffset();

  const actions = [
    {
      label: "Chat on WhatsApp",
      href: whatsappHref(
        "Hi ChoiceKraft, I would like to know more about your stationery range."
      ),
      external: true,
      Icon: WhatsAppIcon,
      className: "bg-[#25D366] hover:bg-[#1da851]",
    },
    {
      label: "Call us",
      href: "tel:" + PHONE,
      external: false,
      Icon: Phone,
      className: "bg-primary hover:bg-primary-hover",
    },
  ];

  return (
    <div
      style={{ marginBottom: footerOffset }}
      className="fixed bottom-28 right-5 z-50 flex flex-col gap-3 lg:bottom-32 lg:right-6"
    >
      {actions.map(({ label, href, external, Icon, className }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          title={label}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={
            "group/fab relative flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 lg:h-[56px] lg:w-[56px] " +
            className
          }
        >
          <Icon size={24} strokeWidth={2} className="h-6 w-6" />

          {/* Label slides out on hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-full mr-3 hidden translate-x-2 whitespace-nowrap bg-ink px-3 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-white opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover/fab:translate-x-0 group-hover/fab:opacity-100 lg:block"
          >
            {label}
            <span className="absolute right-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink" />
          </span>
        </a>
      ))}
    </div>
  );
}
