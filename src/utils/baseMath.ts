/**
 * Base Math Utilities & Arithmetic Visualizer Engine
 * Supports Bases 2 through 16, Positional Conversions, and Step-by-Step Abacus Arithmetic.
 */

import { BaseConfig, ArithmeticStep, PracticeProblem, OperationType } from '../types';
import { getPrimeFactors } from './fractionMath';

export const BASE_CONFIGS: Record<number, BaseConfig> = {
  2: {
    base: 2,
    name: 'Binary',
    symbol: 'BIN',
    description: 'Base 2 used in modern computing. Only 2 digits (0 and 1). Each rod represents powers of 2 (1, 2, 4, 8, 16, 32...).',
    digits: ['0', '1'],
  },
  3: {
    base: 3,
    name: 'Ternary',
    symbol: 'TER',
    description: 'Base 3 with digits 0, 1, 2. Each rod represents powers of 3 (1, 3, 9, 27, 81...).',
    digits: ['0', '1', '2'],
  },
  4: {
    base: 4,
    name: 'Quaternary',
    symbol: 'QUA',
    description: 'Base 4 with digits 0, 1, 2, 3. Each rod represents powers of 4 (1, 4, 16, 64...).',
    digits: ['0', '1', '2', '3'],
  },
  5: {
    base: 5,
    name: 'Quinary',
    symbol: 'QUI',
    description: 'Base 5 using digits 0 to 4. Historically used in five-finger counting systems.',
    digits: ['0', '1', '2', '3', '4'],
  },
  6: {
    base: 6,
    name: 'Senary',
    symbol: 'SEN',
    description: 'Base 6 using digits 0 to 5. Highly divisible among small integers.',
    digits: ['0', '1', '2', '3', '4', '5'],
  },
  7: {
    base: 7,
    name: 'Septenary',
    symbol: 'SEP',
    description: 'Base 7 using digits 0 to 6. Related to the 7-day week cycle.',
    digits: ['0', '1', '2', '3', '4', '5', '6'],
  },
  8: {
    base: 8,
    name: 'Octal',
    symbol: 'OCT',
    description: 'Base 8 using digits 0 to 7. Powers of 8 (1, 8, 64, 512). Directly maps 3 binary bits to 1 octal digit.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7'],
  },
  9: {
    base: 9,
    name: 'Nonary',
    symbol: 'NON',
    description: 'Base 9 using digits 0 to 8. Each nonary digit packs 2 ternary trits.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
  },
  10: {
    base: 10,
    name: 'Decimal',
    symbol: 'DEC',
    description: 'Standard human base 10 using digits 0 to 9. Powers of 10 (1, 10, 100, 1000...).',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  11: {
    base: 11,
    name: 'Undecimal',
    symbol: 'UND',
    description: 'Base 11 using digits 0 to 9 and A (val 10). A prime number base.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A'],
  },
  12: {
    base: 12,
    name: 'Duodecimal',
    symbol: 'DUO',
    description: 'Base 12 using digits 0 to 9, A, B. Divisible by 2, 3, 4, and 6. Popular in units (dozen, hours, inches).',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B'],
  },
  13: {
    base: 13,
    name: 'Tridecimal',
    symbol: 'TRI',
    description: 'Base 13 using digits 0 to 9, A, B, C.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C'],
  },
  14: {
    base: 14,
    name: 'Tetradecimal',
    symbol: 'TET',
    description: 'Base 14 using digits 0 to 9, A, B, C, D.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'],
  },
  15: {
    base: 15,
    name: 'Pentadecimal',
    symbol: 'PEN',
    description: 'Base 15 using digits 0 to 9, A, B, C, D, E.',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E'],
  },
  16: {
    base: 16,
    name: 'Hexadecimal',
    symbol: 'HEX',
    description: 'Base 16 using digits 0-9 and A-F. Widely used in computing; each hex digit directly represents 4 binary bits (one nibble).',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
  },
};

export const ALL_DIGITS = '0123456789ABCDEF';

export function getBaseConfig(base: number): BaseConfig {
  if (BASE_CONFIGS[base]) return BASE_CONFIGS[base];
  const digits = ALL_DIGITS.slice(0, base).split('');
  return {
    base,
    name: `Base ${base}`,
    symbol: `B${base}`,
    description: `Base ${base} positional numeral system using digits 0 to ${digits[digits.length - 1]}.`,
    digits,
  };
}

/**
 * Convert a digit character to its numeric value
 */
export function charToValue(char: string): number {
  const c = char.toUpperCase();
  const idx = ALL_DIGITS.indexOf(c);
  return idx >= 0 ? idx : 0;
}

/**
 * Convert a numeric value (0-15) to its digit character
 */
export function valueToChar(val: number): string {
  if (val < 0) return '0';
  if (val >= ALL_DIGITS.length) return ALL_DIGITS[ALL_DIGITS.length - 1];
  return ALL_DIGITS[val];
}

