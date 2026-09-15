/**
 * Fraction & Radix Math Utilities
 * Handles exact fractions, decimal-fraction conversions, radix expansions,
 * terminating vs repeating fraction analysis, and step-by-step multiplication.
 */

import { valueToChar, charToValue } from './baseMath';

export interface SimplifiedFraction {
  numerator: number;
  denominator: number;
  whole: number;
  remainderNumerator: number;
  formatted: string; // e.g. "3/4" or "2 1/4"
  decimal: number;
}

export interface RadixStep {
  step: number;
  currentFraction: number;
  multiplied: number;
  digitValue: number;
  digitChar: string;
  remainingFraction: number;
}

export interface FractionAnalysis {
  numerator: number;
  denominator: number;
  decimal: number;
  base: number;
  isTerminating: boolean;
  baseString: string;
  nonRepeatingPart: string;
  repeatingPart: string;
  primeFactorsDenominator: number[];
  primeFactorsBase: number[];
  explanation: string;
  steps: RadixStep[];
}

/**
 * Greatest Common Divisor (Euclidean algorithm)
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b > 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Prime factorization of an integer
 */
export function getPrimeFactors(n: number): number[] {
  let num = Math.abs(Math.round(n));
  const factors: number[] = [];
  let divisor = 2;
  while (num >= 2) {
    if (num % divisor === 0) {
      factors.push(divisor);
      num = num / divisor;
    } else {
      divisor++;
      if (divisor * divisor > num) {
        if (num > 1) {
          factors.push(num);
          break;
        }
      }
    }
  }
  return factors;
}

/**
 * Get unique prime factors
 */
export function getUniquePrimeFactors(n: number): number[] {
  return Array.from(new Set(getPrimeFactors(n)));
}

/**
 * Simplify a fraction to lowest terms
 */
export function simplifyFraction(numerator: number, denominator: number): SimplifiedFraction {
  if (denominator === 0) {
    return {
      numerator: 0,
      denominator: 1,
      whole: 0,
      remainderNumerator: 0,
      formatted: '0',
      decimal: 0,
    };
  }

  const sign = (numerator < 0) !== (denominator < 0) ? -1 : 1;
  const num = Math.abs(Math.round(numerator));
  const den = Math.abs(Math.round(denominator));
  const divisor = gcd(num, den);

  const simpNum = (num / divisor) * sign;
  const simpDen = den / divisor;
  const whole = Math.floor(Math.abs(simpNum) / simpDen) * sign;
  const remainderNumerator = Math.abs(simpNum) % simpDen;

  let formatted = '';
  if (remainderNumerator === 0) {
    formatted = `${whole}`;
  } else if (Math.abs(whole) > 0) {
    formatted = `${whole} ${remainderNumerator}/${simpDen}`;
  } else {
    formatted = `${simpNum}/${simpDen}`;
  }

  return {
    numerator: simpNum,
    denominator: simpDen,
    whole,
    remainderNumerator,
    formatted,
    decimal: simpNum / simpDen,
  };
}

/**
 * Parse fraction or decimal string (e.g. "3/4", "1 1/2", "0.75", "2.5")
 */
export function parseFractionOrDecimal(input: string): { numerator: number; denominator: number; decimal: number } | null {
  const clean = input.trim();
  if (!clean) return null;

  // Case 1: Mixed fraction like "1 1/2" or "2 3/4"
  if (clean.includes(' ') && clean.includes('/')) {
    const parts = clean.split(/\s+/);
    if (parts.length === 2) {
      const whole = parseInt(parts[0], 10);
      const fracParts = parts[1].split('/');
      if (fracParts.length === 2) {
        const n = parseInt(fracParts[0], 10);
        const d = parseInt(fracParts[1], 10);
        if (!isNaN(whole) && !isNaN(n) && !isNaN(d) && d > 0) {
          const totalN = Math.sign(whole) >= 0 ? whole * d + n : whole * d - n;
          return { numerator: totalN, denominator: d, decimal: totalN / d };
        }
      }
    }
  }

  // Case 2: Simple fraction like "3/4" or "-5/8"
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      const n = parseInt(parts[0], 10);
      const d = parseInt(parts[1], 10);
      if (!isNaN(n) && !isNaN(d) && d !== 0) {
        return { numerator: n, denominator: d, decimal: n / d };
      }
    }
  }

  // Case 3: Decimal number like "0.75" or "3.125"
  const dec = parseFloat(clean);
  if (!isNaN(dec)) {
    // Convert decimal to exact fraction
    const frac = decimalToFraction(dec);
    return { numerator: frac.numerator, denominator: frac.denominator, decimal: dec };
  }

  return null;
}

