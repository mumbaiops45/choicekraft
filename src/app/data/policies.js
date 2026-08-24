// ---------------------------------------------------------------------------
// Policy content.
//
// IMPORTANT: these are working drafts written to match how the site describes
// the business (7-day returns, free shipping over ₹1,999, GST invoicing,
// Maharashtra base). They are NOT legal advice. Have them reviewed, and check
// every figure against your actual operations before launch.
// ---------------------------------------------------------------------------

export const LAST_UPDATED = "24 August 2026";

export const CONTACT = {
  email: "support@choicekraft.com",
  phone: "+91 74001 81786",
  phoneHref: "tel:+917400181786",
  place: "Maharashtra, India",
};

export const faqs = [
  {
    group: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse a category, add what you need to your cart and check out. You will get an order confirmation by email with your order number and a summary of what you bought.",
      },
      {
        q: "Can I change or cancel an order after placing it?",
        a: "Yes, as long as it has not been dispatched. Email us at " + "support@choicekraft.com" + " or call with your order number and we will amend or cancel it. Once a parcel has left us it has to be handled as a return.",
      },
      {
        q: "Do you provide a GST invoice?",
        a: "Every order ships with a GST invoice. If you need it raised against a company or institution GSTIN, add that number at checkout or send it to us before dispatch.",
      },
      {
        q: "Is there a minimum order value?",
        a: "No minimum for retail orders. Bulk and institutional pricing starts at higher quantities — contact us for a quote.",
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      {
        q: "How much does delivery cost?",
        a: "Delivery is free on orders over ₹1,999. Below that, a flat shipping charge is shown at checkout before you pay.",
      },
      {
        q: "How long will my order take?",
        a: "Orders placed on a working day before 2pm are usually dispatched the same day. Metro addresses typically arrive in 2–4 working days, and other locations in 4–7.",
      },
      {
        q: "Can I track my parcel?",
        a: "Yes. You will receive a tracking link by email and SMS once the courier collects your parcel.",
      },
      {
        q: "Do you deliver everywhere in India?",
        a: "We deliver to any address our courier partners serve. A small number of remote PIN codes are not serviceable — the checkout will tell you if yours is one of them.",
      },
    ],
  },
  {
    group: "Products & bulk orders",
    items: [
      {
        q: "Do you make your own note books?",
        a: "Yes. Our note books and A4 long books are printed, cut and bound in our own unit on 60 GSM paper. Other stationery lines are sourced from established brands.",
      },
      {
        q: "Can we order in bulk for a school or office?",
        a: "That is a large part of what we do. We offer tiered pricing for schools, colleges and offices, and can print custom covers carrying your institution's name. Send us your requirement and we will quote within one working day.",
      },
      {
        q: "Can we get custom printed covers?",
        a: "Yes, on bulk orders. Minimum quantities and lead times depend on the design — get in touch and we will confirm both before you commit.",
      },
    ],
  },
  {
    group: "Returns & payment",
    items: [
      {
        q: "What is your return window?",
        a: "Seven days from delivery for unused items in their original packaging. See the Return & Refund Policy for the full detail.",
      },
      {
        q: "What if something arrives damaged?",
        a: "Tell us within 48 hours with a photograph and we will replace it or refund it in full. You will not pay return shipping on a damaged or wrong item.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are issued within 5–7 working days of us receiving and checking the returned item, back to the original payment method.",
      },
      {
        q: "What payment methods do you accept?",
        a: "UPI, major debit and credit cards, net banking and popular wallets. For approved institutional accounts we can also invoice against a purchase order.",
      },
    ],
  },
];