/**
 * Convert decimal number to array of rod values
 * Index 0 is the lowest power rod: power = 0 - fractionalRods.
 * Total rods = numRods.
 */
export function decimalToRods(
  decimalVal: number,
  base: number,
  numRods: number,
  fractionalRods: number = 0
): number[] {
  const rods = new Array(numRods).fill(0);
  if (isNaN(decimalVal) || decimalVal <= 0) return rods;

  const intPart = Math.floor(decimalVal);
  const fracPart = decimalVal - intPart;

  // Fill integer rods (indices fractionalRods up to numRods - 1)
  const integerStartIndex = fractionalRods;
  let remainingInt = intPart;
  for (let i = integerStartIndex; i < numRods; i++) {
    if (remainingInt === 0) break;
    rods[i] = remainingInt % base;
    remainingInt = Math.floor(remainingInt / base);
  }

  // Fill fractional rods (indices fractionalRods - 1 down to 0)
  // Rod at index fractionalRods - 1 has power -1
  // Rod at index 0 has power -fractionalRods
  if (fractionalRods > 0 && fracPart > 1e-11) {
    let remFrac = fracPart;
    for (let f = 1; f <= fractionalRods; f++) {
      const rodIdx = fractionalRods - f;
      remFrac = remFrac * base;
      const digit = Math.floor(remFrac + 1e-9);
      rods[rodIdx] = Math.min(base - 1, digit);
      remFrac = remFrac - digit;
      if (remFrac < 1e-11) break;
    }
  }

  return rods;
}

/**
 * Convert array of rod values back to decimal number
 * Rod index i has power = i - fractionalRods
 */
export function rodsToDecimal(
  rods: number[],
  base: number,
  fractionalRods: number = 0
): number {
  let total = 0;
  for (let i = 0; i < rods.length; i++) {
    const power = i - fractionalRods;
    total += (rods[i] || 0) * Math.pow(base, power);
  }
  // Round to avoid IEEE 754 precision drift
  return Math.round(total * 1e9) / 1e9;
}

/**
 * Convert decimal number to string representation in given base with optional radix point
 */
export function decimalToBaseString(
  decimalVal: number,
  base: number,
  maxFractionDigits: number = 6
): string {
  if (isNaN(decimalVal)) return '0';
  if (decimalVal === 0) return '0';

  const isNeg = decimalVal < 0;
  const absVal = Math.abs(decimalVal);
  let intPart = Math.floor(absVal);
  const fracPart = absVal - intPart;

  let intStr = '';
  if (intPart === 0) {
    intStr = '0';
  } else {
    while (intPart > 0) {
      const rem = intPart % base;
      intStr = valueToChar(rem) + intStr;
      intPart = Math.floor(intPart / base);
    }
  }

  let fracStr = '';
  if (fracPart > 1e-9 && maxFractionDigits > 0) {
    let remFrac = fracPart;
    for (let i = 0; i < maxFractionDigits; i++) {
      if (remFrac < 1e-9) break;
      remFrac = remFrac * base;
      const digit = Math.floor(remFrac + 1e-9);
      fracStr += valueToChar(Math.min(base - 1, digit));
      remFrac = remFrac - digit;
    }
    // Trim trailing zeros
    fracStr = fracStr.replace(/0+$/, '');
  }

  const result = fracStr ? `${intStr}.${fracStr}` : intStr;
  return isNeg ? '-' + result : result;
}

/**
 * Convert string in given base (supports integers, radix points, and fractions like "3/4") to decimal number
 */
export function baseStringToDecimal(str: string, base: number): number {
  const clean = str.trim().toUpperCase();
  if (!clean) return 0;

  // Check for fraction format like "3/4" or "1 1/2"
  if (clean.includes('/')) {
    const slashIdx = clean.indexOf('/');
    const leftStr = clean.slice(0, slashIdx).trim();
    const rightStr = clean.slice(slashIdx + 1).trim();

    let wholeDec = 0;
    let numStr = leftStr;
    if (leftStr.includes(' ')) {
      const parts = leftStr.split(/\s+/);
      wholeDec = baseStringToDecimal(parts[0], base);
      numStr = parts[1];
    }
    const numDec = baseStringToDecimal(numStr, base);
    const denDec = baseStringToDecimal(rightStr, base);
    if (!isNaN(numDec) && !isNaN(denDec) && denDec !== 0) {
      return wholeDec + numDec / denDec;
    }
    return NaN;
  }

  const isNeg = clean.startsWith('-');
  const unsigned = isNeg ? clean.slice(1) : clean;

  const dotIdx = unsigned.indexOf('.');
  if (dotIdx === -1) {
    let total = 0;
    for (let i = 0; i < unsigned.length; i++) {
      const val = charToValue(unsigned[i]);
      if (val >= base) return NaN; // invalid digit for base
      total = total * base + val;
    }
    return isNeg ? -total : total;
  }

  const intPartStr = unsigned.slice(0, dotIdx);
  const fracPartStr = unsigned.slice(dotIdx + 1);

  let total = 0;
  for (let i = 0; i < intPartStr.length; i++) {
    const val = charToValue(intPartStr[i]);
    if (val >= base) return NaN;
    total = total * base + val;
  }

  for (let i = 0; i < fracPartStr.length; i++) {
    const val = charToValue(fracPartStr[i]);
    if (val >= base) return NaN;
    total += val * Math.pow(base, -(i + 1));
  }

  const finalVal = isNeg ? -total : total;
  return Math.round(finalVal * 1e9) / 1e9;
}

