/**
 * Base Math Utilities & Arithmetic Visualizer Engine
 * Supports Bases 2 through 16, Positional Conversions, and Step-by-Step Abacus Arithmetic.
 */

import { BaseConfig, ArithmeticStep, PracticeProblem, OperationType } from '../types';

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
 * Convert decimal number to array of rod values (index 0 is least significant rod, i.e. base^0)
 */
export function decimalToRods(decimalVal: number, base: number, numRods: number): number[] {
  const rods = new Array(numRods).fill(0);
  let remaining = Math.max(0, Math.floor(decimalVal));

  for (let i = 0; i < numRods; i++) {
    if (remaining === 0) break;
    rods[i] = remaining % base;
    remaining = Math.floor(remaining / base);
  }

  return rods;
}

/**
 * Convert array of rod values (index 0 = base^0) back to decimal integer
 */
export function rodsToDecimal(rods: number[], base: number): number {
  let total = 0;
  for (let i = 0; i < rods.length; i++) {
    total += rods[i] * Math.pow(base, i);
  }
  return total;
}

/**
 * Convert decimal number to string representation in given base
 */
export function decimalToBaseString(decimalVal: number, base: number): string {
  if (decimalVal === 0) return '0';
  let num = Math.abs(Math.floor(decimalVal));
  let result = '';
  while (num > 0) {
    const rem = num % base;
    result = valueToChar(rem) + result;
    num = Math.floor(num / base);
  }
  return decimalVal < 0 ? '-' + result : result;
}

/**
 * Convert string in given base to decimal number
 */
export function baseStringToDecimal(str: string, base: number): number {
  const clean = str.trim().toUpperCase();
  if (!clean) return 0;
  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const val = charToValue(clean[i]);
    if (val >= base) return NaN; // invalid digit for base
    total = total * base + val;
  }
  return total;
}

/**
 * Get polynomial expansion breakdown for display
 */
