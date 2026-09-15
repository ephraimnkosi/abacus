import React, { useState, useEffect } from 'react';
import {
  rodsToDecimal,
  decimalToBaseString,
  decimalToRods,
  baseStringToDecimal,
  getPolynomialExpansion,
  getBaseConfig,
  charToValue,
} from '../utils/baseMath';
import { simplifyFraction, parseFractionOrDecimal } from '../utils/fractionMath';
import { RotateCcw, Shuffle, Plus, Minus, ArrowRightLeft } from 'lucide-react';

interface ConversionBarProps {
  base: number;
  numRods: number;
  rodValues: number[];
  fractionalRods?: number;
  onChangeRods: (newRods: number[]) => void;
  disabled?: boolean;
}

export const ConversionBar: React.FC<ConversionBarProps> = ({
  base,
  numRods,
  rodValues,
  fractionalRods = 0,
  onChangeRods,
  disabled = false,
}) => {
  const decimalVal = rodsToDecimal(rodValues, base, fractionalRods);
  const baseString = decimalToBaseString(decimalVal, base, fractionalRods);
  const config = getBaseConfig(base);

  // Simplified fraction info if there's a fractional component
  const fractionInfo = simplifyFraction(
    Math.round(decimalVal * Math.pow(base, fractionalRods)),
    Math.pow(base, fractionalRods)
  );

  // Input states
  const [inputVal, setInputVal] = useState<string>(baseString);
  const [inputMode, setInputMode] = useState<'base' | 'decimal'>('base');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keep input synchronized when abacus changes from clicks
  useEffect(() => {
    if (inputMode === 'base') {
      setInputVal(baseString);
    } else {
      // If fractional, show clean decimal
      setInputVal(decimalVal.toString());
    }
    setErrorMsg(null);
  }, [baseString, decimalVal, inputMode]);

  const handleApplyInput = (val: string) => {
    setErrorMsg(null);
    if (!val.trim()) {
      onChangeRods(new Array(numRods).fill(0));
      return;
    }

    if (inputMode === 'base') {
      const clean = val.trim().toUpperCase();
      // Verify valid characters: digits in base and optional single '.'
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

      const dec = baseStringToDecimal(clean, base);
      if (isNaN(dec)) {
        setErrorMsg('Invalid number format');
        return;
      }
      const maxWhole = Math.pow(base, numRods - fractionalRods) - 1;
      const wholePart = Math.floor(dec);
      if (wholePart > maxWhole) {
        setErrorMsg(`Whole part exceeds capacity with ${numRods - fractionalRods} whole rods (max ${maxWhole})`);
        return;
      }
      onChangeRods(decimalToRods(dec, base, numRods, fractionalRods));
    } else {
      // Decimal / Fraction mode
      const parsed = parseFractionOrDecimal(val);
      if (!parsed || isNaN(parsed.decimal) || parsed.decimal < 0) {
        setErrorMsg('Enter a valid non-negative number or fraction (e.g. "3/4", "0.75", "1.5")');
        return;
      }
      const maxWhole = Math.pow(base, numRods - fractionalRods) - 1;
      const wholePart = Math.floor(parsed.decimal);
      if (wholePart > maxWhole) {
        setErrorMsg(`Value exceeds whole capacity with ${numRods - fractionalRods} whole rods (max ${maxWhole})`);
        return;
      }
      onChangeRods(decimalToRods(parsed.decimal, base, numRods, fractionalRods));
    }
  };

  const handleClear = () => {
    onChangeRods(new Array(numRods).fill(0));
  };

  const handleRandomize = () => {
    const wholeMax = Math.min(Math.pow(base, Math.min(numRods - fractionalRods, 3)) - 1, 99);
    const randWhole = Math.floor(Math.random() * (wholeMax + 1));
    let randFrac = 0;
    if (fractionalRods > 0) {
      const denom = Math.pow(base, fractionalRods);
      const randNumerator = Math.floor(Math.random() * denom);
      randFrac = randNumerator / denom;
    }
    const rand = randWhole + randFrac;
    onChangeRods(decimalToRods(rand, base, numRods, fractionalRods));
  };

  const handleStep = (delta: number) => {
    const stepSize = fractionalRods > 0 && Math.abs(delta) < 1 ? delta : delta;
    const maxCapacity = Math.pow(base, numRods - fractionalRods) - Math.pow(base, -fractionalRods);
    const nextVal = Math.max(0, Math.min(maxCapacity, decimalVal + stepSize));
    onChangeRods(decimalToRods(nextVal, base, numRods, fractionalRods));
  };

  const handlePresetFraction = (num: number, den: number) => {
    const dec = num / den;
    onChangeRods(decimalToRods(dec, base, numRods, fractionalRods));
  };

  const expansionTerms = getPolynomialExpansion(rodValues, base, fractionalRods);

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sm:p-5 mt-4">
      {/* Top Section: Conversions & Direct Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Primary Value Readout in Current Base */}
        <div className="lg:col-span-5 bg-stone-50 rounded-xl p-3 border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-700 font-medium mb-1">
            <span>Current Value ({config.name} - Base {base})</span>
            <span className="font-mono text-stone-700">Dec: {decimalVal}</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              id="current-base-value"
              className="text-2xl sm:text-3xl font-mono font-extrabold text-stone-900 tracking-tight"
            >
              {baseString}
            </span>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              ₍{base}₎
            </span>
            {fractionalRods > 0 && decimalVal > 0 && (
              <span className="text-xs font-mono font-semibold text-cyan-800 bg-cyan-100/80 border border-cyan-200 px-2 py-0.5 rounded-md ml-auto">
                Exact: {fractionInfo.formatted}
              </span>
            )}
          </div>

          {/* Quick Equivalents Strip */}
          <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex flex-wrap gap-2 text-[11px] font-mono text-stone-600">
            {base !== 10 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Dec: <strong className="text-stone-800">{decimalVal}</strong>
              </span>
            )}
            {base !== 2 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Bin: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 2, fractionalRods > 0 ? 4 : 0)}</strong>
              </span>
            )}
            {base !== 8 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Oct: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 8, fractionalRods > 0 ? 3 : 0)}</strong>
              </span>
            )}
            {base !== 16 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Hex: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 16, fractionalRods > 0 ? 2 : 0)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Direct Input Field & Set Button */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="direct-num-input" className="text-xs font-semibold text-stone-700">
              Direct Input:
            </label>
            <button
              type="button"
              id="toggle-input-mode-btn"
              onClick={() => setInputMode(inputMode === 'base' ? 'decimal' : 'base')}
              className="text-[11px] text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Mode: {inputMode === 'base' ? `Base ${base}` : 'Decimal/Fraction'}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              id="direct-num-input"
              type="text"
              value={inputVal}
              disabled={disabled}
              onChange={(e) => {
                setInputVal(e.target.value);
                handleApplyInput(e.target.value);
              }}
              placeholder={
                inputMode === 'base'
                  ? fractionalRods > 0
                    ? `e.g. 10.1 or 3.2`
                    : `Enter in Base ${base}`
                  : `e.g. 3/4, 0.75, or 1.5`
              }
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          {errorMsg && <p className="text-[11px] text-rose-600 font-medium mt-0.5">{errorMsg}</p>}

          {/* Quick Fraction Shortcuts */}
          {fractionalRods > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              <span className="text-[10px] text-stone-500 font-medium">Fractions:</span>
              {[
                { label: '1/2', n: 1, d: 2 },
                { label: '1/4', n: 1, d: 4 },
                { label: '3/4', n: 3, d: 4 },
                { label: '1/8', n: 1, d: 8 },
                { label: '5/8', n: 5, d: 8 },
              ].map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => handlePresetFraction(f.n, f.d)}
                  className="px-1.5 py-0.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Abacus Action Buttons */}
        <div className="lg:col-span-3 flex flex-wrap lg:flex-col gap-1.5 justify-end">
          <div className="flex items-center gap-1.5 w-full">
            <button
              id="abacus-step-minus"
              type="button"
              disabled={disabled || decimalVal <= 0}
              onClick={() => handleStep(-1)}
              className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" /> -1
            </button>
            <button
              id="abacus-step-plus"
              type="button"
              disabled={disabled || decimalVal >= Math.pow(base, numRods - fractionalRods) - 1}
              onClick={() => handleStep(1)}
              className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> +1
            </button>
            {fractionalRods > 0 && (
              <button
                id="abacus-step-fraction"
                type="button"
                disabled={disabled}
                onClick={() => handleStep(Math.pow(base, -fractionalRods))}
                className="py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-xs font-medium flex items-center justify-center gap-0.5 transition-colors cursor-pointer whitespace-nowrap"
                title={`Step by least fractional rod (1/${Math.pow(base, fractionalRods)})`}
              >
                +1/{Math.pow(base, fractionalRods)}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full">
            <button
              id="abacus-clear-btn"
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              id="abacus-random-btn"
              type="button"
              disabled={disabled}
              onClick={handleRandomize}
              className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" /> Random
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Positional Formula Breakdown */}
      <div className="mt-4 pt-3.5 border-t border-stone-100">
        <span className="text-xs font-semibold text-stone-700 block mb-2">
          Place-Value Expansion (Mathematical Decomposition):
        </span>
        <div className="font-mono text-xs sm:text-sm bg-stone-50 p-3 rounded-xl border border-stone-200/60 overflow-x-auto custom-scrollbar flex items-center flex-wrap gap-x-2 gap-y-1 text-stone-800">
          <span className="font-bold text-stone-900">{baseString}₍{base}₎</span>
          <span className="text-stone-400">=</span>
          {expansionTerms.length === 0 ? (
            <span className="text-stone-500">0</span>
          ) : (
            expansionTerms.map((term, idx) => {
              const isFrac = term.power < 0;
              const denom = isFrac ? Math.round(Math.pow(base, -term.power)) : 1;
              return (
                <React.Fragment key={term.power}>
                  {idx > 0 && <span className="text-stone-400">+</span>}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded border shadow-2xs ${
                      isFrac
                        ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <span className={`font-bold ${isFrac ? 'text-cyan-700' : 'text-amber-800'}`}>
                      {term.digitChar}
                    </span>
                    <span className="text-stone-500 text-xs mx-0.5">×</span>
                    <span className="text-stone-700">
                      {base}
                      <sup className={`text-xs font-bold ${isFrac ? 'text-cyan-600' : 'text-amber-700'}`}>
                        {term.power}
                      </sup>
                    </span>
                    <span className="text-stone-400 text-[10px] ml-1.5">
                      ({isFrac ? `${term.digit}/${denom}` : term.totalVal})
                    </span>
                  </span>
                </React.Fragment>
              );
            })
          )}
          <span className="text-stone-400">=</span>
          <span className="font-extrabold text-stone-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {decimalVal}₍₁₀₎
          </span>
          {fractionalRods > 0 && decimalVal > 0 && fractionInfo.formatted !== `${decimalVal}` && (
            <span className="font-semibold text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              = {fractionInfo.formatted}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
