/**
 * Types for the Multi-Base Abacus Application
 */

export type OperationType = '+' | '-' | '*' | '/';

export type AppMode = 'free' | 'operations' | 'practice';

export interface BaseConfig {
  base: number;
  name: string;
  symbol: string;
  description: string;
  digits: string[];
}

export interface RodData {
  index: number; // 0 is least significant (rightmost)
  placeValue: number; // base^index
  power: number; // exponent index
  activeBeads: number; // 0 to base - 1 (or overflow)
  maxBeads: number; // base - 1
  label: string; // e.g. "B^0", "B^1"
}

export interface ArithmeticStep {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description: string;
  mathDetail: string;
  currentRodIndex: number; // which rod is being modified
  abacusState: number[]; // digits on each rod (index 0 is least significant)
  highlightRods?: number[];
  carryOrBorrowValue?: number;
  intermediateNote?: string;
  isComplete?: boolean;
}

export interface PracticeProblem {
  id: string;
  type: 'arithmetic' | 'read_abacus' | 'set_abacus';
  base: number;
  operation?: OperationType;
  operandA: number;
  operandB?: number;
  correctAnswer: string; // representation in the current base
  correctAnswerDecimal: number;
  questionPrompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  explanation: string;
}

export interface PracticeStats {
  solvedCount: number;
  totalAttempted: number;
  currentStreak: number;
  bestStreak: number;
}