export const policies = {
  "privacy-policy": {
    title: "Privacy Policy",
    intro:
      "This policy explains what information ChoiceKraft collects when you use this site or place an order, why we collect it, and what choices you have.",
    sections: [
      {
        heading: "What we collect",
        body: ["We collect only what we need to sell to you and deliver your order:"],
        list: [
          "Contact details — name, email address, phone number and delivery address.",
          "Order details — what you bought, when, and the invoice raised against it.",
          "Business details — GSTIN and institution name, where you give them for invoicing.",
          "Technical data — IP address, browser type and pages visited, collected in aggregate to keep the site working.",
        ],
      },
      {
        heading: "How we use it",
        body: ["Your information is used to:"],
        list: [
          "Process, pack and deliver your order, and keep you updated on it.",
          "Raise a correct GST invoice.",
          "Answer your questions and handle returns or complaints.",
          "Meet our accounting and tax obligations.",
          "Send offers or updates — only if you have asked to receive them.",
        ],
      },
      {
        heading: "Payment information",
        body: [
          "We do not see or store your full card details. Payments are handled by our payment gateway, which is responsible for securing that data. We receive only a confirmation that a payment succeeded, plus the last few digits of the instrument used.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "We do not sell your personal information. We share it only with the parties needed to complete your order — courier partners for delivery, our payment gateway for the transaction, and our accountants or authorities where the law requires it.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "This site uses cookies to keep your cart and preferences working, and to understand in aggregate which pages are used. You can block cookies in your browser, but parts of the site — the cart in particular — may then not work correctly.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Order and invoice records are kept as long as tax and company law requires. Marketing contact details are kept until you unsubscribe. Anything we no longer need is deleted.",
        ],
      },
      {
        heading: "Your choices",
        body: ["You can ask us at any time to:"],
        list: [
          "Send you a copy of the information we hold about you.",
          "Correct anything that is wrong.",
          "Delete information we are not legally required to keep.",
          "Stop sending you marketing messages.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Access to customer data is limited to staff who need it, and the site is served over an encrypted connection. No system is perfectly secure, but we take reasonable steps to protect what you give us.",
        ],
      },
    ],
  },

  "return-and-refund-policy": {
    title: "Return & Refund Policy",
    intro:
      "If something is not right, we will put it right. This policy sets out what can be returned, how long you have, and how refunds are issued.",
    sections: [
      {
        heading: "Your return window",
        body: [
          "You have seven days from the day your order is delivered to raise a return. Tell us within that window and we will guide you through it — the item does not have to be back with us by day seven.",
        ],
      },
      {
        heading: "What can be returned",
        body: ["We accept returns on items that are:"],
        list: [
          "Unused and in re-saleable condition.",
          "In their original packaging, with any seals intact.",
          "Accompanied by the invoice or order number.",
        ],
      },
      {
        heading: "What cannot be returned",
        body: ["For hygiene, safety or practical reasons we cannot take back:"],
        list: [
          "Custom-printed note books or covers made to your specification.",
          "Items that have been written in, used, or had their seal broken.",
          "Products returned incomplete or without their packaging.",
          "Anything reported more than seven days after delivery.",
        ],
      },
      {
        heading: "Damaged, faulty or wrong items",
        body: [
          "If your order arrives damaged, faulty or is not what you ordered, tell us within 48 hours of delivery and send a photograph. We will replace the item or refund it in full, and we will cover the return shipping. This applies whatever the item is, including custom work.",
        ],
      },
      {
        heading: "How to start a return",
        body: ["Three steps:"],
        list: [
          "Email us with your order number and what is wrong, attaching photographs where relevant.",
          "We will confirm the return and tell you where to send the item, or arrange a pickup.",
          "Pack it securely with the invoice inside and hand it to the courier.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Once the item reaches us we check it and issue your refund within 5–7 working days, to the payment method you originally used. Bank processing can add a few days at their end. If the return was our error, the original delivery charge is refunded too.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "Want a different item rather than your money back? Tell us when you raise the return. We will send the replacement once the original is on its way back, and settle any price difference either way.",
        ],
      },
      {
        heading: "Bulk and institutional orders",
        body: [
          "Bulk orders are checked against your purchase order before dispatch, so returns are handled case by case. Quantity or specification errors on our side are always corrected at our cost. Contact your account manager or write to us directly.",
        ],
      },
    ],
  },

  "shipping-policy": {
    title: "Shipping Policy",
    intro:
      "How and when we dispatch orders, what delivery costs, and where we can deliver.",
    sections: [
      {
        heading: "Dispatch times",
        body: [
          "Orders placed on a working day before 2pm are usually dispatched the same afternoon. Orders placed later, at weekends, or on public holidays go out on the next working day. Bulk and custom-print orders have their own lead time, which we confirm in writing when we quote.",
        ],
      },
      {
        heading: "Delivery charges",
        body: ["Charges are calculated at checkout before you pay:"],
        list: [
          "Orders over ₹1,999 — free delivery anywhere we serve.",
          "Orders under ₹1,999 — a flat shipping charge, shown at checkout.",
          "Bulk and freight consignments — quoted separately, based on weight and destination.",
        ],
      },
      {
        heading: "Delivery times",
        body: [
          "Once dispatched, metro addresses generally receive parcels in 2–4 working days and other locations in 4–7. These are courier estimates rather than guarantees; weather, strikes and local restrictions can add time.",
        ],
      },
      {
        heading: "Tracking your order",
        body: [
          "You will get a tracking link by email and SMS when the courier collects your parcel. If tracking has not updated for more than 48 hours, contact us and we will chase the courier on your behalf.",
        ],
      },
      {
        heading: "Where we deliver",
        body: [
          "We deliver across India to any PIN code our courier partners serve. A small number of remote locations are not serviceable — checkout will flag this before you pay. We do not currently ship outside India.",
        ],
      },
      {
        heading: "Receiving your order",
        body: [
          "Please check the parcel before signing for it. If the outer packaging is torn, crushed or wet, note it with the delivery agent and photograph it. That makes a damage claim much easier to settle. Report any damage to us within 48 hours.",
        ],
      },
      {
        heading: "Failed deliveries",
        body: [
          "Couriers normally attempt delivery up to three times. If nobody is available, the parcel returns to us and we will contact you to arrange a re-send. Re-delivery after a failed attempt caused by an incorrect or incomplete address may carry a further shipping charge.",
        ],
      },
    ],
  },
};

export const policyList = [
  { slug: "faqs", title: "FAQs" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "return-and-refund-policy", title: "Return & Refund Policy" },
  { slug: "shipping-policy", title: "Shipping Policy" },
];
