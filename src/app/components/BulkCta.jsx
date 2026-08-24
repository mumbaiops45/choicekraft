import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

/**
 * Bulk-order call to action.
 *
 * Held inside a white band rather than run full-bleed: the footer directly
 * below it is the same ink, and butted together the two read as one slab.
 */
export default function BulkCta() {
  return (
    <div className="bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-[1510px] px-6">
        <Parallax
          src="/images/contactimages.png"
          speed={0.18}
          overlay="bg-gradient-to-r from-ink/92 via-ink/82 to-ink/62"
          className="px-8 py-14 text-white lg:px-16 lg:py-20"
        >
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
        </Parallax>
      </div>
    </div>
  );
}
