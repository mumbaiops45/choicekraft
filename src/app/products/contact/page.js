import { Clock, Mail, Phone } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Reveal from "../../components/Reveal";
import { CONTACT } from "../../data/policies";

export const metadata = {
  title: "Contact | ChoiceKraft",
};

const reachOut = [
  {
    label: "Call us",
    Icon: Phone,
    value: CONTACT.phone,
    href: CONTACT.phoneHref,
  },
  {
    label: "Opening hours",
    Icon: Clock,
    value: "10:00 – 20:00",
    note: "Monday – Sunday",
  },
  {
    label: "Email us",
    Icon: Mail,
    value: CONTACT.email,
    href: "mailto:" + CONTACT.email,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" crumb="CONTACT" />

      {/* Reach out band — the quick-answer channels, kept separate from the
          longer "get in touch" copy and the message form below. */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1100px] px-6 py-14 lg:py-16">
          <Reveal className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[2.5px] text-primary">
              Contact us
            </p>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-[1px] text-ink lg:text-3xl">
              Do you have some questions?
            </h2>
            <span className="mx-auto mt-4 block h-[2px] w-12 bg-primary" />
            <p className="mt-4 leading-8 text-muted">
              Reach out to us 7 days a week!
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {reachOut.map(({ label, Icon, value, href, note }, i) => (
              <Reveal key={label} delay={i * 70}>
                <div className="flex h-full flex-col items-center border border-line bg-white px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_18px_38px_rgba(0,0,0,0.10)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon size={20} strokeWidth={1.9} className="text-primary" />
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[2px] text-muted">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-2 break-all text-[17px] font-semibold text-ink transition-colors hover:text-primary"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-2 text-[17px] font-semibold text-ink">
                      {value}
                    </p>
                  )}
                  {note && (
                    <p className="mt-1 text-[13px] text-muted">{note}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1100px] gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[1px] text-ink">
            Get in touch
          </h2>
          <p className="mt-4 leading-8 text-muted">
            Questions about an order, a product or a bulk enquiry? Send us a
            message and we will reply within one working day.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold uppercase tracking-[1px] text-ink">
                Address
              </dt>
              <dd className="mt-1 text-muted">Maharashtra, India</dd>
            </div>
          </dl>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <input
            type="email"
            placeholder="Your email"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <textarea
            rows={6}
            placeholder="Your message"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary px-8 py-3 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            SEND MESSAGE
          </button>
        </form>
      </section>
    </>
  );
}
