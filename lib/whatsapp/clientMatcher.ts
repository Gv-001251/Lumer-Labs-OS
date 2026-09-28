import { createClient } from "@/lib/supabase/client";

export interface MatchedClientResult {
  matched: boolean;
  client?: {
    id: string;
    clientCode: string;
    businessName: string;
    status: string;
    monthlyHandling?: number;
    amountDue?: number;
  };
  confidence: number; // 0.0 to 1.0
  isAmbiguous: boolean;
  notes?: string;
}

/**
 * Normalizes a string by converting to lowercase, stripping punctuation, and trimming extra spaces.
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates Jaccard word-set similarity score between two strings (0.0 to 1.0).
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.85;

  const set1 = new Set(norm1.split(" "));
  const set2 = new Set(norm2.split(" "));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Generates the next available client code formatted as LL-XXX (e.g., LL-001, LL-002, LL-003).
 */
export async function generateNextClientCode(existingClients: Array<{ clientCode: string }>): Promise<string> {
  let maxNum = 0;

  for (const c of existingClients) {
    if (c.clientCode) {
      const match = c.clientCode.match(/^LL-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  return `LL-${String(nextNum).padStart(3, "0")}`;
}

/**
 * Matches a client by clientCode first, then by normalized business name.
 */
export function matchClientInMemory(
  searchCode?: string,
  searchName?: string,
  clientList: Array<{ id: string; clientCode: string; businessName: string; status: string; monthlyHandling?: number; amountDue?: number }> = []
): MatchedClientResult {
  // 1. Search by client_code first
  if (searchCode) {
    const normCode = searchCode.trim().toUpperCase();
    const exactCodeMatch = clientList.find((c) => c.clientCode && c.clientCode.toUpperCase() === normCode);
    if (exactCodeMatch) {
      return {
        matched: true,
        client: exactCodeMatch,
        confidence: 1.0,
        isAmbiguous: false,
      };
    }
  }

  // 2. Search by normalized client name
  if (searchName) {
    const normSearch = normalizeString(searchName);
    let bestMatch: (typeof clientList)[0] | undefined;
    let maxScore = 0;
    let matchesAboveThresholdCount = 0;

    for (const client of clientList) {
      const score = calculateSimilarity(searchName, client.businessName);
      if (score > 0.4) {
        if (score > maxScore) {
          maxScore = score;
          bestMatch = client;
        }
        if (score >= 0.75) {
          matchesAboveThresholdCount++;
        }
      }
    }

    if (bestMatch && maxScore >= 0.7) {
      return {
        matched: true,
        client: bestMatch,
        confidence: maxScore,
        isAmbiguous: matchesAboveThresholdCount > 1,
      };
    }
  }

  return {
    matched: false,
    confidence: 0,
    isAmbiguous: false,
    notes: "No client matched criteria",
  };
}
