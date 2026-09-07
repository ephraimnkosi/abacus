import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { OperationType, PracticeProblem, PracticeStats } from '../types';
import { Abacus } from './Abacus';
import {
  generatePracticeProblem,
  getBaseConfig,
  decimalToRods,
  rodsToDecimal,
  decimalToBaseString,
  charToValue,
} from '../utils/baseMath';
import { playSuccessChime, playBeadClick } from '../utils/audio';
import {
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface PracticeModeProps {
  base: number;
  numRods: number;
  onOpenVisualizerWithProblem?: (a: number, b: number, op: OperationType) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  base,
  numRods,
  onOpenVisualizerWithProblem,
}) => {
  const [opFilter, setOpFilter] = useState<OperationType | 'mixed'>('+');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problemType, setProblemType] = useState<'arithmetic' | 'read_abacus' | 'set_abacus'>('arithmetic');

  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [practiceRods, setPracticeRods] = useState<number[]>(new Array(numRods).fill(0));

  // Hint & Reveal state
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<'correct' | 'incorrect' | null>(null);

  // User Stats
  const [stats, setStats] = useState<PracticeStats>({
    solvedCount: 0,
    totalAttempted: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  // Generate new problem
  const handleNewProblem = useCallback(() => {
    let op: OperationType = '+';
    if (opFilter === 'mixed') {
      const ops: OperationType[] = ['+', '-', '*', '/'];
      op = ops[Math.floor(Math.random() * ops.length)];
    } else {
      op = opFilter;
    }

    const newProb = generatePracticeProblem(base, op, difficulty, problemType);
    setProblem(newProb);
    setUserAnswer('');
    setHintsRevealed(0);
    setIsSolutionRevealed(false);
    setEvaluationResult(null);

    // If type is read_abacus, initialize abacus with the operand value
    if (newProb.type === 'read_abacus') {
      setPracticeRods(decimalToRods(newProb.operandA, base, numRods));
    } else {
      setPracticeRods(new Array(numRods).fill(0));
    }
  }, [base, numRods, opFilter, difficulty, problemType]);

  useEffect(() => {
    handleNewProblem();
  }, [handleNewProblem]);

  const handleCheckAnswer = () => {
    if (!problem || evaluationResult === 'correct') return;

    let isCorrect = false;

    if (problem.type === 'set_abacus') {
      const currentVal = rodsToDecimal(practiceRods, base);
      isCorrect = currentVal === problem.correctAnswerDecimal;
    } else {
      const cleanAnswer = userAnswer.trim().toUpperCase();
      const cleanTarget = problem.correctAnswer.trim().toUpperCase();
      isCorrect = cleanAnswer === cleanTarget;
    }

    if (isCorrect) {
      setEvaluationResult('correct');
      playSuccessChime();

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // graceful confetti fallback
      }

      setStats((prev) => {
        const nextStreak = prev.currentStreak + 1;
        return {
          solvedCount: prev.solvedCount + 1,
          totalAttempted: prev.totalAttempted + 1,
          currentStreak: nextStreak,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
        };
      });
    } else {
      setEvaluationResult('incorrect');
      setStats((prev) => ({
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
        currentStreak: 0,
      }));
    }
  };

  const handleRevealHint = () => {
    if (!problem) return;
    if (hintsRevealed < problem.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  const handleRevealSolution = () => {
    setIsSolutionRevealed(true);
  };

  const config = getBaseConfig(base);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Filter & Scoreboard Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Practice Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Topic:
            </span>
            {[
              { type: 'arithmetic', label: 'Arithmetic (+, -, ×, ÷)' },
              { type: 'read_abacus', label: 'Read Abacus' },
              { type: 'set_abacus', label: 'Set Abacus' },
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setProblemType(item.type as any)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  problemType === item.type
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Difficulty Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-700 font-medium">Difficulty:</span>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  difficulty === diff
                    ? 'bg-amber-800 text-white font-bold'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Arithmetic Operation Filter (if Arithmetic mode is active) */}
        {problemType === 'arithmetic' && (
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-700 font-medium">Operation:</span>
            {[
              { val: '+', label: 'Addition (+)' },
              { val: '-', label: 'Subtraction (-)' },
              { val: '*', label: 'Multiplication (×)' },
              { val: '/', label: 'Division (÷)' },
              { val: 'mixed', label: 'Mixed (Random)' },
            ].map((opItem) => (
              <button
                key={opItem.val}
                type="button"
                onClick={() => setOpFilter(opItem.val as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  opFilter === opItem.val
                    ? 'bg-stone-800 text-white font-semibold'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {opItem.label}
              </button>
            ))}
          </div>
        )}

        {/* Stats Strip */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-stone-700">
              <Trophy className="w-4 h-4 text-amber-800" />
              <span>Solved:</span>
              <strong className="font-mono text-stone-900">{stats.solvedCount}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-stone-700">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Streak:</span>
              <strong className="font-mono text-stone-900">{stats.currentStreak}</strong>
              {stats.bestStreak > 0 && (
                <span className="text-stone-700 text-xs">(Best: {stats.bestStreak})</span>
              )}
            </div>
          </div>

          <div className="text-stone-700 font-mono text-xs">
            Accuracy:{' '}
            <strong className="text-stone-900">
              {stats.totalAttempted > 0
                ? Math.round((stats.solvedCount / stats.totalAttempted) * 100)
                : 0}
              %
            </strong>
          </div>
        </div>
      </div>

      {/* Main Problem & Workspace Card */}
      {problem && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              Problem Base {base} ({config.name})
            </span>
            <button
              type="button"
              id="new-problem-btn"
              onClick={handleNewProblem}
              className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Problem
            </button>
          </div>

          {/* Large Problem Prompt */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-extrabold text-stone-900 tracking-tight">
              {problem.questionPrompt}
            </h2>
            {problem.type === 'arithmetic' && (
              <p className="text-xs text-stone-700 font-mono mt-1">
                (Decimal values: {problem.operandA}{' '}
                {problem.operation === '*' ? '×' : problem.operation === '/' ? '÷' : problem.operation}{' '}
                {problem.operandB} = ?)
              </p>
            )}
          </div>

          {/* Answer Input Section */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            {problem.type !== 'set_abacus' && (
              <div className="w-full sm:flex-1 relative">
                <input
                  id="practice-answer-input"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckAnswer();
                  }}
                  placeholder={`Enter answer in Base ${base} (e.g. ${config.digits.slice(0, 3).join('')})`}
                  className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl px-4 py-3 text-base sm:text-lg font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-600 uppercase"
                />
              </div>
            )}

            <button
              id="practice-check-btn"
              type="button"
              onClick={handleCheckAnswer}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Check Answer
            </button>
          </div>

          {/* Quick Base Digits Keypad for Touch / Mobile Typing */}
          {problem.type !== 'set_abacus' && (
            <div className="mt-3 flex items-center flex-wrap gap-1.5">
              <span className="text-xs text-stone-700 font-medium mr-1">Tap digits:</span>
              {config.digits.map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => {
                    playBeadClick(1.2);
                    setUserAnswer((prev) => prev + digit);
                  }}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 font-mono font-bold text-xs sm:text-sm text-stone-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUserAnswer((prev) => prev.slice(0, -1))}
                className="px-2.5 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                ⌫ Del
              </button>
              <button
                type="button"
                onClick={() => setUserAnswer('')}
                className="px-2.5 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Feedback Banner */}
          {evaluationResult && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
                evaluationResult === 'correct'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {evaluationResult === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm sm:text-base">
                  {evaluationResult === 'correct'
                    ? 'Outstanding! That is completely correct!'
                    : 'Not quite yet. Try using the hints below or work through it on the abacus!'}
                </p>
                {evaluationResult === 'correct' && (
                  <button
                    type="button"
                    onClick={handleNewProblem}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Next Problem <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hints & Hidden Solution Actions */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                id="practice-hint-btn"
                type="button"
                onClick={handleRevealHint}
                disabled={hintsRevealed >= problem.hints.length}
                className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-800" />
                {hintsRevealed === 0
                  ? 'Need a Hint?'
                  : `Hint (${hintsRevealed}/${problem.hints.length})`}
              </button>

              <button
                id="practice-reveal-btn"
                type="button"
                onClick={handleRevealSolution}
                className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-stone-600" />
                {isSolutionRevealed ? 'Hide Solution' : 'Reveal Hidden Solution'}
              </button>
            </div>
          </div>

          {/* Progressive Hints List */}
          {hintsRevealed > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {problem.hints.slice(0, hintsRevealed).map((hintText, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-950 text-xs sm:text-sm flex items-start gap-2 animate-fadeIn"
                >
                  <span className="font-bold text-amber-800 shrink-0">Hint {idx + 1}:</span>
                  <p>{hintText}</p>
                </div>
              ))}
            </div>
          )}

          {/* Hidden Solution Revealed Box */}
          {isSolutionRevealed && (
            <div className="mt-4 p-4 rounded-xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                  Hidden Solution:
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Dec: {problem.correctAnswerDecimal}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-white mb-2">
                Correct Answer:{' '}
                <span className="text-amber-400">
                  {problem.correctAnswer}₍{base}₎
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {problem.explanation}
              </p>

              {problem.type === 'arithmetic' && onOpenVisualizerWithProblem && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenVisualizerWithProblem(
                      problem.operandA,
                      problem.operandB || 1,
                      problem.operation || '+'
                    )
                  }
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Watch Step-by-Step on Operation Visualizer
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Abacus Scratchpad */}
      <div className="w-full">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Interactive Working Abacus (Scratchpad):
          </span>
          <span className="text-xs text-stone-700 font-mono">
            Abacus Value: {decimalToBaseString(rodsToDecimal(practiceRods, base), base)}₍{base}₎ (
            {rodsToDecimal(practiceRods, base)} dec)
          </span>
        </div>

        <Abacus
          base={base}
          numRods={numRods}
          rodValues={practiceRods}
          onChangeRodValue={(rodIndex, val) => {
            const next = [...practiceRods];
            next[rodIndex] = val;
            setPracticeRods(next);
            if (problem?.type === 'set_abacus') {
              setUserAnswer(decimalToBaseString(rodsToDecimal(next, base), base));
            }
          }}
          readOnly={problem?.type === 'read_abacus'}
        />
      </div>
    </div>
  );
};
