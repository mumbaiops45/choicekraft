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
        q: "When will my order ship?",
        a: "Confirmed orders are processed and dispatched within 1–2 business days. Orders placed on a weekend or public holiday are processed on the next business day. Bulk and custom-print orders have their own lead time, which we confirm in writing when we quote.",
      },
      {
        q: "When will my order arrive?",
        a: "Once dispatched, metro addresses typically receive parcels in 2–4 working days and other locations in 4–7. These are courier estimates rather than guarantees — weather, strikes, local restrictions and peak periods can add time.",
      },
      {
        q: "Can I track my parcel?",
        a: "Yes. You will receive a tracking link by email and SMS once the courier collects your parcel.",
      },
      {
        q: "Where do you ship to?",
        a: "We ship across India, to any PIN code our courier partners serve. A small number of remote locations are not serviceable — the checkout will tell you if yours is one of them. We do not currently ship outside India.",
      },
      {
        q: "Can you leave my order outside my door?",
        a: "Our courier partners need someone to receive the parcel and record a delivery confirmation, so we cannot promise a no-contact drop. You are welcome to add a delivery note at checkout and the courier will do their best to honour it, but anything left unattended at your request is at your own risk. If nobody is available the shipment may be returned to us.",
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
        q: "Collaboration or partnership with ChoiceKraft",
        a: "We are open to working with artists, designers, retailers and institutions. Write to us at " + CONTACT.email + " with an outline of what you have in mind and some examples of your work, and the right person will come back to you.",
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
        q: "What payments do you accept?",
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
    title: "Return, Refund & Cancellation Policy",
    intro:
      "At ChoiceKraft, we are committed to delivering high-quality stationery products. This policy outlines the terms and conditions for returns, refunds, and cancellations.",
    sections: [
      {
        heading: "Eligibility for returns",
        body: [
          "Customers may request a return within 7 days of delivery, subject to the following conditions:",
        ],
        list: [
          "The product must be unused, unaltered, and in original condition.",
          "The product must be returned in its original packaging with all tags and accessories.",
          "A valid proof of purchase (order ID / invoice) must be provided.",
        ],
        outro: [
          "ChoiceKraft reserves the right to reject any return request that does not meet these conditions.",
        ],
      },
      {
        heading: "Non-returnable items",
        body: ["The following items are not eligible for return:"],
        list: [
          "Products that have been used, damaged, or altered after delivery.",
          "Items returned without original packaging.",
          "Products damaged due to improper handling by the customer.",
        ],
      },
      {
        heading: "Return process",
        body: ["To initiate a return:"],
        list: [
          "Contact us at " + CONTACT.email + " within 7 days of delivery.",
          "Provide your order ID and reason for return.",
          "Our team will review your request and provide return instructions.",
        ],
        outro: ["Returns sent without prior approval may not be accepted."],
      },
      {
        heading: "Refund policy",
        list: [
          "Once the returned product is received and inspected, we will notify you of the approval or rejection of your refund.",
          "If approved, the refund will be processed within 5–7 business days.",
          "Refunds will be issued to the original payment method.",
        ],
      },
      {
        heading: "Shipping charges",
        list: [
          "Original shipping charges are non-refundable.",
          "Customers are responsible for return shipping costs.",
          "If the return is due to a defective, damaged, or incorrect product, ChoiceKraft will bear the return shipping cost.",
        ],
      },
      {
        heading: "Damaged or incorrect products",
        body: ["If you receive a defective or incorrect item:"],
        list: [
          "Notify us within 48 hours of delivery.",
          "Share clear photos or videos as proof.",
          "We will arrange a replacement or full refund at no extra cost.",
        ],
      },
      {
        heading: "Order cancellation",
        list: [
          "Orders can be cancelled before dispatch only.",
          "Once the order is shipped, cancellation requests will not be accepted.",
        ],
      },
      {
        heading: "Contact information",
        body: ["For any queries regarding returns or refunds, please contact:"],
        list: [CONTACT.email, CONTACT.phone],
        outro: [
          "ChoiceKraft reserves the right to update or modify this policy at any time without prior notice.",
        ],
      },
    ],
  },

  "shipping-policy": {
    title: "Shipping Policy",
    intro:
      "This Shipping Policy outlines the terms and conditions governing the shipment and delivery of products purchased from our website.",
    sections: [
      {
        heading: "Serviceable locations",
        body: [
          "We currently offer shipping services across India. Delivery availability is subject to the serviceability of our logistics partners in the provided PIN code.",
        ],
      },
      {
        heading: "Order processing",
        body: [
          "All confirmed orders are processed within 1–2 business days from the date of order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.",
        ],
      },
      {
        heading: "Shipping charges",
        list: [
          "A standard shipping fee of ₹49 applies to orders below ₹499.",
          "Free shipping is offered on orders with a cart value of ₹499 and above.",
          "Shipping charges, if applicable, will be displayed at checkout before payment confirmation.",
        ],
      },
      {
        heading: "Shipment tracking",
        body: [
          "Upon dispatch, customers will receive shipment confirmation along with a tracking ID or link via registered email and/or SMS. Tracking information may take up to 24 hours to become active.",
        ],
      },
      {
        heading: "Delivery attempts",
        body: [
          "Our logistics partners will make multiple delivery attempts. In case of unsuccessful delivery due to customer unavailability or incorrect address details, the shipment may be returned to origin (RTO).",
        ],
      },
      {
        heading: "Address accuracy",
        body: [
          "Customers are required to provide complete and accurate shipping information. We shall not be liable for delays, non-delivery, or additional charges arising from incorrect or incomplete address details.",
        ],
      },
      {
        heading: "Delays and force majeure",
        body: [
          "Delivery timelines may be impacted due to events beyond our control, including but not limited to:",
        ],
        list: [
          "Natural disasters, strikes, or lockdowns.",
          "Transportation disruptions.",
          "High order volumes.",
        ],
        outro: ["In such cases, delivery timelines will be extended accordingly."],
      },
      {
        heading: "Damaged or tampered packages",
        body: [
          "Customers are advised to inspect the package at the time of delivery. In case of visible damage or tampering, the customer should refuse delivery or report the issue within 24 hours of receipt.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          "To the maximum extent permitted by law, our liability for any shipping-related issue shall be limited to the value of the product purchased. We shall not be liable for any indirect, incidental, or consequential damages.",
        ],
      },
    ],
  },
};

export const policyList = [
  { slug: "faqs", title: "FAQs" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  {
    slug: "return-and-refund-policy",
    title: "Return, Refund & Cancellation Policy",
  },
  { slug: "shipping-policy", title: "Shipping Policy" },
];
