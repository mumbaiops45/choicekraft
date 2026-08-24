import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Reveal from "../../components/Reveal";
import FaqAccordion from "../../components/FaqAccordion";
import {
  policies,
  policyList,
  LAST_UPDATED,
  CONTACT,
} from "../../data/policies";

export function generateStaticParams() {
  return policyList.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = policyList.find((p) => p.slug === slug);

  return {
    title: entry ? entry.title + " | ChoiceKraft" : "ChoiceKraft",
  };
}

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const entry = policyList.find((p) => p.slug === slug);

  if (!entry) notFound();

  const isFaq = slug === "faqs";
  const policy = policies[slug];

  const intro = isFaq
    ? "Answers to the questions we are asked most often about ordering, delivery, bulk supply and returns."
    : policy.intro;

  return (
    <>
      <PageHeader title={entry.title} crumb={entry.title.toUpperCase()} />

      <div className="mx-auto max-w-[1510px] px-6 py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_280px] lg:gap-16">
          {/* Content */}
          <div className="max-w-[760px]">
            <Reveal>
              <p className="text-[13px] tracking-[1px] text-muted">
                Last updated: {LAST_UPDATED}
              </p>
              <p className="mt-5 text-[17px] leading-9 text-ink-soft">{intro}</p>
            </Reveal>

            <div className="mt-12">
              {isFaq ? (
                <FaqAccordion />
              ) : (
                <div className="space-y-11">
                  {policy.sections.map((section, i) => (
                    <Reveal key={section.heading} delay={(i % 4) * 60}>
                      <section>
                        <h2 className="text-[19px] font-bold uppercase tracking-[0.5px] text-ink lg:text-[21px]">
                          {section.heading}
                        </h2>
                        <span className="mt-3 block h-[2px] w-9 bg-primary" />

                        {section.body?.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mt-5 leading-8 text-muted"
                          >
                            {paragraph}
                          </p>
                        ))}

                        {section.list && (
                          <ul className="mt-5 space-y-3">
                            {section.list.map((point) => (
                              <li key={point} className="flex gap-3">
                                <Check
                                  size={17}
                                  strokeWidth={2.4}
                                  className="mt-1.5 shrink-0 text-primary"
                                />
                                <span className="leading-8 text-muted">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Still stuck */}
            <Reveal>
              <div className="mt-14 border-l-[3px] border-primary bg-surface p-7 lg:p-8">
                <h2 className="text-[16px] font-bold uppercase tracking-[1px] text-ink">
                  Still need help?
                </h2>
                <p className="mt-3 leading-8 text-muted">
                  If this page does not answer your question, write to us and a
                  real person will reply — usually within one working day.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={"mailto:" + CONTACT.email}
                    className="inline-flex items-center gap-2.5 bg-primary px-7 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    <Mail size={15} strokeWidth={2} />
                    EMAIL US
                  </a>
                  <Link
                    href="/products/contact"
                    className="inline-flex items-center border-2 border-secondary px-7 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    CONTACT PAGE
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white p-6">
              <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                Policies
              </h2>
              <span className="mt-3 block h-[2px] w-9 bg-primary" />

              <ul className="mt-5 space-y-2.5">
                {policyList.map((other) => {
                  const active = other.slug === slug;
                  return (
                    <li key={other.slug}>
                      <Link
                        href={"/policies/" + other.slug}
                        className={
                          "block text-[14px] transition-colors " +
                          (active
                            ? "font-semibold text-primary"
                            : "text-ink-soft hover:text-primary")
                        }
                      >
                        {other.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 border border-line bg-white p-6">
              <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                Contact
              </h2>
              <span className="mt-3 block h-[2px] w-9 bg-primary" />

              <ul className="mt-5 space-y-4 text-[14px] text-muted">
                <li className="flex gap-3">
                  <Mail size={16} strokeWidth={1.8} className="mt-1 shrink-0 text-primary" />
                  <a
                    href={"mailto:" + CONTACT.email}
                    className="break-all transition-colors hover:text-primary"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone size={16} strokeWidth={1.8} className="mt-1 shrink-0 text-primary" />
                  <a
                    href={CONTACT.phoneHref}
                    className="transition-colors hover:text-primary"
                  >
                    {CONTACT.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <MapPin size={16} strokeWidth={1.8} className="mt-1 shrink-0 text-primary" />
                  <span>{CONTACT.place}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
