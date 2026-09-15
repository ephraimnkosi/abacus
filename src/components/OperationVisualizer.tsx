import React, { useState, useEffect, useMemo, useRef } from 'react';
import { OperationType, ArithmeticStep } from '../types';
import { Abacus } from './Abacus';
import {
  generateAdditionSteps,
  generateSubtractionSteps,
  generateMultiplicationSteps,
  generateDivisionSteps,
  decimalToBaseString,
  baseStringToDecimal,
  charToValue,
} from '../utils/baseMath';
import { playBeadClick } from '../utils/audio';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface OperationVisualizerProps {
  base: number;
  numRods: number;
  fractionalRods?: number;
}

export const OperationVisualizer: React.FC<OperationVisualizerProps> = ({
  base,
  numRods,
  fractionalRods = 0,
}) => {
  const [operation, setOperation] = useState<OperationType>('+');
  const [inputA, setInputA] = useState<string>('');
  const [inputB, setInputB] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Set default initial operands appropriate for the base
  useEffect(() => {
    if (fractionalRods > 0) {
      if (base === 2) {
        setInputA('10.1');
        setInputB('01.1');
      } else if (base === 10) {
        setInputA('2.5');
        setInputB('1.75');
      } else {
        setInputA(`2.${Math.floor(base / 2)}`);
        setInputB(`1.${Math.floor(base / 2)}`);
      }
    } else if (base === 2) {
      setInputA('1011');
      setInputB('0110');
    } else if (base === 16) {
      setInputA('2E');
      setInputB('1A');
    } else if (base === 8) {
      setInputA('37');
      setInputB('25');
    } else {
      const half = Math.floor(base / 2);
      setInputA(decimalToBaseString(base + half + 2, base));
      setInputB(decimalToBaseString(base - 1, base));
    }
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [base, operation, fractionalRods]);

  // Parse inputs to decimal (supports fractional radix point)
  const decA = useMemo(() => {
    return baseStringToDecimal(inputA, base);
  }, [inputA, base]);

  const decB = useMemo(() => {
    return baseStringToDecimal(inputB, base);
  }, [inputB, base]);

  // Generate arithmetic steps based on operation and operands
  const steps: ArithmeticStep[] = useMemo(() => {
    if (isNaN(decA) || isNaN(decB) || decA < 0 || decB < 0) {
      return [];
    }

    try {
      if (operation === '+') {
        return generateAdditionSteps(decA, decB, base, numRods, fractionalRods);
      } else if (operation === '-') {
        return generateSubtractionSteps(decA, decB, base, numRods, fractionalRods);
      } else if (operation === '*') {
        return generateMultiplicationSteps(decA, decB, base, numRods);
      } else if (operation === '/') {
        return generateDivisionSteps(decA, Math.max(1, decB), base, numRods);
      }
    } catch {
      return [];
    }
    return [];
  }, [decA, decB, base, numRods, fractionalRods, operation]);

  const currentStep: ArithmeticStep | undefined = steps[currentStepIndex];

  // Auto-play timer loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          playBeadClick(1.0);
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, steps.length, playbackSpeed]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      playBeadClick(1.1);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      playBeadClick(0.9);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleApplyPreset = (type: 'carry' | 'borrow' | 'multi' | 'div' | 'frac-carry') => {
    setIsPlaying(false);
    setErrorMsg(null);
    if (type === 'frac-carry') {
      setOperation('+');
      if (base === 2) {
        setInputA('1.1');
        setInputB('0.1');
      } else if (base === 10) {
        setInputA('3.8');
        setInputB('2.7');
      } else {
        setInputA(`1.${base - 1}`);
        setInputB(`0.${base - 1}`);
      }
    } else if (type === 'carry') {
      setOperation('+');
      const valA = base * 2 - 2;
      const valB = base + 3;
      setInputA(decimalToBaseString(valA, base));
      setInputB(decimalToBaseString(valB, base));
    } else if (type === 'borrow') {
      setOperation('-');
      const valA = base * 3;
      const valB = base - 1;
      setInputA(decimalToBaseString(valA, base));
      setInputB(decimalToBaseString(valB, base));
    } else if (type === 'multi') {
      setOperation('*');
      const valA = Math.min(base + 2, 15);
      const valB = Math.min(base - 1, 9);
      setInputA(decimalToBaseString(valA, base));
      setInputB(decimalToBaseString(valB, base));
    } else if (type === 'div') {
      setOperation('/');
      const divisor = Math.max(2, Math.min(base - 1, 7));
      const quotient = Math.min(base + 1, 12);
      const dividend = quotient * divisor + 1;
      setInputA(decimalToBaseString(dividend, base));
      setInputB(decimalToBaseString(divisor, base));
    }
    setCurrentStepIndex(0);
  };

  const validateInput = (val: string, setter: (v: string) => void) => {
    const clean = val.trim().toUpperCase();
    const parts = clean.split('.');
    if (parts.length > 2) {
      setErrorMsg('Invalid format: multiple radix points');
      return;
    }
    for (const part of parts) {
      for (const ch of part) {
        if (charToValue(ch) >= base) {
          setErrorMsg(`Digit '${ch}' is not valid in base ${base}`);
          return;
        }
      }
    }
    setErrorMsg(null);
    setter(clean);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const carryBadge = useMemo(() => {
    if (!currentStep) return null;
    if (currentStep.carryOrBorrowValue) {
      if (currentStep.carryOrBorrowValue > 0) {
        return {
          rodIndex: currentStep.currentRodIndex + 1,
          text: `Carry +${currentStep.carryOrBorrowValue}`,
          type: 'carry' as const,
        };
      } else {
        return {
          rodIndex: currentStep.currentRodIndex + 1,
          text: 'Borrow -1',
          type: 'borrow' as const,
        };
      }
    }
    return null;
  }, [currentStep]);

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Controls: Operations & Operands */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Operation Selector Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1 mr-1">
              <Calculator className="w-4 h-4" /> Operation:
            </span>
            {(
              [
                { op: '+', label: 'Add (+)' },
                { op: '-', label: 'Subtract (-)' },
                { op: '*', label: 'Multiply (×)' },
                { op: '/', label: 'Divide (÷)' },
              ] as const
            ).map((item) => (
              <button
                key={item.op}
                id={`op-select-${item.op}`}
                type="button"
                onClick={() => {
                  setOperation(item.op);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  operation === item.op
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Preset Scenarios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-stone-700 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" /> Demos:
            </span>
            {fractionalRods > 0 && (
              <button
                id="demo-frac-carry-btn"
                type="button"
                onClick={() => handleApplyPreset('frac-carry')}
                className="px-2.5 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 rounded-md text-xs font-semibold cursor-pointer"
              >
                Radix Carry ( . )
              </button>
            )}
            <button
              id="demo-carry-btn"
              type="button"
              onClick={() => handleApplyPreset('carry')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium cursor-pointer"
            >
              Carry (+)
            </button>
            <button
              id="demo-borrow-btn"
              type="button"
              onClick={() => handleApplyPreset('borrow')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium cursor-pointer"
            >
              Borrow (-)
            </button>
            <button
              id="demo-multi-btn"
              type="button"
              onClick={() => handleApplyPreset('multi')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium cursor-pointer"
            >
              Multiply (×)
            </button>
            <button
              id="demo-div-btn"
              type="button"
              onClick={() => handleApplyPreset('div')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs font-medium cursor-pointer"
            >
              Divide (÷)
            </button>
          </div>
        </div>

        {/* Operand Inputs Row */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Operand A */}
          <div className="sm:col-span-5 flex items-center gap-2">
            <label htmlFor="operand-a-input" className="text-xs font-semibold text-stone-700 whitespace-nowrap">
              Operand A:
            </label>
            <input
              id="operand-a-input"
              type="text"
              value={inputA}
              onChange={(e) => validateInput(e.target.value, setInputA)}
              placeholder={`Base ${base}`}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-xs text-stone-700 font-mono">({decA})</span>
          </div>

          {/* Operation Symbol Badge */}
          <div className="sm:col-span-2 flex justify-center">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shadow-2xs">
              {operation === '*' ? '×' : operation === '/' ? '÷' : operation}
            </span>
          </div>

          {/* Operand B */}
          <div className="sm:col-span-5 flex items-center gap-2">
            <label htmlFor="operand-b-input" className="text-xs font-semibold text-stone-700 whitespace-nowrap">
              Operand B:
            </label>
            <input
              id="operand-b-input"
              type="text"
              value={inputB}
              onChange={(e) => validateInput(e.target.value, setInputB)}
              placeholder={`Base ${base}`}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-xs text-stone-700 font-mono">({decB})</span>
          </div>
        </div>

        {errorMsg && <p className="text-xs text-rose-600 font-semibold mt-2">{errorMsg}</p>}
      </div>

      {/* Step Explanation Card */}
      {currentStep && (
        <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">{currentStep.title}</h3>
            </div>
            {currentStep.isComplete && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                Operation Complete
              </span>
            )}
          </div>

          {/* Detailed Narrative */}
          <p className="text-sm sm:text-base text-stone-700 leading-relaxed mt-1">
            {currentStep.description}
          </p>

          {/* Formula Badge */}
          <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 font-mono text-xs sm:text-sm text-stone-800 flex items-center gap-2">
            <span className="text-stone-700 text-xs font-sans font-medium">Math:</span>
            <strong className="text-amber-900">{currentStep.mathDetail}</strong>
          </div>

          {/* Step Progress Bar */}
          <div className="mt-4 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-800 h-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Player Navigation Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                id="step-reset-btn"
                type="button"
                aria-label="Reset to beginning"
                onClick={handleReset}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="step-prev-btn"
                type="button"
                aria-label="Previous step"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <SkipBack className="w-4 h-4" /> Previous
              </button>
              <button
                id="step-play-toggle-btn"
                type="button"
                aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
                onClick={() => {
                  if (currentStepIndex >= steps.length - 1) {
                    setCurrentStepIndex(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Auto Play
                  </>
                )}
              </button>
              <button
                id="step-next-btn"
                type="button"
                aria-label="Next step"
                onClick={handleNextStep}
                disabled={currentStepIndex >= steps.length - 1}
                className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-700 font-medium">Speed:</span>
              {[
                { label: '0.5x', ms: 1600 },
                { label: '1x', ms: 1000 },
                { label: '2x', ms: 500 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setPlaybackSpeed(s.ms)}
                  className={`px-2 py-1 rounded text-xs font-mono font-medium cursor-pointer ${
                    playbackSpeed === s.ms
                      ? 'bg-amber-800 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Synchronized Abacus at this exact step */}
      <div className="w-full">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Abacus State at Current Step:
          </span>
          {currentStep && (
            <span className="text-xs font-mono text-stone-700">
              Active Rods:{' '}
              {currentStep.highlightRods && currentStep.highlightRods.length > 0
                ? currentStep.highlightRods.map((r) => `Rod ${r}`).join(', ')
                : 'None'}
            </span>
          )}
        </div>

        <Abacus
          base={base}
          numRods={numRods}
          fractionalRods={fractionalRods}
          rodValues={currentStep ? currentStep.abacusState : new Array(numRods).fill(0)}
          highlightRods={currentStep ? currentStep.highlightRods : []}
          carryBorrowBadge={carryBadge}
          readOnly={true}
        />
      </div>
    </div>
  );
};
