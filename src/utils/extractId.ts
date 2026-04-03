import { AppError } from "./appError";

export default function extractId(name: string, id: unknown): number {
  // 1. Reject Arrays immediately
  if (Array.isArray(id)) {
    throw new AppError(`Multiple ${name} IDs provided. Only one is allowed.`, 400);
  }

  // 2. Ensure we are dealing with a string or a number
  if (typeof id !== "string" && typeof id !== "number") {
    throw new AppError(`Invalid ${name} ID format`, 400);
  }

  const candidate = String(id).trim();

  // 3. Strict Numeric Check (No decimals, no letters, no symbols)
  // ^\d+$ ensures the string is ONLY digits from start to finish
  if (!/^\d+$/.test(candidate)) {
    throw new AppError(`Invalid ${name} ID: Must be a whole number`, 400);
  }

  const extractedId = parseInt(candidate, 10);

  // 4. Logical Validation (Database IDs are typically > 0)
  if (extractedId <= 0) {
    throw new AppError(`${name} ID must be a positive integer`, 400);
  }

  // 5. Safety: Prevent 32-bit Integer Overflow
  if (extractedId > 2147483647) {
    throw new AppError(`${name} ID is out of allowed range`, 400);
  }

  return extractedId;
}
