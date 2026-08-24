import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

export default function BulkCta() {
  return (
    <Parallax
      src="/images/contactimages.png"
      speed={0.18}
      overlay="bg-gradient-to-r from-ink/90 via-ink/80 to-ink/60"
      className="py-20 text-white lg:py-28"
    >
      <div className="mx-auto max-w-[1510px] px-6">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[3px] text-primary">
              Schools, colleges &amp; offices
            </p>
            <h2 className="mt-4 max-w-[640px] text-2xl font-bold uppercase leading-[1.25] tracking-[0.5px] lg:text-[34px]">
              Buying in bulk? Get a quote within one working day.
            </h2>
            <p className="mt-5 max-w-[560px] leading-8 text-white/70">
              Tiered pricing on volume orders, custom cover printing for your
              institution, and a GST invoice with every dispatch.
            </p>
          </Reveal>

          <Reveal delay={140} className="shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products/contact"
                className="inline-flex items-center justify-center gap-2.5 bg-primary px-8 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <FileText size={16} strokeWidth={2} />
                REQUEST A QUOTE
              </Link>
              <a
                href="tel:+917400181786"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-white/70 px-8 py-4 text-[12px] font-semibold tracking-[2px] text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                <Phone size={16} strokeWidth={2} />
                CALL US
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Parallax>
  );
}
