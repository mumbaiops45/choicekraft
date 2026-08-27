import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Lightbulb,
  MessageSquareQuote,
} from "lucide-react";
import Parallax from "../../components/Parallax";
import Reveal from "../../components/Reveal";
import RevealImage from "../../components/RevealImage";
import CountUp from "../../components/CountUp";
import CoverSlider from "../../components/CoverSlider";
import { getNotebooks } from "@/lib/services/productService";

export const metadata = {
  title: "About Us | ChoiceKraft",
  description:
    "ChoiceKraft makes reliable, affordable, quality stationery for students, professionals and businesses — printed and bound in our own facility.",
};

const values = [
  {
    icon: BadgeCheck,
    title: "Quality First",
    body: "Made with care and precision — judged not just on how it looks, but how it feels in your hands.",
  },
  {
    icon: HeartHandshake,
    title: "Integrity",
    body: "A trusted and responsible brand our customers rely on for honesty as much as for product.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Improvement",
    body: "We listen to customer feedback and keep evolving with changing needs.",
  },
  {
    icon: MessageSquareQuote,
    title: "Customer Satisfaction",
    body: "Innovation and customer satisfaction remain at the heart of everything we do.",
  },
];

const stats = [
  { to: 60, unit: "GSM", label: "Paper weight" },
  { to: 7, unit: "+", label: "Cover designs" },
  { to: 100, unit: "%", label: "Made in-house" },
];

