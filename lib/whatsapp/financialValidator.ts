import { formatIndianCurrency } from "./indianCurrency";

export interface ValidationResult {
  isValid: boolean;
  hasDiscrepancy: boolean;
  calculatedPending: number;
  statedPending?: number;
  discrepancyMessage?: string;
  notes?: string;
}

/**
 * Validates financial figures, calculates pending receivables, and flags discrepancies
 * between manually stated pending amounts and system-calculated financial history.
 */
export function validateFinancials(params: {
  totalExpectedAmount: number; // Project Value or Monthly Package
  totalPaidSoFar: number; // Sum of prior payments + current payment
  statedPendingAmount?: number; // Manually specified pending value from message
}): ValidationResult {
  const { totalExpectedAmount, totalPaidSoFar, statedPendingAmount } = params;

  // System calculated pending balance
  const calculatedPending = Math.max(0, totalExpectedAmount - totalPaidSoFar);

  if (statedPendingAmount !== undefined && statedPendingAmount !== null) {
    if (statedPendingAmount !== calculatedPending) {
      return {
        isValid: true,
        hasDiscrepancy: true,
        calculatedPending,
        statedPending: statedPendingAmount,
        discrepancyMessage: `Payment discrepancy detected: Stated pending ${formatIndianCurrency(
          statedPendingAmount
        )} vs Calculated pending ${formatIndianCurrency(calculatedPending)}`,
        notes: `Manual pending amount (${statedPendingAmount}) conflicts with expected calculation (${calculatedPending}). Requires review in AI Inbox.`,
      };
    }
  }

  return {
    isValid: true,
    hasDiscrepancy: false,
    calculatedPending,
    statedPending: statedPendingAmount,
  };
}
