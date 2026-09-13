/**
 * Safely parses any value (number, string, Prisma Decimal object with {s, e, d}) into a valid JavaScript number.
 */
export function parseSafeNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? fallback : parsed;
  }
  if (typeof val === 'object') {
    if (typeof val.toNumber === 'function') {
      return val.toNumber();
    }
    // Handle Prisma Decimal object { s, e, d }
    if (val.d && Array.isArray(val.d)) {
      const sign = val.s === -1 ? -1 : 1;
      const digits = val.d.join('');
      const exp = typeof val.e === 'number' ? val.e : 0;
      if (digits.length === 0) return fallback;
      const numStr = digits.slice(0, exp + 1) + (digits.length > exp + 1 ? '.' + digits.slice(exp + 1) : '');
      const num = parseFloat(numStr) * sign;
      return isNaN(num) ? fallback : num;
    }
  }
  return fallback;
}

/**
 * Formats a value as Peruvian Soles currency (S/ XX.XX).
 */
export function formatMoney(val: any): string {
  const num = parseSafeNumber(val, 0);
  return `S/ ${num.toFixed(2)}`;
}