export function getPolynomialExpansion(rods: number[], base: number) {
  const terms: { digit: number; digitChar: string; power: number; placeVal: number; totalVal: number }[] = [];
  
  // From highest power down to 0
  for (let i = rods.length - 1; i >= 0; i--) {
    const digit = rods[i];
    if (digit > 0 || terms.length > 0 || i === 0) {
      const placeVal = Math.pow(base, i);
      terms.push({
        digit,
        digitChar: valueToChar(digit),
        power: i,
        placeVal,
        totalVal: digit * placeVal,
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
export function generateAdditionSteps(a: number, b: number, base: number, numRods: number): ArithmeticStep[] {
  const steps: ArithmeticStep[] = [];
  const rodsA = decimalToRods(a, base, numRods);
  const rodsB = decimalToRods(b, base, numRods);
  const currentRods = [...rodsA];

  const strA = decimalToBaseString(a, base);
  const strB = decimalToBaseString(b, base);
  const sum = a + b;
  const strSum = decimalToBaseString(sum, base);

  // Step 0: Initialize
  steps.push({
    stepIndex: 0,
    totalSteps: 1, // updated at end
    title: 'Initialize Abacus with Operand A',
    description: `Place the first operand ${strA}₍${base}₎ (${a} in decimal) onto the abacus rods.`,
    mathDetail: `Operand A = ${strA}₍${base}₎, Operand B = ${strB}₍${base}₎`,
    currentRodIndex: 0,
    abacusState: [...currentRods],
    highlightRods: [],
  });

  let carry = 0;
  // Iterate through each rod from least significant (0) to highest
  for (let i = 0; i < numRods; i++) {
    const digitB = rodsB[i] || 0;
    const digitA = currentRods[i] || 0;

    if (digitB === 0 && carry === 0 && i > 0 && rodsToDecimal(currentRods, base) === sum) {
      // Nothing left to add
      break;
    }

    const initialDigit = currentRods[i];
    const totalAtRod = initialDigit + digitB + carry;
    const newDigit = totalAtRod % base;
    const nextCarry = Math.floor(totalAtRod / base);

    // Step 1: Add digit and previous carry to rod
    const placeVal = Math.pow(base, i);
    const powerLabel = `${base}^${i} (${placeVal})`;

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

    steps.push({
      stepIndex: steps.length,
      totalSteps: 0,
      title: `Rod ${i} (${base}ᵖᵒʷᵉʳ ${i}): Add ${valueToChar(digitB)}${carry ? ` + carry ${carry}` : ''}`,
      description: desc,
      mathDetail: `${valueToChar(initialDigit)} + ${valueToChar(digitB)}${carry ? ` + ${carry}` : ''} = ${totalAtRod}₍₁₀₎ = ${nextCarry ? `${nextCarry}×${base} + ` : ''}${newDigit} → digit is ${valueToChar(newDigit)}${nextCarry ? `, carry ${nextCarry}` : ''}`,
      currentRodIndex: i,
      abacusState: [...currentRods],
      highlightRods: nextCarry ? [i, i + 1] : [i],
      carryOrBorrowValue: nextCarry,
      intermediateNote: nextCarry ? `Carry +${nextCarry} to rod ${i + 1}` : undefined,
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
  });

  // Set totalSteps
  const total = steps.length;
  steps.forEach(s => (s.totalSteps = total));
  return steps;
}

/**
 * Generate step-by-step subtraction on the abacus
 */
export function generateSubtractionSteps(a: number, b: number, base: number, numRods: number): ArithmeticStep[] {
  // Ensure non-negative for standard abacus demonstration
  if (a < b) {
    // swap for intuitive visual, or handle swap note
    return generateSubtractionSteps(b, a, base, numRods);
  }

  const steps: ArithmeticStep[] = [];
  const rodsA = decimalToRods(a, base, numRods);
  const rodsB = decimalToRods(b, base, numRods);
  const currentRods = [...rodsA];

  const strA = decimalToBaseString(a, base);
  const strB = decimalToBaseString(b, base);
  const diff = a - b;
  const strDiff = decimalToBaseString(diff, base);

  steps.push({
    stepIndex: 0,
    totalSteps: 1,
    title: 'Initialize Abacus with Minuend A',
    description: `Place the starting number ${strA}₍${base}₎ (${a} in decimal) onto the abacus rods.`,
    mathDetail: `A = ${strA}₍${base}₎ (${a}), B = ${strB}₍${base}₎ (${b})`,
    currentRodIndex: 0,
    abacusState: [...currentRods],
  });

  let borrow = 0;
  for (let i = 0; i < numRods; i++) {
    const digitB = rodsB[i] || 0;
    const initialDigit = currentRods[i];
    const needed = digitB + borrow;

    if (digitB === 0 && borrow === 0 && i > 0 && rodsToDecimal(currentRods, base) === diff) {
      break;
    }

    if (initialDigit < needed) {
      // Need to borrow from higher rod
      // Find next rod with beads
      let nextRod = i + 1;
      while (nextRod < numRods && currentRods[nextRod] === 0) {
        nextRod++;
      }

      const placeVal = Math.pow(base, i);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        title: `Rod ${i}: Borrow from Rod ${i + 1}`,
        description: `Rod ${i} has ${valueToChar(initialDigit)} beads, but needs to subtract ${needed} (${digitB}${borrow ? ` + borrow 1` : ''}). We borrow 1 bead from Rod ${i + 1}, giving +${base} beads to Rod ${i}!`,
        mathDetail: `Digit ${valueToChar(initialDigit)} < ${needed}. Borrow 1 from ${base}^${i + 1} (value ${Math.pow(base, i + 1)}), adding ${base} to rod ${i} (value ${placeVal}).`,
        currentRodIndex: i,
        abacusState: [...currentRods],
        highlightRods: [i, i + 1],
        carryOrBorrowValue: -1,
        intermediateNote: `Borrowing 1 from rod ${i + 1}`,
      });

      // Execute borrow
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
  });

  const total = steps.length;
  steps.forEach(s => (s.totalSteps = total));
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
  type: 'arithmetic' | 'read_abacus' | 'set_abacus' = 'arithmetic'
): PracticeProblem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let opA = 0;
  let opB = 0;
  let answerDec = 0;
  let prompt = '';
  const hints: string[] = [];
  let explanation = '';

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
