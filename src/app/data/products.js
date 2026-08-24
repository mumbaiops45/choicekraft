// ---------------------------------------------------------------------------
// ChoiceKraft catalogue
//
// `category` matches a slug in ./categories.js
// `kind`     "book" = printed and bound by ChoiceKraft; the Stationery page
//            filters these out. Everything else is "stationery".
//
// PRICES: placeholders EXCEPT where the MRP is printed on the pack itself —
// those are marked `mrpSource: "pack"`. Replace the rest with real pricing.
// ---------------------------------------------------------------------------

export const notebooks = [
  { slug: "roar", name: "Roar", kind: "book", category: "notebooks", type: "Exercise Notebook", quote: "Be strong, be fearless, be beautiful.", price: 65, mrp: 80, image: "/images/nb-roar.jpg", badge: "Bestseller" },
  { slug: "chipmunks", name: "Chipmunks", kind: "book", category: "notebooks", type: "A4 Long Book", quote: "Do good & forget. It will grow some day.", price: 95, mrp: 110, image: "/images/nb-chipmunks.jpg" },
  { slug: "the-powerful", name: "The Powerful", kind: "book", category: "notebooks", type: "A4 Long Book", quote: "Believe you can & you're halfway there.", price: 95, mrp: 110, image: "/images/nb-powerful.jpg" },
  { slug: "dewdrops", name: "Dewdrops", kind: "book", category: "notebooks", type: "A4 Long Book", quote: "Let your life lightly dance on the edges of time.", price: 95, mrp: 115, image: "/images/nb-dewdrops.jpg", badge: "New" },
  { slug: "music", name: "Music", kind: "book", category: "notebooks", type: "A4 Long Book", quote: "Music in the soul can be heard by the universe.", price: 95, mrp: 110, image: "/images/nb-music.jpg" },
  { slug: "blossom", name: "Blossom", kind: "book", category: "notebooks", type: "Exercise Notebook", quote: "Every petal is a sweet memory!", price: 65, mrp: 80, image: "/images/nb-blossom.jpg" },
  { slug: "pride", name: "Pride", kind: "book", category: "notebooks", type: "Exercise Notebook", quote: "It's not impossible until we fail.", price: 65, mrp: 75, image: "/images/nb-pride.jpg", badge: "Bestseller" },
];

