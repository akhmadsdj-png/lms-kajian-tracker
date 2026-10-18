/**
 * Donation details. Defaults below are what the site shows today; any of them can be
 * overridden with environment variables without touching code:
 *
 *   DONATION_ACCOUNTS="BSI|7123456789|Nama Pemilik;DANA|0851…"   (name optional)
 *   DONATION_QR_IMAGE="/donasi-dana.png"     image path or URL
 *   DONATION_QR_LABEL="Scan dengan aplikasi DANA"
 *   DONATION_QR_LINK="https://link.dana.id/…"   opens the same payment on a phone
 *   DONATION_WHATSAPP="6281234567890"         country code, no + or spaces
 *
 * Set a variable to an empty string to hide that part.
 */
const DEFAULTS = {
  accounts: "DANA|085156115262",
  qrImage: "/donasi-dana.png",
  qrLabel: "Scan dengan aplikasi DANA",
  // The DANA profile QR encodes this link (not a QRIS code), so it only works in DANA
  qrLink: "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012024080565195414",
  whatsapp: "6285156115262",
};

export interface DonationAccount {
  bank: string;
  number: string;
  holder: string | null;
}

function setting(name: string, fallback: string) {
  const value = process.env[name];
  return (value === undefined ? fallback : value.trim()) || null;
}

export function getDonationInfo() {
  const accounts: DonationAccount[] = (setting("DONATION_ACCOUNTS", DEFAULTS.accounts) ?? "")
    .split(";")
    .map((entry) => entry.split("|").map((part) => part.trim()))
    .filter(([bank, number]) => bank && number)
    .map(([bank, number, holder]) => ({ bank, number, holder: holder || null }));

  const qrImage = setting("DONATION_QR_IMAGE", DEFAULTS.qrImage);

  return {
    accounts,
    qr: qrImage
      ? {
          image: qrImage,
          label: setting("DONATION_QR_LABEL", DEFAULTS.qrLabel),
          link: setting("DONATION_QR_LINK", DEFAULTS.qrLink),
        }
      : null,
    whatsapp: setting("DONATION_WHATSAPP", DEFAULTS.whatsapp)?.replace(/\D/g, "") || null,
  };
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