/**
 * Get polynomial expansion breakdown for display (supports negative powers / fractional rods)
 */
export function getPolynomialExpansion(
  rods: number[],
  base: number,
  fractionalRods: number = 0
) {
  const terms: {
    digit: number;
    digitChar: string;
    power: number;
    placeVal: number;
    fractionLabel?: string;
    totalVal: number;
    isFractional: boolean;
  }[] = [];

  // From highest power down to lowest power
  for (let i = rods.length - 1; i >= 0; i--) {
    const digit = rods[i] || 0;
    const power = i - fractionalRods;
    const placeVal = Math.pow(base, power);
    const isFractional = power < 0;

    let fractionLabel: string | undefined = undefined;
    if (isFractional) {
      const denom = Math.round(Math.pow(base, -power));
      fractionLabel = `1/${denom}`;
    }

    if (digit > 0 || terms.length > 0 || power === 0) {
      terms.push({
        digit,
        digitChar: valueToChar(digit),
        power,
        placeVal,
        fractionLabel,
        totalVal: digit * placeVal,
        isFractional,
      });
    }
  }
  return terms;
}

// -------------------------------------------------------------
// ARITHMETIC STEP GENERATION
// -------------------------------------------------------------

/**
 * Generate step-by-step addition on the abacus
 */
