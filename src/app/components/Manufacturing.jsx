import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Parallax from "./Parallax";
import Reveal from "./Reveal";
import RevealImage from "./RevealImage";
import CountUp from "./CountUp";

const stats = [
  { to: 60, unit: "GSM", label: "Paper weight" },
  { to: 7, unit: "+", label: "Cover designs" },
  { to: 100, unit: "%", label: "Made in-house" },
];

export default function Manufacturing() {
  return (
    <Parallax
      src="/images/factory-floor.jpg"
      speed={0.14}
      overlay="bg-gradient-to-b from-ink/95 via-ink/92 to-ink/95"
      className="py-20 text-white lg:py-28"
    >
      <div className="mx-auto grid max-w-[1510px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        {/* Collage — ratios match the source photos so nothing crops */}
        <div className="grid grid-cols-2 gap-5">
          <RevealImage
            src="/images/factory-fold.jpg"
            alt="Workers folding printed sheets at the ChoiceKraft unit"
            ratio="col-span-2 aspect-[1280/963]"
            from="left"
          />
          <RevealImage
            src="/images/factory-binding.jpg"
            alt="ChoiceKraft notebooks being trimmed on the production floor"
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

        <div>
          <Reveal>
            <h2 className="text-3xl font-bold uppercase leading-[1.15] tracking-[0.5px] lg:text-[40px]">
              We don&rsquo;t just sell it.
              <br />
              <span className="text-primary">We make it.</span>
            </h2>

            <p className="mt-7 max-w-[520px] text-[17px] leading-9 text-white/75">
              Every ChoiceKraft note book is printed, cut and bound in our own
              unit.
            </p>

            <p className="mt-4 max-w-[520px] leading-8 text-white/60">
              Because we control the paper, the press and the binding, we can
              hold quality steady and keep prices fair for schools and
              institutions ordering in volume.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-11 grid grid-cols-3 gap-6 border-y border-white/15 py-9">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-[32px] font-bold leading-none text-primary lg:text-[42px]">
                    <CountUp to={stat.to} />
                    <span className="text-[18px] lg:text-[22px]">
                      {stat.unit}
                    </span>
                  </p>
                  <p className="mt-2.5 text-[12px] uppercase tracking-[1.5px] text-white/55">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={220}>
            <Link
              href="/products/about"
              className="group mt-11 inline-flex items-center gap-3 bg-primary px-9 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              ABOUT CHOICEKRAFT
              <ArrowRight
                size={16}
                strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </Parallax>
  );
}
