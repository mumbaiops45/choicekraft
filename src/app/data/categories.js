// The full ChoiceKraft category list.
//
// Order matches the previous site's "Shop By Category" grid, read left to
// right, four per row:
//   Diaries      Erasers        Sticky Notes     Drawing Books
//   Glues        Staplers       Scissors         Paperclips
//   Notebooks    Pens           Pencils          Sharpeners
//   Files        Geometry Boxes Tape Dispensers  Punches
//
// `image` = a real product photo from /public/images.
// `icon`  = lucide icon name, used as a tinted fallback tile where no photo
//           exists yet. Add an `image` and the tile switches automatically.
export const categories = [
  // Row 1
  {
    slug: "diaries",
    name: "Diaries",
    tagline: "Dated & undated planners",
    href: "/category/diaries",
    image: "/images/diaries.jpg",
  },
  {
    slug: "erasers",
    name: "Erasers",
    tagline: "Dust-free & kneadable",
    href: "/category/erasers",
    icon: "Eraser",
    tint: "#f06048",
    image: "/images/erasers.png",
  },
  {
    slug: "sticky-notes",
    name: "Sticky Notes",
    tagline: "Flags, tabs & memo pads",
    href: "/category/sticky-notes",
    icon: "StickyNote",
    tint: "#ffc000",
    image: "/images/sticky-notes.png",

  },
  {
    slug: "drawing-books",
    name: "Drawing Books",
    tagline: "Sketch pads & art paper",
    href: "/category/drawing-books",
    icon: "Palette",
    tint: "#904890",
    image: "/images/drawing-book.png",

  },

  // Row 2
  {
    slug: "glues",
    name: "Glues",
    tagline: "Sticks, tubes & adhesives",
    href: "/category/glues",
    icon: "Droplet",
    tint: "#4890c0",
    image: "/images/glues.png",

  },
  {
    slug: "staplers",
    name: "Staplers",
    tagline: "Mini to heavy duty",
    href: "/category/staplers",
    image: "/images/cat-stapler.jpg",
  },
  {
    slug: "scissors",
    name: "Scissors",
    tagline: "School & office cutters",
    href: "/category/scissors",
    icon: "Scissors",
    tint: "#48c0a8",
    image: "/images/scissors.png",

  },
  {
    slug: "paperclips",
    name: "Paperclips",
    tagline: "Clips, pins & binder clips",
    href: "/category/paperclips",
    icon: "Paperclip",
    tint: "#4860a8",
    image: "/images/paperclips.png",
  },

  // Row 3
  {
    slug: "notebooks",
    name: "Notebooks",
    tagline: "A4 long & exercise books",
    href: "/notebooks",
    image: "/images/nb-chipmunks.jpg",
  },
  {
    slug: "pens",
    name: "Pens",
    tagline: "Gel, ball & marker pens",
    href: "/category/pens",
    image: "/images/cat-pens.jpg",
  },
  {
    slug: "pencils",
    name: "Pencils",
    tagline: "Graphite & colour pencils",
    href: "/category/pencils",
    icon: "Pencil",
    tint: "#f06018",
    image: "/images/pencils.png",
  },
  {
    slug: "sharpeners",
    name: "Sharpeners",
    tagline: "Single & double hole",
    href: "/category/sharpeners",
    image: "/images/cat-sharpener.jpg",
  },

  // Row 4
  {
    slug: "files",
    name: "Files & Folders",
    tagline: "Ring binders & wallets",
    href: "/category/files",
    image: "/images/cat-files.jpg",
  },
  {
    slug: "geometry-boxes",
    name: "Geometry Boxes",
    tagline: "Instrument & pencil boxes",
    href: "/category/geometry-boxes",
    image: "/images/cat-pencilbox.jpg",
  },
  {
    slug: "tape-dispensers",
    name: "Tape Dispensers",
    tagline: "Desk & handheld rolls",
    href: "/category/tape-dispensers",
    icon: "CircleDot",
    tint: "#e91e78",
    image: "/images/tape-dispenser.png",
  },
  {
    slug: "punches",
    name: "Punches",
    tagline: "Two-hole & heavy duty",
    href: "/category/punches",
    image: "/images/cat-punch.jpg",
  },
];

export const findCategory = (slug) =>
  categories.find((category) => category.slug === slug);
