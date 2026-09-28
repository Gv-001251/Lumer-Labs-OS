/**
 * Helper library to parse Indian currency strings into numeric values.
 * Supports:
 * - Indian comma system: "2,00,000", "1,10,000", "10,000", "4,000"
 * - Trailing slash-dash: "4,000/-", "2,00,000/-"
 * - Lakh / Lakhs: "₹2 lakh", "₹2.5 lakh", "2.5 lakhs", "10 lakhs"
 * - Crore / Crores: "1 crore", "1.5 crores", "2.5 crore"
 * - Thousands multiplier: "25k", "25K", "2.5k"
 * - Currency prefixes: "₹", "Rs", "Rs.", "INR"
 */

export function parseIndianCurrency(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return isNaN(input) ? null : input;

  let str = input.trim();
  if (!str) return null;

  // Clean trailing /- or /-
  str = str.replace(/\/\-?$/g, "").trim();

  // Remove currency prefix symbols/words
  str = str.replace(/^(₹|rs\.?|inr)\s*/i, "").trim();

  // Check for Crore / Crores
  const croreMatch = str.match(/^([\d\.,]+)\s*(crore|crores|cr)\b/i);
  if (croreMatch) {
    const numPart = parseFloat(croreMatch[1].replace(/,/g, ""));
    if (!isNaN(numPart)) {
      return Math.round(numPart * 10000000);
    }
  }

  // Check for Lakh / Lakhs
  const lakhMatch = str.match(/^([\d\.,]+)\s*(lakh|lakhs|lac|lacs)\b/i);
  if (lakhMatch) {
    const numPart = parseFloat(lakhMatch[1].replace(/,/g, ""));
    if (!isNaN(numPart)) {
      return Math.round(numPart * 100000);
    }
  }

  // Check for Thousands "k" suffix (e.g., 25k, 2.5k)
  const kMatch = str.match(/^([\d\.,]+)\s*k\b/i);
  if (kMatch) {
    const numPart = parseFloat(kMatch[1].replace(/,/g, ""));
    if (!isNaN(numPart)) {
      return Math.round(numPart * 1000);
    }
  }

  // General numeric extraction with comma removal
  const cleanedNum = str.replace(/[^\d\.]/g, "");
  if (!cleanedNum) return null;

  const parsed = parseFloat(cleanedNum);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Formats a number into Indian currency representation (e.g. ₹2,00,000)
 */
export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