/**
 * Convert decimal number to best matching fraction using continued fractions / Farey sequence
 */
export function decimalToFraction(decimalVal: number, maxDenominator = 10000): SimplifiedFraction {
  if (Math.abs(decimalVal) < 1e-10) {
    return simplifyFraction(0, 1);
  }

  const sign = Math.sign(decimalVal);
  let x = Math.abs(decimalVal);
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = x;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(x - h1 / k1) > x * 1e-8 && k1 <= maxDenominator && isFinite(b));

  return simplifyFraction(h1 * sign, k1);
}

/**
 * Check if fraction terminates in given base B:
 * A simplified fraction p/q terminates in base B if and only if
 * every prime factor of q divides B.
 */
export function doesFractionTerminate(denominator: number, base: number): boolean {
  const qFactors = getUniquePrimeFactors(denominator);
  return qFactors.every((factor) => base % factor === 0);
}

/**
 * Analyze fraction expansion in base B:
 * Calculates digits, detects repeating period, generates step-by-step multiplication trace
 */
export function analyzeFractionInBase(
  numerator: number,
  denominator: number,
  base: number,
  maxSteps = 16
): FractionAnalysis {
  const simp = simplifyFraction(numerator, denominator);
  const num = Math.abs(simp.numerator);
  const den = simp.denominator;
  const wholePart = Math.floor(num / den);
  let fracPart = (num % den) / den;

  const isTerminating = doesFractionTerminate(den, base);
  const qFactors = getUniquePrimeFactors(den);
  const bFactors = getUniquePrimeFactors(base);

  const steps: RadixStep[] = [];
  const seenRemainders = new Map<number, number>(); // remainder -> step index

  let nonRepeatingDigits = '';
  let repeatingDigits = '';
  let periodStart = -1;

  let currentRemainder = num % den;

  for (let i = 0; i < maxSteps; i++) {
    if (currentRemainder === 0) break;

    // Detect cycle
    if (seenRemainders.has(currentRemainder)) {
      periodStart = seenRemainders.get(currentRemainder)!;
      break;
    }
    seenRemainders.set(currentRemainder, i);

    const multiplied = currentRemainder * base;
    const digit = Math.floor(multiplied / den);
    const nextRemainder = multiplied % den;

    steps.push({
      step: i + 1,
      currentFraction: currentRemainder / den,
      multiplied: multiplied / den,
      digitValue: digit,
      digitChar: valueToChar(digit),
      remainingFraction: nextRemainder / den,
    });

    currentRemainder = nextRemainder;
  }

  const allDigits = steps.map((s) => s.digitChar).join('');
  let baseString = '';
  const wholeString = wholePart.toString(base).toUpperCase();

  if (steps.length === 0) {
    baseString = wholeString;
    nonRepeatingDigits = '0';
  } else if (periodStart >= 0) {
    nonRepeatingDigits = allDigits.slice(0, periodStart);
    repeatingDigits = allDigits.slice(periodStart);
    baseString = `${wholeString}.${nonRepeatingDigits}(${repeatingDigits})`;
  } else {
    nonRepeatingDigits = allDigits;
    baseString = `${wholeString}.${allDigits}${isTerminating ? '' : '...'}`;
  }

  // Generate clear mathematical explanation
  let explanation = '';
  if (isTerminating) {
    explanation = `The fraction ${simp.formatted} terminates in base ${base} because every prime factor of denominator ${den} (${qFactors.join(
      ', '
    ) || '1'}) divides base ${base}.`;
  } else {
    const missingFactors = qFactors.filter((f) => base % f !== 0);
    explanation = `The fraction ${simp.formatted} repeats infinitely in base ${base} because denominator ${den} contains prime factor(s) [${missingFactors.join(
      ', '
    )}] that do not divide base ${base}.`;
  }

  return {
    numerator: simp.numerator,
    denominator: simp.denominator,
    decimal: simp.decimal,
    base,
    isTerminating,
    baseString,
    nonRepeatingPart: nonRepeatingDigits,
    repeatingPart: repeatingDigits,
    primeFactorsDenominator: qFactors,
    primeFactorsBase: bFactors,
    explanation,
    steps,
  };
}