export function generateAdditionSteps(
  a: number,
  b: number,
  base: number,
  numRods: number,
  fractionalRods: number = 0
): ArithmeticStep[] {
  const steps: ArithmeticStep[] = [];
  const rodsA = decimalToRods(a, base, numRods, fractionalRods);
  const rodsB = decimalToRods(b, base, numRods, fractionalRods);
  const currentRods = [...rodsA];

  const strA = decimalToBaseString(a, base);
  const strB = decimalToBaseString(b, base);
  const sum = Math.round((a + b) * 1e9) / 1e9;
  const strSum = decimalToBaseString(sum, base);

  // Step 0: Initialize
  steps.push({
    stepIndex: 0,
    totalSteps: 1,
    title: 'Initialize Abacus with Operand A',
    description: `Place the first operand ${strA}₍${base}₎ (${a} in decimal) onto the abacus rods.${
      fractionalRods > 0 ? ` (Including ${fractionalRods} fractional rod${fractionalRods > 1 ? 's' : ''})` : ''
    }`,
    mathDetail: `Operand A = ${strA}₍${base}₎, Operand B = ${strB}₍${base}₎`,
    currentRodIndex: 0,
    abacusState: [...currentRods],
    highlightRods: [],
    fractionalRods,
  });

  let carry = 0;
  // Iterate through each rod from lowest power (0) to highest
  for (let i = 0; i < numRods; i++) {
    const power = i - fractionalRods;
    const isFractional = power < 0;
    const digitB = rodsB[i] || 0;
    const digitA = currentRods[i] || 0;

    if (digitB === 0 && carry === 0 && i > fractionalRods && rodsToDecimal(currentRods, base, fractionalRods) === sum) {
      break;
    }

    const initialDigit = currentRods[i];
    const totalAtRod = initialDigit + digitB + carry;
    const newDigit = totalAtRod % base;
    const nextCarry = Math.floor(totalAtRod / base);

    const placeVal = Math.pow(base, power);
    const powerLabel = isFractional
      ? `${base}^(${power}) = 1/${Math.round(Math.pow(base, -power))}`
      : `${base}^${power} (${placeVal})`;

    let desc = `Rod ${i} [${powerLabel}]: Current bead count is ${valueToChar(initialDigit)}. `;
    if (carry > 0) {
      desc += `Add carried 1 bead from previous rod, plus ${valueToChar(digitB)} (${digitB}) from operand B. `;
    } else {
      desc += `Add ${valueToChar(digitB)} (${digitB}) beads from operand B. `;
    }
    desc += `Sum is ${totalAtRod} in base 10.`;

    if (totalAtRod >= base) {
      desc += ` Since this is ≥ base ${base}, we keep ${valueToChar(newDigit)} (${newDigit}) beads on this rod and carry ${nextCarry} to the next rod!`;
    }

    currentRods[i] = newDigit;

    const isCrossingRadix = i === fractionalRods - 1 && nextCarry > 0;

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Rod ${i} (${isFractional ? 'Fractional ' : ''}${base}ᵖᵒʷᵉʳ ${power}): Add ${valueToChar(digitB)}${carry ? ` + carry ${carry}` : ''}`,
      description: desc,
      mathDetail: `${valueToChar(initialDigit)} + ${valueToChar(digitB)}${carry ? ` + ${carry}` : ''} = ${totalAtRod}₍₁₀₎ = ${nextCarry ? `${nextCarry}×${base} + ` : ''}${newDigit} → digit is ${valueToChar(newDigit)}${nextCarry ? `, carry ${nextCarry}` : ''}`,
      currentRodIndex: i,
      abacusState: [...currentRods],
      highlightRods: nextCarry ? [i, i + 1] : [i],
      carryOrBorrowValue: nextCarry,
      intermediateNote: isCrossingRadix
        ? `Carry +${nextCarry} across radix point into whole units rod (base^0)!`
        : nextCarry
        ? `Carry +${nextCarry} to rod ${i + 1}`
        : undefined,
      fractionalRods,
    });

    carry = nextCarry;
  }

  // Final step
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Addition Complete',
    description: `The final sum on the abacus is ${strSum}₍${base}₎, which equals ${sum} in decimal.`,
    mathDetail: `${strA}₍${base}₎ + ${strB}₍${base}₎ = ${strSum}₍${base}₎ (${a} + ${b} = ${sum})`,
    currentRodIndex: -1,
    abacusState: [...currentRods],
    isComplete: true,
    fractionalRods,
  });

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

/**
 * Generate step-by-step subtraction on the abacus
 */
export function generateSubtractionSteps(
  a: number,
  b: number,
  base: number,
  numRods: number,
  fractionalRods: number = 0
): ArithmeticStep[] {
  if (a < b) {
    return generateSubtractionSteps(b, a, base, numRods, fractionalRods);
  }

  const steps: ArithmeticStep[] = [];
  const rodsA = decimalToRods(a, base, numRods, fractionalRods);
  const rodsB = decimalToRods(b, base, numRods, fractionalRods);
  const currentRods = [...rodsA];

  const strA = decimalToBaseString(a, base);
  const strB = decimalToBaseString(b, base);
  const diff = Math.round((a - b) * 1e9) / 1e9;
  const strDiff = decimalToBaseString(diff, base);

  steps.push({
    stepIndex: 0,
    totalSteps: 1,
    title: 'Initialize Abacus with Minuend A',
    description: `Place the starting number ${strA}₍${base}₎ (${a} in decimal) onto the abacus rods.${
      fractionalRods > 0 ? ` (Including ${fractionalRods} fractional rod${fractionalRods > 1 ? 's' : ''})` : ''
    }`,
    mathDetail: `A = ${strA}₍${base}₎ (${a}), B = ${strB}₍${base}₎ (${b})`,
    currentRodIndex: 0,
    abacusState: [...currentRods],
    fractionalRods,
  });

  let borrow = 0;
  for (let i = 0; i < numRods; i++) {
    const power = i - fractionalRods;
    const isFractional = power < 0;
    const digitB = rodsB[i] || 0;
    const initialDigit = currentRods[i];
    const needed = digitB + borrow;

    if (digitB === 0 && borrow === 0 && i > fractionalRods && rodsToDecimal(currentRods, base, fractionalRods) === diff) {
      break;
    }

    if (initialDigit < needed) {
      let nextRod = i + 1;
      while (nextRod < numRods && currentRods[nextRod] === 0) {
        nextRod++;
      }

      const placeVal = Math.pow(base, power);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rod ${i} (${isFractional ? 'Fractional ' : ''}Power ${power}): Borrow from Rod ${i + 1}`,
        description: `Rod ${i} has ${valueToChar(initialDigit)} beads, but needs to subtract ${needed}. We borrow 1 bead from Rod ${i + 1}, adding +${base} beads to Rod ${i}!`,
        mathDetail: `Digit ${valueToChar(initialDigit)} < ${needed}. Borrow 1 from higher rod, adding ${base} to rod ${i}.`,
        currentRodIndex: i,
        abacusState: [...currentRods],
        highlightRods: [i, i + 1],
        carryOrBorrowValue: -1,
        intermediateNote: `Borrowing 1 from rod ${i + 1}`,
        fractionalRods,
      });

      currentRods[i + 1] -= 1;
      const newDigit = initialDigit + base - needed;
      currentRods[i] = newDigit;
      borrow = 0;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rod ${i}: Subtract after Borrow`,
        description: `With the borrowed ${base} beads, Rod ${i} now has (${initialDigit} + ${base}) - ${needed} = ${newDigit} beads (${valueToChar(newDigit)}).`,
        mathDetail: `(${initialDigit} + ${base}) - ${needed} = ${newDigit} → digit is ${valueToChar(newDigit)}`,
        currentRodIndex: i,
        abacusState: [...currentRods],
        highlightRods: [i],
        fractionalRods,
      });
    } else {
      const newDigit = initialDigit - needed;
      currentRods[i] = newDigit;
      borrow = 0;

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rod ${i}: Subtract ${valueToChar(digitB)}`,
        description: `Rod ${i} has ${valueToChar(initialDigit)} beads. Remove ${needed} beads. Remaining is ${valueToChar(newDigit)} beads.`,
        mathDetail: `${valueToChar(initialDigit)} - ${needed} = ${valueToChar(newDigit)}`,
        currentRodIndex: i,
        abacusState: [...currentRods],
        highlightRods: [i],
        fractionalRods,
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Subtraction Complete',
    description: `The result of subtraction on the abacus is ${strDiff}₍${base}₎, which equals ${diff} in decimal.`,
    mathDetail: `${strA}₍${base}₎ - ${strB}₍${base}₎ = ${strDiff}₍${base}₎ (${a} - ${b} = ${diff})`,
    currentRodIndex: -1,
    abacusState: [...currentRods],
    isComplete: true,
    fractionalRods,
  });

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

