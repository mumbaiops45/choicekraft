import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { WhatsAppIcon, InstagramIcon, whatsappHref } from "./BrandIcons";
import BackToTopButton from "./BackToTopButton";

const trust = [
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: RotateCcw, label: "Easy Returns" },
];

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "Note Books", href: "/notebooks" },
  { name: "About Us", href: "/products/about" },
  { name: "Contact Us", href: "/products/contact" },
];

const policies = [
  { name: "FAQs", href: "/policies/faqs" },
  { name: "Privacy Policy", href: "/policies/privacy-policy" },
  {
    name: "Return, Refund & Cancellation Policy",
    href: "/policies/return-and-refund-policy",
  },
  { name: "Shipping Policy", href: "/policies/shipping-policy" },
];

const socials = [
  {
    name: "WhatsApp",
    href: whatsappHref("Hi ChoiceKraft, I have a question about your products."),
    Icon: WhatsAppIcon,
    hover: "hover:bg-[#25D366] hover:border-[#25D366]",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    Icon: InstagramIcon,
    hover: "hover:bg-[#E1306C] hover:border-[#E1306C]",
  },
];

export default function Footer() {
  return (
    <footer data-site-footer className="relative bg-ink text-white">
      {/* Pink hairline across the top */}
      <span aria-hidden="true" className="block h-[3px] w-full bg-primary" />

      <div className="mx-auto max-w-[1510px] px-6 py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1.3fr] lg:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="ChoiceKraft"
                className="h-[52px] w-auto object-contain"
              />
              <span className="flex flex-col">
                <span className="text-[21px] font-bold leading-none">
                  ChoiceKraft
                </span>
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[1.2px] text-primary">
                  Right choice to success
                </span>
              </span>
            </div>

            <p className="mt-6 max-w-[330px] leading-7 text-white/60">
              ChoiceKraft is your trusted destination for affordable and
              high-quality stationery products across India.
            </p>

            <ul className="mt-7 space-y-3">
              {trust.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Icon size={14} strokeWidth={2} className="text-primary" />
                  </span>
                  <span className="text-[14px] text-white/75">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-[2px]">
              Quick Links
            </h3>
            <span className="mt-3 block h-[2px] w-9 bg-primary" />

            <ul className="mt-6 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-white/60 transition-colors hover:text-primary"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-[2px]">
              Policies
            </h3>
            <span className="mt-3 block h-[2px] w-9 bg-primary" />

            <ul className="mt-6 space-y-3">
              {policies.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-white/60 transition-colors hover:text-primary"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold uppercase tracking-[2px]">
              Contact
            </h3>
            <span className="mt-3 block h-[2px] w-9 bg-primary" />

            <ul className="mt-6 space-y-4 text-white/60">
              <li className="flex gap-3">
                <Mail size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-primary" />
                <a
                  href="mailto:support@choicekraft.com"
                  className="break-all transition-colors hover:text-primary"
                >
                  support@choicekraft.com
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-primary" />
                <a
                  href="tel:+917400181786"
                  className="transition-colors hover:text-primary"
                >
                  +91 74001 81786
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-primary" />
                <span>Maharashtra, India</span>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-7 flex gap-3">
              {socials.map(({ name, href, Icon, hover }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:text-white " +
                    hover
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <form className="mt-7 flex">
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address for newsletter"
                className="min-w-0 flex-1 border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex w-14 shrink-0 items-center justify-center bg-primary transition-colors hover:bg-primary-hover"
              >
                <Send size={17} strokeWidth={2} />
              </button>
            </form>

            {/* Back to top, tucked into the spare room beside the contact details */}
            <BackToTopButton className="mt-8 self-start sm:ml-auto" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1510px] flex-col items-center gap-3 px-6 py-6 text-sm sm:flex-row sm:justify-between">
          <p className="text-white/45">
            © {new Date().getFullYear()} ChoiceKraft. All rights reserved.
          </p>

          <p className="flex items-center gap-1 text-sm text-white/45">
            Designed and developed by{" "}
            <Link
              href="https://nakshatranamahacreations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-primary transition-all duration-300 hover:underline"
            >
              Nakshatra Namaha Creations
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
