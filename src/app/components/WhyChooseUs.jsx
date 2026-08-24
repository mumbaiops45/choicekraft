import { Building2, LayoutGrid, BadgeCheck, RotateCcw } from "lucide-react";
import Reveal from "./Reveal";
import RevealImage from "./RevealImage";

const features = [
  {
    icon: Building2,
    title: "BULK & INSTITUTIONAL ORDERS",
    body: "Tiered pricing for schools, colleges and offices, with a GST invoice on every order.",
  },
  {
    icon: LayoutGrid,
    title: "EVERYTHING IN ONE PLACE",
    body: "School supplies, office essentials and art materials in a single catalogue.",
  },
  {
    icon: BadgeCheck,
    title: "QUALITY CHECKED STOCK",
    body: "Trusted brands, inspected by our team before dispatch so nothing reaches you damaged.",
  },
  {
    icon: RotateCcw,
    title: "EASY 7-DAY RETURNS",
    body: "Changed your mind? Send it back within seven days for a full refund, no questions.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-[1510px] px-6 py-20 lg:py-28">
      <div className="grid items-start gap-14 lg:grid-cols-[460px_1fr] lg:gap-20">
        {/* Capped below lg — full width on a tablet makes this portrait shot
            over 1000px tall and pushes the copy off screen. */}
        <RevealImage
          src="/images/welcome.jpg"
          alt="ChoiceKraft Roar premium quality exercise notebook"
          ratio="aspect-[681/913]"
          from="left"
          className="mx-auto w-full max-w-[380px] sm:max-w-[440px] lg:max-w-none"
        />

        <div>
          <Reveal>
            <h2 className="text-3xl font-bold uppercase leading-[1.15] tracking-[0.5px] text-ink lg:text-[40px]">
              Quality stationery for
              <span className="text-primary"> school, office &amp; creativity</span>
            </h2>

            <p className="mt-7 max-w-[640px] text-[17px] leading-9 text-ink-soft">
              Affordable and reliable stationery for students, professionals and
              institutions.
            </p>

            <p className="mt-4 max-w-[640px] leading-8 text-muted">
              Pens, envelopes and note books picked by hand, packed by hand, and
              sent out the same day you order them.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-x-12">
            {features.map(({ icon: Icon, title, body }, i) => (
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
      </div>
    </section>
  );
}