/**
 * Generate step-by-step multiplication on the abacus
 */
export function generateMultiplicationSteps(a: number, b: number, base: number, numRods: number): ArithmeticStep[] {
  const steps: ArithmeticStep[] = [];
  const rodsA = decimalToRods(a, base, numRods);
  const rodsB = decimalToRods(b, base, numRods);
  let currentRods = new Array(numRods).fill(0);

  const strA = decimalToBaseString(a, base);
  const strB = decimalToBaseString(b, base);
  const product = a * b;
  const strProd = decimalToBaseString(product, base);

  steps.push({
    stepIndex: 0,
    totalSteps: 1,
    title: 'Initialize Abacus for Multiplication',
    description: `Clear all rods to 0. We will compute ${strA}₍${base}₎ × ${strB}₍${base}₎ (${a} × ${b}) by accumulating rod-by-rod products.`,
    mathDetail: `Multiplicand A = ${strA}₍${base}₎, Multiplier B = ${strB}₍${base}₎`,
    currentRodIndex: 0,
    abacusState: [...currentRods],
  });

  // Digits of B
  const lenB = rodsB.reduce((acc, val, idx) => (val > 0 ? idx + 1 : acc), 1);
  const lenA = rodsA.reduce((acc, val, idx) => (val > 0 ? idx + 1 : acc), 1);

  let accumulated = 0;

  for (let j = 0; j < lenB; j++) {
    const digitB = rodsB[j];
    if (digitB === 0) continue;

    for (let i = 0; i < lenA; i++) {
      const digitA = rodsA[i];
      if (digitA === 0) continue;

      const partial = digitA * digitB;
      const targetRod = i + j;
      accumulated += partial * Math.pow(base, targetRod);
      currentRods = decimalToRods(accumulated, base, numRods);

      const targetPlaceVal = Math.pow(base, targetRod);
      const strCurrent = decimalToBaseString(accumulated, base);

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Multiply ${valueToChar(digitA)} (Rod ${i}) × ${valueToChar(digitB)} (Rod ${j})`,
        description: `Multiply digit ${valueToChar(digitA)} at power ${i} by digit ${valueToChar(digitB)} at power ${j}. Partial product is ${partial}₍₁₀₎ added starting at Rod ${targetRod} (${base}^${targetRod} = ${targetPlaceVal}).`,
        mathDetail: `${valueToChar(digitA)}₍${base}₎ × ${valueToChar(digitB)}₍${base}₎ = ${partial}₍₁₀₎ (${decimalToBaseString(partial, base)}₍${base}₎). Added to rod position ${targetRod}. Running total: ${strCurrent}₍${base}₎.`,
        currentRodIndex: targetRod,
        abacusState: [...currentRods],
        highlightRods: [targetRod, Math.min(numRods - 1, targetRod + 1)],
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Multiplication Complete',
    description: `All partial products accumulated! The product on the abacus is ${strProd}₍${base}₎, which equals ${product} in decimal.`,
    mathDetail: `${strA}₍${base}₎ × ${strB}₍${base}₎ = ${strProd}₍${base}₎ (${a} × ${b} = ${product})`,
    currentRodIndex: -1,
    abacusState: [...currentRods],
    isComplete: true,
  });

  const total = steps.length;
  steps.forEach(s => (s.totalSteps = total));
  return steps;
}

/**
 * Generate step-by-step division on the abacus (Dividend / Divisor)
 */
export function generateDivisionSteps(dividend: number, divisor: number, base: number, numRods: number): ArithmeticStep[] {
  const steps: ArithmeticStep[] = [];
  if (divisor <= 0) {
    divisor = 1;
  }

  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;

  const strDividend = decimalToBaseString(dividend, base);
  const strDivisor = decimalToBaseString(divisor, base);
  const strQuotient = decimalToBaseString(quotient, base);
  const strRemainder = decimalToBaseString(remainder, base);

  const initialRods = decimalToRods(dividend, base, numRods);
  let currentRods = [...initialRods];

  steps.push({
    stepIndex: 0,
    totalSteps: 1,
    title: 'Initialize Abacus with Dividend',
    description: `Place dividend ${strDividend}₍${base}₎ (${dividend}) on the abacus. Divisor is ${strDivisor}₍${base}₎ (${divisor}). We will extract multiples of the divisor from highest rods down.`,
    mathDetail: `${strDividend}₍${base}₎ ÷ ${strDivisor}₍${base}₎`,
    currentRodIndex: numRods - 1,
    abacusState: [...currentRods],
  });

  // Find the highest rod with a bead
  let highestRod = numRods - 1;
  while (highestRod > 0 && initialRods[highestRod] === 0) {
    highestRod--;
  }

  let runningRemainder = 0;
  const quotientRods = new Array(numRods).fill(0);

  for (let r = highestRod; r >= 0; r--) {
    const digit = initialRods[r];
    runningRemainder = runningRemainder * base + digit;
    const qDigit = Math.floor(runningRemainder / divisor);
    const subtractVal = qDigit * divisor;
    runningRemainder -= subtractVal;
    quotientRods[r] = qDigit;

    // Remaining abacus value
    const currentDec = runningRemainder * Math.pow(base, r);
    // update abacus state to reflect remaining un-divided amount
    currentRods = decimalToRods(currentDec, base, numRods);

    if (qDigit > 0 || r === 0) {
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rod ${r}: Divisor fits ${valueToChar(qDigit)} time(s)`,
        description: `At power ${base}^${r}, partial dividend is ${runningRemainder + subtractVal} in base 10. Divisor ${divisor} fits ${qDigit} times (digit '${valueToChar(qDigit)}'). Subtract ${subtractVal} from abacus, leaving remainder ${runningRemainder} for next rod.`,
        mathDetail: `${runningRemainder + subtractVal} ÷ ${divisor} = ${qDigit} with remainder ${runningRemainder}`,
        currentRodIndex: r,
        abacusState: [...currentRods],
        highlightRods: [r],
        intermediateNote: `Quotient rod ${r} gets digit '${valueToChar(qDigit)}'`,
      });
    }
  }

  // Final step: show Quotient and Remainder
  const finalQuotientRods = decimalToRods(quotient, base, numRods);
  steps.push({
    stepIndex: steps.length,
    totalSteps: 0,
    title: 'Division Complete',
    description: `Division complete! Quotient is ${strQuotient}₍${base}₎ (${quotient}) with Remainder ${strRemainder}₍${base}₎ (${remainder}). The abacus now displays the quotient.`,
    mathDetail: `${strDividend}₍${base}₎ ÷ ${strDivisor}₍${base}₎ = ${strQuotient}₍${base}₎ R ${strRemainder}₍${base}₎`,
    currentRodIndex: -1,
    abacusState: [...finalQuotientRods],
    isComplete: true,
  });

  const total = steps.length;
  steps.forEach(s => (s.totalSteps = total));
  return steps;
}

