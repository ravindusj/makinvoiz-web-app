// Utility functions for generating unique identifiers

/**
 * Generate a unique bill number
 * Format: BILL-XXXXXX (where XXXXXX is a 6-digit number)
 */
export function generateBillNumber(): string {
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  return `BILL-${randomNum}`;
}

/**
 * Generate a unique quotation number
 * Format: QUO-XXXXXX (where XXXXXX is a 6-digit number)
 */
export function generateQuotationNumber(): string {
  const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  return `QUO-${randomNum}`;
}

/**
 * Generate a unique ID for items
 */
export function generateUniqueId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}