export const stationery = [
  // ---- Pens & markers ----
  { slug: "glass-gel-pen-pack", name: "Glass Gel Pen — Pack of 10", kind: "stationery", category: "pens", type: "Flair", price: 150, mrp: 180, image: "/images/cat-pens.jpg", badge: "Bestseller" },
  { slug: "hauser-xo-pens", name: "XO Ball Pen — Pack of 10", kind: "stationery", category: "pens", type: "Hauser", price: 100, mrp: 120, image: "/images/pens-hauser.jpg" },
  { slug: "permanent-marker-black", name: "Permanent Marker, Black", kind: "stationery", category: "pens", type: "Camlin", price: 45, mrp: 55, image: "/images/cat-marker.jpg" },
  { slug: "permanent-marker-red", name: "Permanent Marker, Red", kind: "stationery", category: "pens", type: "Camlin", price: 45, mrp: 55, image: "/images/marker-red.jpg" },

  // ---- Pencils, sharpeners, erasers ----
  { slug: "colour-pencils", name: "Colour Pencils", kind: "stationery", category: "pencils", type: "Assorted shades", price: 120, mrp: 140, image: "/images/pencils.png" },
  { slug: "sharpener-621", name: "621 Sharpener", kind: "stationery", category: "sharpeners", type: "Nataraj", price: 10, mrp: 12, image: "/images/cat-sharpener.jpg" },
  { slug: "dust-free-eraser", name: "Dust-Free Eraser", kind: "stationery", category: "erasers", type: "Non-smudge", price: 10, mrp: 12, image: "/images/erasers.png" },
  { slug: "groove-eraser-pen", name: "Groove Eraser Pen with Refills", kind: "stationery", category: "erasers", type: "DOMS", price: 85, mrp: 100, image: "/images/eraser-pen.jpg", badge: "New" },

  // ---- Desk ----
  { slug: "mini-stapler", name: "Mini Stapler", kind: "stationery", category: "staplers", type: "No. 10 pins", price: 85, mrp: 100, image: "/images/cat-stapler.jpg" },
  { slug: "compact-stapler", name: "Compact Stapler", kind: "stationery", category: "staplers", type: "No. 10 pins", price: 75, mrp: 90, image: "/images/stapler-mini.jpg" },
  { slug: "kangaro-hd10-stapler", name: "HD-10 Stapler", kind: "stationery", category: "staplers", type: "Kangaro", price: 165, mrp: 195, image: "/images/stapler-kangaro.jpg" },
  { slug: "half-strip-stapler", name: "Half Strip Stapler", kind: "stationery", category: "staplers", type: "Office duty", price: 195, mrp: 230, image: "/images/cat-office.jpg" },
  { slug: "heavy-duty-stapler", name: "Heavy Duty Stapler", kind: "stationery", category: "staplers", type: "Up to 100 sheets", price: 890, mrp: 1050, image: "/images/stapler-heavy.jpg" },
  { slug: "two-hole-punch", name: "Two-Hole Punch", kind: "stationery", category: "punches", type: "Metal body", price: 180, mrp: 220, image: "/images/cat-punch.jpg" },
  { slug: "kangaro-dp600-punch", name: "DP-600 Punch", kind: "stationery", category: "punches", type: "Kangaro", price: 245, mrp: 290, image: "/images/punch-kangaro.jpg" },
  { slug: "tape-dispenser", name: "Desk Tape Dispenser", kind: "stationery", category: "tape-dispensers", type: "Weighted base", price: 95, mrp: 120, image: "/images/tape-dispenser.png" },
  { slug: "paperclips-box", name: "Paperclips — Box of 100", kind: "stationery", category: "paperclips", type: "Nickel plated", price: 40, mrp: 50, image: "/images/paperclips.png" },
  { slug: "school-scissors", name: "School Scissors", kind: "stationery", category: "scissors", type: "Rounded tip", price: 60, mrp: 75, image: "/images/scissors.png" },
  { slug: "glue-stick", name: "Glue Stick", kind: "stationery", category: "glues", type: "Non-toxic", price: 35, mrp: 40, image: "/images/glues.png" },
  { slug: "sticky-note-pad", name: "Sticky Note Pad", kind: "stationery", category: "sticky-notes", type: "Assorted colours", price: 75, mrp: 90, image: "/images/sticky-notes.png" },

  // ---- Files, folders, paper ----
  { slug: "ring-binder-file", name: "Ring Binder File", kind: "stationery", category: "files", type: "A4, board cover", price: 95, mrp: 120, image: "/images/cat-files.jpg" },
  { slug: "document-wallet", name: "Document Wallet — Pack of 5", kind: "stationery", category: "files", type: "Button close", price: 150, mrp: 180, image: "/images/cat-folders.jpg" },
  { slug: "acrylic-clipboard", name: "Acrylic Clipboard", kind: "stationery", category: "files", type: "Gold clip", price: 140, mrp: 175, image: "/images/cat-clipboard.jpg" },
  { slug: "carbon-paper", name: "Sapphire Pencil Carbon Paper — 100 Sheets", kind: "stationery", category: "files", type: "Kores", price: 215, mrp: 250, mrpSource: "pack", image: "/images/carbon-paper.jpg" },

  // ---- Geometry & pencil boxes ----
  { slug: "cartoon-pencil-box", name: "Cartoon Pencil Box", kind: "stationery", category: "geometry-boxes", type: "Two compartments", price: 180, mrp: 220, image: "/images/cat-pencilbox.jpg" },
  { slug: "pb-3d-cartoon", name: "3D Cartoon Multifunction Pencil Box", kind: "stationery", category: "geometry-boxes", type: "Inbuilt tools", price: 320, mrp: 380, image: "/images/pb-3d-cartoon.jpg", badge: "New" },
  { slug: "pb-sky-travel", name: "Sky Travel Astronaut Pencil Box", kind: "stationery", category: "geometry-boxes", type: "Inbuilt tools", price: 340, mrp: 399, image: "/images/pb-sky-travel.jpg" },
  { slug: "pb-sportscar", name: "Sports Car Pencil Box", kind: "stationery", category: "geometry-boxes", type: "Lock code", price: 260, mrp: 310, image: "/images/pb-sportscar.jpg" },
  { slug: "pb-avengers", name: "Avengers Pencil Box", kind: "stationery", category: "geometry-boxes", type: "SKI, lock code", price: 240, mrp: 285, image: "/images/pb-avengers.jpg" },
  { slug: "pb-captain", name: "Legendary Pencil Box with White Board", kind: "stationery", category: "geometry-boxes", type: "SKI", price: 230, mrp: 275, image: "/images/pb-captain.jpg" },
  { slug: "pb-puzzle", name: "Puzzle Pencil Box", kind: "stationery", category: "geometry-boxes", type: "SKI", price: 250, mrp: 299, image: "/images/pb-puzzle.jpg" },
  { slug: "pb-timetable", name: "Timetable Pencil Box", kind: "stationery", category: "geometry-boxes", type: "SKI", price: 195, mrp: 235, image: "/images/pb-timetable.jpg" },
  { slug: "geometry-scale", name: "621 Transparent Scale, 30 cm", kind: "stationery", category: "geometry-boxes", type: "Nataraj", price: 25, mrp: 30, image: "/images/ruler-nataraj.jpg" },

  // ---- Pouches ----
  { slug: "pouch-spiderman", name: "Spider-Man EVA Pencil Pouch", kind: "stationery", category: "geometry-boxes", type: "Padded, zipped", price: 380, mrp: 450, image: "/images/pouch-spiderman.jpg" },
  { slug: "pouch-eva", name: "Monster EVA Pencil Pouch", kind: "stationery", category: "geometry-boxes", type: "Padded, zipped", price: 360, mrp: 430, image: "/images/pouch-eva.jpg" },
  { slug: "pouch-monstees", name: "Monstees Almost Hidden Pouch", kind: "stationery", category: "geometry-boxes", type: "Padded, zipped", price: 360, mrp: 430, image: "/images/pouch-monstees.jpg" },
  { slug: "pouch-clear", name: "Clear Zip Pouch — Pack of 2", kind: "stationery", category: "geometry-boxes", type: "Transparent", price: 120, mrp: 150, image: "/images/pouch-clear.jpg" },

  // ---- Diaries ----
  { slug: "hardbound-diary", name: "Hardbound Diary", kind: "stationery", category: "diaries", type: "Undated", price: 180, mrp: 220, image: "/images/diaries.jpg" },

  // ---- Art, craft & kits ----
  { slug: "drawing-book", name: "Drawing Book", kind: "stationery", category: "drawing-books", type: "A4, thick sheets", price: 60, mrp: 70, image: "/images/drawing-book.png" },
  { slug: "studio-brushes", name: "Studio Brushes — 7 Piece", kind: "stationery", category: "drawing-books", type: "DOMS Model 67", price: 210, mrp: 250, image: "/images/cat-art.jpg" },
  { slug: "modelling-clay", name: "Modelling Clay — 12 Shades", kind: "stationery", category: "drawing-books", type: "DOMS", price: 110, mrp: 130, image: "/images/cat-clay.jpg" },
  { slug: "clay-set-24", name: "Modelling Clay Set with Cutters", kind: "stationery", category: "drawing-books", type: "24 shades", price: 285, mrp: 340, image: "/images/clay-set.jpg" },
  { slug: "painting-kit", name: "Painting Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 175, mrp: 199, mrpSource: "pack", image: "/images/cat-paintkit.jpg" },
  { slug: "kit-champions", name: "Champions Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 89, mrp: 99, mrpSource: "pack", image: "/images/kit-champions.jpg" },
  { slug: "kit-wonder", name: "Wonder Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 165, mrp: 199, image: "/images/kit-wonder.jpg" },
  { slug: "kit-speedz", name: "SpeedZ Stationery Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 210, mrp: 249, image: "/images/kit-speedz.jpg" },
  { slug: "kit-unicorn", name: "Unicorn Stationery Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 210, mrp: 249, image: "/images/kit-unicorn.jpg" },
  { slug: "kit-artgear", name: "Art Gear Kit with Backpack", kind: "stationery", category: "drawing-books", type: "DOMS", price: 719, mrp: 799, mrpSource: "pack", image: "/images/kit-artgear.jpg", badge: "New" },
  { slug: "art-carnival-kit", name: "Art Carnival Kit with Backpack", kind: "stationery", category: "drawing-books", type: "DOMS", price: 899, mrp: 1050, image: "/images/cat-schoolkit.jpg" },
  { slug: "art-on-wheels", name: "Art on Wheels Trolley Kit", kind: "stationery", category: "drawing-books", type: "DOMS", price: 1290, mrp: 1499, image: "/images/kit-artwheels.jpg" },
  { slug: "wooden-easel", name: "Wooden Easel Stand", kind: "stationery", category: "drawing-books", type: "Pine, adjustable", price: 1450, mrp: 1750, image: "/images/cat-easel.jpg" },

  // ---- School accessories ----
  { slug: "lunchbox-avengers", name: "Avengers Lunch Box", kind: "stationery", category: "geometry-boxes", type: "SKI, steel insert", price: 420, mrp: 499, image: "/images/lunchbox-avengers.jpg" },
  { slug: "water-bottles", name: "Character Water Bottle", kind: "stationery", category: "geometry-boxes", type: "With strap", price: 260, mrp: 310, image: "/images/water-bottles.jpg" },
  { slug: "toy-phones", name: "Character Toy Phone", kind: "stationery", category: "geometry-boxes", type: "SKI", price: 150, mrp: 185, image: "/images/toy-phones.jpg" },
];

export const allProducts = [...notebooks, ...stationery];

/** Everything ChoiceKraft sells apart from the books it prints itself. */
export const nonBookProducts = allProducts.filter((p) => p.kind !== "book");

export const productsInCategory = (slug) =>
  allProducts.filter((p) => p.category === slug);

export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