// -------------------------------------------------------------
// PRACTICE PROBLEM GENERATOR
// -------------------------------------------------------------

export function generatePracticeProblem(
  base: number,
  operation: OperationType = '+',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  type: 'arithmetic' | 'read_abacus' | 'set_abacus' | 'fraction_convert' | 'terminating_check' = 'arithmetic'
): PracticeProblem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let opA = 0;
  let opB = 0;
  let answerDec = 0;
  let prompt = '';
  const hints: string[] = [];
  let explanation = '';

  // Fraction Conversion Problem
  if (type === 'fraction_convert') {
    const pool = [
      { n: 1, d: 2, label: '1/2', dec: 0.5 },
      { n: 1, d: 4, label: '1/4', dec: 0.25 },
      { n: 3, d: 4, label: '3/4', dec: 0.75 },
      { n: 1, d: 8, label: '1/8', dec: 0.125 },
      { n: 3, d: 8, label: '3/8', dec: 0.375 },
      { n: 5, d: 8, label: '5/8', dec: 0.625 },
      { n: 7, d: 8, label: '7/8', dec: 0.875 },
      { n: 1, d: base, label: `1/${base}`, dec: 1 / base },
      { n: Math.floor(base / 2), d: base, label: `${Math.floor(base / 2)}/${base}`, dec: Math.floor(base / 2) / base },
      { n: 1, d: 16, label: '1/16', dec: 0.0625 },
    ];

    // Filter candidates that terminate cleanly in this base or have <= 3 radix digits
    const valid = pool.filter((c) => {
      const s = decimalToBaseString(c.dec, base, 4);
      return s.includes('.') && s.split('.')[1].length <= 3;
    });
    const chosen = (valid.length > 0 ? valid : pool)[
      Math.floor(Math.random() * (valid.length > 0 ? valid.length : pool.length))
    ];
    const correctBaseStr = decimalToBaseString(chosen.dec, base, 4);

    prompt = `Convert the fraction ${chosen.label} (decimal ${chosen.dec}) to Base ${base} with a radix point:`;
    hints.push(`Multiply the fraction by ${base}: ${chosen.dec} × ${base} = ${(chosen.dec * base).toFixed(3)}.`);
    hints.push(`The integer part of the product gives the first digit after the radix point.`);
    hints.push(`In Base ${base}, 1/${base} is written as 0.1.`);
    explanation = `${chosen.label} (${chosen.dec}) in Base ${base} is ${correctBaseStr}₍${base}₎.`;

    return {
      id,
      type: 'fraction_convert',
      base,
      operandA: chosen.dec,
      correctAnswer: correctBaseStr,
      correctAnswerDecimal: chosen.dec,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
      fractionLabel: chosen.label,
      isFraction: true,
    };
  }

  // Terminating vs Repeating Check Problem
  if (type === 'terminating_check') {
    const fractionsPool = [
      { n: 1, d: 2, label: '1/2' },
      { n: 1, d: 3, label: '1/3' },
      { n: 1, d: 4, label: '1/4' },
      { n: 1, d: 5, label: '1/5' },
      { n: 1, d: 6, label: '1/6' },
      { n: 1, d: 8, label: '1/8' },
      { n: 1, d: 10, label: '1/10' },
      { n: 3, d: 16, label: '3/16' },
      { n: 1, d: 12, label: '1/12' },
    ];
    const pick = fractionsPool[Math.floor(Math.random() * fractionsPool.length)];
    const qFactors = Array.from(new Set(getPrimeFactors(pick.d)));
    const doesTerminate = qFactors.every((f) => base % f === 0);
    const correctAns = doesTerminate ? 'TERMINATING' : 'REPEATING';

    prompt = `Does the fraction ${pick.label} have a TERMINATING or REPEATING radix expansion in Base ${base}?`;
    hints.push(`Prime factor(s) of denominator ${pick.d}: [${qFactors.join(', ')}].`);
    hints.push(`A fraction terminates in Base ${base} if and only if all prime factors of its denominator divide ${base}.`);
    hints.push(`Does ${base} divide cleanly by every factor in [${qFactors.join(', ')}]?`);
    explanation = doesTerminate
      ? `${pick.label} TERMINATES in Base ${base} because prime factor(s) [${qFactors.join(', ')}] divide ${base}.`
      : `${pick.label} REPEATS infinitely in Base ${base} because denominator contains prime factor(s) not dividing ${base}.`;

    return {
      id,
      type: 'terminating_check',
      base,
      operandA: pick.n / pick.d,
      correctAnswer: correctAns,
      correctAnswerDecimal: doesTerminate ? 1 : 0,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
      fractionLabel: pick.label,
      isFraction: true,
    };
  }

  // Max value scale depending on base and difficulty
  const baseRange = {
    easy: { min: 1, max: base * 2 },
    medium: { min: base, max: Math.min(255, base * base * 2) },
    hard: { min: base * base, max: Math.min(4095, base * base * 4) },
  }[difficulty];

  if (type === 'read_abacus') {
    const val = Math.floor(Math.random() * (baseRange.max - baseRange.min)) + baseRange.min;
    const strVal = decimalToBaseString(val, base);
    answerDec = val;
    prompt = `Look at the abacus. What is the value shown in Base ${base} (${getBaseConfig(base).name})?`;
    hints.push(`Start from the rightmost rod (base^0 = 1) and multiply each rod's active bead count by its power of ${base}.`);
    hints.push(`The place values from right to left are: 1, ${base}, ${base * base}...`);
    hints.push(`Add the values together in base ${base} or compute decimal and convert.`);
    explanation = `The rods from left to right represent digits '${strVal}'. In Base ${base}, this is ${strVal}₍${base}₎ (equals ${val} in decimal).`;

    return {
      id,
      type: 'read_abacus',
      base,
      operandA: val,
      correctAnswer: strVal,
      correctAnswerDecimal: val,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
    };
  }

  if (type === 'set_abacus') {
    const val = Math.floor(Math.random() * (baseRange.max - baseRange.min)) + baseRange.min;
    const strVal = decimalToBaseString(val, base);
    answerDec = val;
    prompt = `Set the abacus to represent the number ${strVal}₍${base}₎ (decimal ${val}).`;
    hints.push(`Each rod should match the corresponding digit of '${strVal}' from left to right.`);
    hints.push(`The rightmost rod needs ${charToValue(strVal[strVal.length - 1])} beads.`);
    hints.push(`Slide beads up to match: ${strVal.split('').join(' ')}`);
    explanation = `To represent ${strVal}₍${base}₎ on the abacus, slide active beads matching each digit into place.`;

    return {
      id,
      type: 'set_abacus',
      base,
      operandA: val,
      correctAnswer: strVal,
      correctAnswerDecimal: val,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
    };
  }

  // Arithmetic Problem (+, -, *, /)
  if (operation === '+') {
    opA = Math.floor(Math.random() * (baseRange.max - baseRange.min)) + baseRange.min;
    opB = Math.floor(Math.random() * (baseRange.max - baseRange.min)) + 1;
    answerDec = opA + opB;
    const strA = decimalToBaseString(opA, base);
    const strB = decimalToBaseString(opB, base);
    const strAns = decimalToBaseString(answerDec, base);

    prompt = `Calculate in Base ${base}: ${strA} + ${strB} = ?`;
    hints.push(`Remember that in Base ${base}, a carry is generated whenever the rod sum reaches ${base} (not 10).`);
    hints.push(`Least significant column: ${valueToChar(opA % base)} + ${valueToChar(opB % base)}.`);
    hints.push(`Total sum in decimal is ${opA} + ${opB} = ${answerDec}. In Base ${base}, that is ${strAns}.`);
    explanation = `${strA}₍${base}₎ + ${strB}₍${base}₎ = ${strAns}₍${base}₎. (${opA} + ${opB} = ${answerDec} in decimal).`;

    return {
      id,
      type: 'arithmetic',
      base,
      operation: '+',
      operandA: opA,
      operandB: opB,
      correctAnswer: strAns,
      correctAnswerDecimal: answerDec,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
    };
  }

  if (operation === '-') {
    opA = Math.floor(Math.random() * (baseRange.max - baseRange.min)) + baseRange.min + 2;
    opB = Math.floor(Math.random() * (opA - 1)) + 1;
    answerDec = opA - opB;
    const strA = decimalToBaseString(opA, base);
    const strB = decimalToBaseString(opB, base);
    const strAns = decimalToBaseString(answerDec, base);

    prompt = `Calculate in Base ${base}: ${strA} - ${strB} = ?`;
    hints.push(`When borrowing from the next rod to the left, 1 borrowed bead is worth +${base} on the current rod!`);
    hints.push(`Check if the units rod needs a borrow: ${valueToChar(opA % base)} vs ${valueToChar(opB % base)}.`);
    hints.push(`Decimal equivalent: ${opA} - ${opB} = ${answerDec}.`);
    explanation = `${strA}₍${base}₎ - ${strB}₍${base}₎ = ${strAns}₍${base}₎. (${opA} - ${opB} = ${answerDec} in decimal).`;

    return {
      id,
      type: 'arithmetic',
      base,
      operation: '-',
      operandA: opA,
      operandB: opB,
      correctAnswer: strAns,
      correctAnswerDecimal: answerDec,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
    };
  }

  if (operation === '*') {
    const maxVal = difficulty === 'easy' ? base : Math.min(base * 2, 24);
    opA = Math.floor(Math.random() * maxVal) + 2;
    opB = Math.floor(Math.random() * Math.min(maxVal, base + 2)) + 2;
    answerDec = opA * opB;
    const strA = decimalToBaseString(opA, base);
    const strB = decimalToBaseString(opB, base);
    const strAns = decimalToBaseString(answerDec, base);

    prompt = `Calculate in Base ${base}: ${strA} × ${strB} = ?`;
    hints.push(`Multiply digit by digit, shifting one rod to the left for each higher power of ${base}.`);
    hints.push(`In decimal: ${opA} × ${opB} = ${answerDec}. Convert ${answerDec} to Base ${base}.`);
    hints.push(`Divide ${answerDec} by ${base}: quotient is ${Math.floor(answerDec / base)}, remainder is ${answerDec % base}.`);
    explanation = `${strA}₍${base}₎ × ${strB}₍${base}₎ = ${strAns}₍${base}₎. (${opA} × ${opB} = ${answerDec} in decimal).`;

    return {
      id,
      type: 'arithmetic',
      base,
      operation: '*',
      operandA: opA,
      operandB: opB,
      correctAnswer: strAns,
      correctAnswerDecimal: answerDec,
      questionPrompt: prompt,
      difficulty,
      hints,
      explanation,
    };
  }

  // Division (/)
  const quotient = Math.floor(Math.random() * (difficulty === 'easy' ? base : base + 4)) + 1;
  opB = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : base)) + 2;
  opA = quotient * opB; // exact division for clean practice
  answerDec = quotient;
  const strA = decimalToBaseString(opA, base);
  const strB = decimalToBaseString(opB, base);
  const strAns = decimalToBaseString(answerDec, base);

  prompt = `Calculate in Base ${base}: ${strA} ÷ ${strB} = ?`;
  hints.push(`Think in reverse: what number multiplied by ${strB} gives ${strA}?`);
  hints.push(`In decimal: ${opA} ÷ ${opB} = ${answerDec}.`);
  hints.push(`Convert ${answerDec} into Base ${base}.`);
  explanation = `${strA}₍${base}₎ ÷ ${strB}₍${base}₎ = ${strAns}₍${base}₎. (${opA} ÷ ${opB} = ${answerDec} in decimal).`;

  return {
    id,
    type: 'arithmetic',
    base,
    operation: '/',
    operandA: opA,
    operandB: opB,
    correctAnswer: strAns,
    correctAnswerDecimal: answerDec,
    questionPrompt: prompt,
    difficulty,
    hints,
    explanation,
  };
}
