import { BadgeCheck, Award, Store, Users } from "lucide-react";
import Reveal from "./Reveal";
import RevealImage from "./RevealImage";

const points = [
  {
    icon: BadgeCheck,
    title: "100% Quality Products",
    body: "Every item is checked against our own standard before it ships, not just the supplier's.",
  },
  {
    icon: Award,
    title: "Premium Brands",
    body: "We stock the names schools and offices already trust, at fair, transparent prices.",
  },
  {
    icon: Store,
    title: "One Stop Shop for Stationery",
    body: "School supplies, office essentials and art materials — everything under one roof.",
  },
  {
    icon: Users,
    title: "Ideal for All Ages",
    body: "From a first-grader's pencil box to an office file room, there is a fit for everyone.",
  },
];

export default function WhyChoiceKraft() {
  return (
    <section className="bg-surface-alt py-20 lg:py-28">
      <div className="mx-auto max-w-[1510px] px-6">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_460px] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-[13px] font-semibold uppercase tracking-[3px] text-primary">
                Why ChoiceKraft
              </p>
              <h2 className="mt-4 max-w-[560px] text-3xl font-bold uppercase leading-[1.15] tracking-[0.5px] text-ink lg:text-[40px]">
                The right choice,
                <span className="text-primary"> every time</span>
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-12">
              {points.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 90}>
                  <div className="group flex gap-5">
                    <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-primary transition-transform duration-500 group-hover:scale-110 lg:h-[76px] lg:w-[76px]">
                      <Icon
                        size={34}
                        strokeWidth={1.5}
                        className="text-primary-foreground"
                      />
                    </span>

                    <div>
                      <h3 className="text-[16px] font-bold uppercase leading-6 tracking-[0.5px] text-ink transition-colors group-hover:text-primary">
                        {title}
                      </h3>
                      <p className="mt-2 max-w-[260px] leading-7 text-muted">
                        {body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Capped below lg — full width on a tablet makes this portrait
              shot taller than the copy beside it. */}
          <RevealImage
            src="/images/whychoose.png"
            alt="ChoiceKraft stationery kit with premium branded art supplies"
            ratio="aspect-[759/1000]"
            from="right"
            className="mx-auto w-full max-w-[380px] sm:max-w-[440px] lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
