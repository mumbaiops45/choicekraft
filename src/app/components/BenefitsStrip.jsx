import RevealImage from "./RevealImage";

/**
 * Designed banner (public/images/benefits.png) — headline, both perks and
 * the tagline are already part of the artwork, so this just frames it. No
 * text overlay needed here, unlike Hero's admin-uploaded photos.
 */
export default function BenefitsStrip() {
  return (
    <section className="mx-auto max-w-[1510px] px-6 py-14 lg:py-20">
      <RevealImage
        src="/images/benefits.png"
        alt="Unlock exclusive benefits — free shipping on orders above ₹1000, free gifts on orders above ₹500"
        ratio="aspect-[1795/876]"
        from="bottom"
      />
    </section>
  );
}
