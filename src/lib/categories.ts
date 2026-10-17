// Shelf categories derived from playlist titles. First matching rule wins.
const RULES: { name: string; pattern: RegExp }[] = [
  { name: "Tafsir Al-Qur'an", pattern: /tafsir|al-qur'an/i },
  { name: "Bahasa Arab", pattern: /bahasa arab|nahwu/i },
  { name: "Sirah dan sejarah", pattern: /sirah|tarikh|biografi|syamail|zadul|tabi'in|fushul|mawadhi/i },
  {
    name: "Aqidah dan tauhid",
    pattern:
      /aqidah|tauhid|iman|asma|husna|ushul|tsalatsah|qawaid|syubhat|thahawiyah|wasithiyah|firq|aliran|pembatal|jahiliyah|liberal|fadhlul|imam syafi/i,
  },
  { name: "Fiqih dan ibadah", pattern: /fiqih|thaharah|nikah|sholat|muamalah|zakat|umdatul|bidayatul|wanita/i },
  {
    name: "Hadits, adab, dan hati",
    pattern: /hadist|riyadush|adab|bukhari|arba|kaba'?ir|riqaq|fitan|doa|akhlak|hati|talbis|sabar|daa wad/i,
  },
];

export const OTHER_CATEGORY = "Kajian lainnya";

export function categorize(title: string): string {
  return RULES.find((r) => r.pattern.test(title))?.name ?? OTHER_CATEGORY;
}

export const CATEGORY_ORDER = [...RULES.map((r) => r.name), OTHER_CATEGORY];
