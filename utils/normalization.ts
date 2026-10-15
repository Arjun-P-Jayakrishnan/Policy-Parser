/**
 * Normalizes whitespace and trims a string value.
 */
export function normalizeText(input: string | undefined): string {
  return input?.replace(/\s+/g, " ").trim() ?? "";
}

/**
 * Removes whitespace and converts a vehicle registration number to uppercase.
 */
export function normalizeRegistration(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

/**
 * Extracts the RTO code prefix from a vehicle registration number.
 */
export function deriveRtoCode(registration: string): string {
  const match = /^([A-Z]{2}(?:\d{2}|\d[A-Z]))/.exec(registration);
  return match?.[1] ?? "";
}

/**
 * Uses an explicit RTO code when valid, otherwise derives it
 * from the vehicle registration number.
 */
export function normalizeRtoCode(
  sourceLocation: string,
  registration: string,
): string {
  if (/^[A-Z]{2}(?:\d{2}|\d[A-Z])$/i.test(sourceLocation)) {
    return sourceLocation.toUpperCase();
  }

  return deriveRtoCode(registration);
}

/**
 * Converts supported date formats into YYYY-MM-DD.
 * Returns an empty string when the input is invalid or unsupported.
 */
export function normalizeDate(input: string): string {
  const match = /\b(\d{1,2})[-/ ]([A-Za-z]{3}|\d{1,2})[-/ ](\d{4})\b/.exec(
    input,
  );

  if (!match) return "";

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const monthText = match[2]!;
  const month = /^\d+$/.test(monthText)
    ? Number(monthText)
    : months.indexOf(monthText.toLowerCase()) + 1;

  const day = Number(match[1]);
  const year = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    month < 1 ||
    month > 12 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Extracts the first numeric amount, ignoring thousands separators.
 */
export function normalizeAmount(input: string): string {
  const match = input.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match?.[0] ?? "";
}

/**
 * Converts a normalized numeric amount to a number.
 * Returns zero when the input is not a valid numeric amount.
 */
export function numericAmount(input: string): number {
  return /^-?\d+(?:\.\d+)?$/.test(input) ? Number(input) : 0;
}