export default async function AboutPage() {
  const notebooks = await getNotebooks();

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      {/* Plain chalkboard texture rather than a factory snapshot — the headline
          needs a quiet background, and the factory photos earn their place in
          the collage further down where they can be seen properly. */}
      <Parallax
        src="/images/main-banner-2.jpg"
        position="center top"
        speed={0.16}
        overlay="bg-[linear-gradient(100deg,rgba(15,15,18,0.94)_0%,rgba(15,15,18,0.86)_45%,rgba(15,15,18,0.72)_100%)]"
        className="relative pt-[130px] pb-24 text-white lg:pt-[210px] lg:pb-32"
      >
        <div className="mx-auto max-w-[1510px] px-6">
          <nav
            aria-label="Breadcrumb"
            className="ck-rise text-[13px] tracking-[1px] text-white/55"
            style={{ "--d": "80ms" }}
          >
            <Link href="/" className="transition-colors hover:text-primary">
              HOME
            </Link>
            <span className="px-2">/</span>
            <span className="text-primary">ABOUT US</span>
          </nav>

          <h1
            className="ck-rise mt-6 max-w-[960px] text-[32px] font-bold uppercase leading-[1.15] tracking-[0.5px] lg:text-[52px]"
            style={{ "--d": "220ms" }}
          >
            Crafting better choices for
            <span className="text-primary"> everyday work &amp; study</span>
          </h1>

          <span
            className="ck-rule mt-8 block h-[3px] w-24 bg-primary"
            style={{ "--d": "460ms" }}
          />

          <p
            className="ck-rise mt-8 max-w-[620px] text-lg leading-8 text-white/70"
            style={{ "--d": "520ms" }}
          >
            Reliable, affordable, quality stationery for students, professionals
            and businesses — printed and bound in our own facility.
          </p>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
          className="ck-rise absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block"
          style={{ "--d": "800ms" }}
        >
          <span className="flex h-11 w-7 justify-center rounded-full border border-white/35 pt-2">
            <span className="ck-scroll-cue h-2 w-[3px] rounded-full bg-primary" />
          </span>
        </div>
      </Parallax>

      {/* ---------------------------------------------------------------- */}
      {/* Mission                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1510px] px-6 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
                Our <span className="text-primary">mission</span>
              </h2>

              <p className="mt-7 text-[17px] leading-9 text-ink-soft">
                At ChoiceKraft, we believe the right stationery can make everyday
                tasks smoother, more organised, and more enjoyable.
              </p>

              <p className="mt-4 leading-8 text-muted">
                We started ChoiceKraft with a simple mission — to provide
                reliable, affordable, and quality stationery products for
                students, professionals, and businesses. From notebooks and
                staplers to essential office supplies, every product we offer is
                carefully selected to deliver value and durability.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <Link
                href="/products"
                className="group mt-10 inline-flex items-center gap-3 bg-secondary px-8 py-4 text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors hover:bg-primary"
              >
                BROWSE THE RANGE
                <ArrowRight
                  size={16}
                  strokeWidth={2.2}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <RevealImage
              src="/images/nb-dewdrops.jpg"
              alt="ChoiceKraft Dewdrops A4 long book"
              ratio="aspect-[3/4]"
              from="left"
            />
            <RevealImage
              src="/images/nb-pride.jpg"
              alt="ChoiceKraft Pride exercise notebook"
              ratio="aspect-[3/4]"
              from="left"
              delay={180}
              className="mt-12"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Quote band                                                        */}
      {/* ---------------------------------------------------------------- */}
      <Parallax
        src="/images/contactimages.png"
        speed={0.2}
        overlay="bg-ink/88"
        className="py-24 text-white lg:py-32"
      >
        <div className="mx-auto max-w-[920px] px-6 text-center">
          <Reveal>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <MessageSquareQuote size={28} strokeWidth={1.7} />
            </span>
          </Reveal>

          <Reveal delay={120}>
            <blockquote className="mt-9 text-[26px] font-bold leading-[1.4] lg:text-[38px]">
              ChoiceKraft was born from a simple belief —
              <span className="text-primary"> that writing should feel special.</span>
            </blockquote>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 leading-8 text-white/70">
              In a fast-moving digital world, putting pen to paper still carries
              something powerful. We wanted to create notebooks that make that
              experience smoother, more inspiring, and more meaningful.
            </p>
          </Reveal>
        </div>
      </Parallax>

      {/* ---------------------------------------------------------------- */}
      {/* Craft                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1510px] px-6 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 grid grid-cols-2 gap-5 lg:order-1">
            <RevealImage
              src="/images/factory-binding.jpg"
              alt="ChoiceKraft notebooks being trimmed on the production floor"
              ratio="col-span-2 aspect-[1280/963]"
              from="left"
            />
            <RevealImage
              src="/images/factory-paper.jpg"
              alt="Reams of 60 GSM paper stock"
              ratio="aspect-[3/4]"
              from="bottom"
              delay={160}
            />
            <RevealImage
              src="/images/factory-stack.jpg"
              alt="Finished ChoiceKraft note books stacked for dispatch"
              ratio="aspect-[3/4]"
              from="bottom"
              delay={300}
            />
          </div>

          <div className="order-1 lg:order-2">
            <Reveal>
              <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
                Made with care
                <br />
                <span className="text-primary">and precision</span>
              </h2>

              <p className="mt-7 text-[17px] leading-9 text-ink-soft">
                Every notebook we produce is made with care, precision, and a
                deep commitment to quality.
              </p>

              <p className="mt-4 leading-8 text-muted">
                We focus not just on how it looks, but on how it feels in your
                hands — and how it supports your creativity. Because we control
                the paper, the press and the binding in our own unit, we can hold
                that standard steady on every run.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-12 grid grid-cols-3 gap-6 border-y border-line py-9">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-[34px] font-bold leading-none text-primary lg:text-[42px]">
                      <CountUp to={stat.to} />
                      <span className="text-[18px]">{stat.unit}</span>
                    </p>
                    <p className="mt-2.5 text-[12px] uppercase tracking-[1.5px] text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Range slider                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-surface-alt py-20 lg:py-28">
        <div className="mx-auto max-w-[1510px] px-6">
          <Reveal className="max-w-[640px]">
            <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
              Covers worth <span className="text-primary">keeping</span>
            </h2>
            <p className="mt-5 leading-8 text-muted">
              Each book in the range carries its own photograph and its own line
              — small things that make a notebook feel like yours.
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-14">
            <CoverSlider books={notebooks} />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Values                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1510px] px-6 py-20 lg:py-28">
        <Reveal className="max-w-[700px]">
          <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
            Building a brand <span className="text-primary">you can rely on</span>
          </h2>
          <p className="mt-5 leading-8 text-muted">
            We aim to build ChoiceKraft as a trusted and responsible brand within
            the industry — one that customers rely on not only for quality but
            for integrity.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="group relative h-full overflow-hidden border border-line bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_22px_45px_rgba(0,0,0,0.11)]">
                {/* Pink sweep fills up from the bottom edge on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
                />

                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary">
                  <Icon
                    size={26}
                    strokeWidth={1.6}
                    className="text-primary transition-colors duration-500 group-hover:text-primary-foreground"
                  />
                </span>

                <h3 className="mt-7 text-[16px] font-bold uppercase leading-6 tracking-[0.5px] text-ink">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-line bg-surface py-20">
        <div className="mx-auto max-w-[840px] px-6 text-center">
          <Reveal>
            <h2 className="text-2xl font-bold uppercase leading-[1.3] tracking-[0.5px] text-ink lg:text-[32px]">
              Your trust motivates us to keep improving
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] leading-8 text-muted">
              We keep innovating and delivering products that truly add value to
              your everyday life.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="bg-primary px-9 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                SHOP ALL PRODUCTS
              </Link>
              <Link
                href="/products/contact"
                className="border-2 border-secondary px-9 py-4 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                TALK TO US
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
