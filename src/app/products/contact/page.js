import PageHeader from "../../components/PageHeader";

export const metadata = {
  title: "Contact | ChoiceKraft",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" crumb="CONTACT" />

      <section className="mx-auto grid max-w-[1100px] gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[1px] text-ink">
            Get in touch
          </h2>
          <p className="mt-4 leading-8 text-muted">
            Questions about an order, a product or a bulk enquiry? Send us a
            message and we will reply within one working day.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold uppercase tracking-[1px] text-ink">
                Address
              </dt>
              <dd className="mt-1 text-muted">Maharashtra, India</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[1px] text-ink">
                Phone
              </dt>
              <dd className="mt-1 text-muted">
                <a href="tel:+917400181786" className="transition-colors hover:text-primary">
                  +91 74001 81786
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[1px] text-ink">
                Email
              </dt>
              <dd className="mt-1 text-muted">
                <a href="mailto:support@choicekraft.com" className="transition-colors hover:text-primary">
                  support@choicekraft.com
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <input
            type="email"
            placeholder="Your email"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <textarea
            rows={6}
            placeholder="Your message"
            className="w-full border border-line px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary px-8 py-3 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            SEND MESSAGE
          </button>
        </form>
      </section>
    </>
  );
}
