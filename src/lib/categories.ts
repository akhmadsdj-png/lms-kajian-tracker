// Shelf categories derived from playlist titles. First matching rule wins.
// `color` paints the category tiles on the browse page.
const RULES: { name: string; slug: string; color: string; pattern: RegExp }[] = [
  { name: "Tafsir Al-Qur'an", slug: "tafsir", color: "#1e6f5c", pattern: /tafsir|al-qur'an/i },
  { name: "Bahasa Arab", slug: "bahasa-arab", color: "#8a5a19", pattern: /bahasa arab|nahwu/i },
  {
    name: "Sirah dan sejarah",
    slug: "sirah",
    color: "#7a3b2e",
    pattern: /sirah|tarikh|biografi|syamail|zadul|tabi'in|fushul|mawadhi/i,
  },
  {
    name: "Aqidah dan tauhid",
    slug: "aqidah",
    color: "#2f4b8f",
    pattern:
      /aqidah|tauhid|iman|asma|husna|ushul|tsalatsah|qawaid|syubhat|thahawiyah|wasithiyah|firq|aliran|pembatal|jahiliyah|liberal|fadhlul|imam syafi/i,
  },
  {
    name: "Fiqih dan ibadah",
    slug: "fiqih",
    color: "#5b3f8c",
    pattern: /fiqih|thaharah|nikah|sholat|muamalah|zakat|umdatul|bidayatul|wanita/i,
  },
  {
    name: "Hadits, adab, dan hati",
    slug: "hadits",
    color: "#8c3a5b",
    pattern: /hadist|riyadush|adab|bukhari|arba|kaba'?ir|riqaq|fitan|doa|akhlak|hati|talbis|sabar|daa wad/i,
  },
];

export const OTHER_CATEGORY = "Kajian lainnya";

export function categorize(title: string): string {
  return RULES.find((r) => r.pattern.test(title))?.name ?? OTHER_CATEGORY;
}

export const CATEGORY_ORDER = [...RULES.map((r) => r.name), OTHER_CATEGORY];

export const CATEGORIES = [
  ...RULES.map(({ name, slug, color }) => ({ name, slug, color })),
  { name: OTHER_CATEGORY, slug: "lainnya", color: "#3d4656" },
];
