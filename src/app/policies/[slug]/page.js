import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin, Check, ChevronRight } from "lucide-react";
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

/** Heading -> anchor id, so the contents list can jump to a section. */
function anchorFor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const num = (i) => String(i + 1).padStart(2, "0");

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const entry = policyList.find((p) => p.slug === slug);

  if (!entry) notFound();

  const isFaq = slug === "faqs";
  const policy = policies[slug];
  const sections = isFaq ? [] : policy.sections;

  const intro = isFaq
    ? "Answers to the questions we are asked most often about ordering, delivery, bulk supply and returns."
    : policy.intro;

  return (
    <>
      <PageHeader title={entry.title} crumb={entry.title.toUpperCase()} />

      {/* Narrower than the 1510px site container: prose wants a readable
          measure, and at full width the column left a dead gap beside it. */}
      <div className="mx-auto max-w-[1180px] px-6 py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_290px] lg:gap-14">
          {/* Content */}
          <div className="min-w-0">
            {/* Intro panel */}
            <Reveal>
              <div className="border border-line border-l-[3px] border-l-primary bg-surface p-7 lg:p-9">
                <span className="inline-block bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">
                  Last updated {LAST_UPDATED}
                </span>
                <p className="mt-5 text-[17px] leading-9 text-ink-soft lg:text-[18px]">
                  {intro}
                </p>
              </div>
            </Reveal>

            <div className="mt-10">
              {isFaq ? (
                <FaqAccordion />
              ) : (
                <div className="space-y-6">
                  {sections.map((section, i) => (
                    <Reveal key={section.heading} delay={(i % 4) * 60}>
                      <section
                        id={anchorFor(section.heading)}
                        className="border border-line bg-white p-7 transition-all duration-300 hover:border-transparent hover:shadow-[0_18px_38px_rgba(0,0,0,0.08)] lg:p-9"
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-[13px] font-bold tracking-[0.5px] text-primary-foreground">
                            {num(i)}
                          </span>
                          <h2 className="text-[18px] font-bold uppercase tracking-[0.5px] text-ink lg:text-[20px]">
                            {section.heading}
                          </h2>
                        </div>

                        {section.body?.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mt-5 leading-8 text-muted"
                          >
                            {paragraph}
                          </p>
                        ))}

                        {section.list && (
                          <ul className="mt-5 space-y-2">
                            {section.list.map((point) => (
                              <li
                                key={point}
                                className="flex gap-3 border-b border-line-soft pb-2.5 last:border-0 last:pb-0"
                              >
                                <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10">
                                  <Check
                                    size={13}
                                    strokeWidth={3}
                                    className="text-primary"
                                  />
                                </span>
                                <span className="leading-8 text-muted">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.outro?.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mt-5 border-l-2 border-line pl-4 text-[15px] italic leading-8 text-muted"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </section>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Still stuck */}
            <Reveal>
              <div className="mt-10 bg-ink p-8 text-white lg:p-10">
                <h2 className="text-[17px] font-bold uppercase tracking-[1px]">
                  Still need help?
                </h2>
                <span className="mt-3 block h-[2px] w-9 bg-primary" />
                <p className="mt-4 max-w-[520px] leading-8 text-white/60">
                  If this page does not answer your question, write to us and a
                  real person will reply — usually within one working day.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={"mailto:" + CONTACT.email}
                    className="inline-flex items-center gap-2.5 bg-primary px-7 py-3.5 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    <Mail size={15} strokeWidth={2} />
                    EMAIL US
                  </a>
                  <Link
                    href="/products/contact"
                    className="inline-flex items-center border border-white/25 px-7 py-3.5 text-[12px] font-semibold tracking-[2px] text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
                  >
                    CONTACT PAGE
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {/* On this page */}
            {sections.length > 0 && (
              <nav
                aria-label="On this page"
                className="mb-6 hidden border border-line bg-white p-6 lg:block"
              >
                <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                  On this page
                </h2>
                <span className="mt-3 block h-[2px] w-9 bg-primary" />

                <ol className="mt-5 space-y-2.5">
                  {sections.map((section, i) => (
                    <li key={section.heading}>
                      <a
                        href={"#" + anchorFor(section.heading)}
                        className="group flex gap-2.5 text-[14px] text-ink-soft transition-colors hover:text-primary"
                      >
                        <span className="text-[12px] font-semibold text-primary/60 transition-colors group-hover:text-primary">
                          {num(i)}
                        </span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="border border-line bg-white p-6">
              <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                Policies
              </h2>
              <span className="mt-3 block h-[2px] w-9 bg-primary" />

              <ul className="mt-5 space-y-1">
                {policyList.map((other) => {
                  const active = other.slug === slug;
                  return (
                    <li key={other.slug}>
                      <Link
                        href={"/policies/" + other.slug}
                        aria-current={active ? "page" : undefined}
                        className={
                          "flex items-center gap-2 py-1.5 text-[14px] transition-colors " +
                          (active
                            ? "font-semibold text-primary"
                            : "text-ink-soft hover:text-primary")
                        }
                      >
                        <ChevronRight
                          size={14}
                          strokeWidth={2.4}
                          className={
                            "shrink-0 transition-opacity " +
                            (active ? "opacity-100" : "opacity-0")
                          }
                        />
                        {other.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 border border-line bg-surface p-6">
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
