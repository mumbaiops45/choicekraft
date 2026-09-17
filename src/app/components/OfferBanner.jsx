import Link from "next/link";
import { Sparkles, Truck, Gift, Percent } from "lucide-react";

const items = [
  { icon: Percent, text: "MEGA SALE — UP TO 50% OFF STATIONERY" },
  { icon: Truck, text: "FREE SHIPPING ABOVE ₹1000" },
  { icon: Gift, text: "FREE GIFTS ABOVE ₹500" },
  { icon: Sparkles, text: "NEW SEASON NOTE BOOKS IN STOCK" },
];

/**
 * Attention-grabbing offer ticker.
 *
 * The item list is rendered twice back to back and the track scrolls exactly
 * half its own width, so the loop point is invisible — there is never a jump
 * or a gap, just a continuous strip.
 */
export default function OfferBanner() {
  return (
    <Link
      href="/products"
      aria-label="Browse current offers"
      className="group relative flex w-full overflow-hidden bg-primary py-3.5"
    >
      <div className="ck-marquee-track flex w-max shrink-0 items-center group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {items.map(({ icon: Icon, text }, i) => (
              <span
                key={copy + "-" + i}
                className="flex shrink-0 items-center gap-2.5 px-8 text-[13px] font-bold uppercase tracking-[1.5px] text-primary-foreground"
              >
                <Icon size={16} strokeWidth={2.2} />
                {text}
                <span className="ml-8 h-1.5 w-1.5 rounded-full bg-primary-foreground/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </Link>
  );
}
