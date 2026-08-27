// ---------------------------------------------------------------------------
// Cover quotes for the note books ChoiceKraft prints itself.
//
// These are printed on the covers and shown under each book's name on the
// homepage rail and the About page cover slider. The backend's product schema
// has no field for them — its `description` holds the short type label
// ("A4 Long Book") — so they stay here, keyed by product slug.
//
// Add a `quote` field to the Product model and this file can go away: the
// formatter already prefers whatever the API sends.
// ---------------------------------------------------------------------------

export const NOTEBOOK_QUOTES = {
  roar: "Be strong, be fearless, be beautiful.",
  chipmunks: "Do good & forget. It will grow some day.",
  "the-powerful": "Believe you can & you're halfway there.",
  dewdrops: "Let your life lightly dance on the edges of time.",
  music: "Music in the soul can be heard by the universe.",
  blossom: "Every petal is a sweet memory!",
  pride: "It's not impossible until we fail.",
};

/** The cover quote for a product slug, or "" when there isn't one. */
export const quoteFor = (slug) => NOTEBOOK_QUOTES[slug] || "";

export default NOTEBOOK_QUOTES;
