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
import { RotateCcw, Shuffle, Plus, Minus, ArrowRightLeft } from 'lucide-react';

interface ConversionBarProps {
  base: number;
  numRods: number;
  rodValues: number[];
  onChangeRods: (newRods: number[]) => void;
  disabled?: boolean;
}

export const ConversionBar: React.FC<ConversionBarProps> = ({
  base,
  numRods,
  rodValues,
  onChangeRods,
  disabled = false,
}) => {
  const decimalVal = rodsToDecimal(rodValues, base);
  const baseString = decimalToBaseString(decimalVal, base);
  const config = getBaseConfig(base);

  // Input states
  const [inputVal, setInputVal] = useState<string>(baseString);
  const [inputMode, setInputMode] = useState<'base' | 'decimal'>('base');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Keep input synchronized when abacus changes from clicks
  useEffect(() => {
    if (inputMode === 'base') {
      setInputVal(baseString);
    } else {
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
      // Validate digits against base
      const clean = val.trim().toUpperCase();
      for (const ch of clean) {
        if (charToValue(ch) >= base) {
          setErrorMsg(`Digit '${ch}' is not valid in base ${base}`);
          return;
        }
      }
      const dec = baseStringToDecimal(clean, base);
      if (isNaN(dec)) {
        setErrorMsg('Invalid number format');
        return;
      }
      const maxRepresentable = Math.pow(base, numRods) - 1;
      if (dec > maxRepresentable) {
        setErrorMsg(`Value exceeds abacus capacity with ${numRods} rods (max ${decimalToBaseString(maxRepresentable, base)})`);
        return;
      }
      onChangeRods(decimalToRods(dec, base, numRods));
    } else {
      // Decimal mode
      const dec = parseInt(val.trim(), 10);
      if (isNaN(dec) || dec < 0) {
        setErrorMsg('Enter a valid non-negative integer');
        return;
      }
      const maxRepresentable = Math.pow(base, numRods) - 1;
      if (dec > maxRepresentable) {
        setErrorMsg(`Value exceeds abacus capacity with ${numRods} rods (max ${maxRepresentable})`);
        return;
      }
      onChangeRods(decimalToRods(dec, base, numRods));
    }
  };

  const handleClear = () => {
    onChangeRods(new Array(numRods).fill(0));
  };

  const handleRandomize = () => {
    const max = Math.min(Math.pow(base, Math.min(numRods, 4)) - 1, 9999);
    const rand = Math.floor(Math.random() * max) + 1;
    onChangeRods(decimalToRods(rand, base, numRods));
  };

  const handleStep = (delta: number) => {
    const nextVal = Math.max(0, Math.min(Math.pow(base, numRods) - 1, decimalVal + delta));
    onChangeRods(decimalToRods(nextVal, base, numRods));
  };

  const expansionTerms = getPolynomialExpansion(rodValues, base);

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
          <div className="flex items-baseline gap-2">
            <span
              id="current-base-value"
              className="text-2xl sm:text-3xl font-mono font-extrabold text-stone-900 tracking-tight"
            >
              {baseString}
            </span>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              ₍{base}₎
            </span>
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
                Bin: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 2)}</strong>
              </span>
            )}
            {base !== 8 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Oct: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 8)}</strong>
              </span>
            )}
            {base !== 16 && (
              <span className="bg-stone-200/60 px-1.5 py-0.5 rounded">
                Hex: <strong className="text-stone-800">{decimalToBaseString(decimalVal, 16)}</strong>
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
              Mode: {inputMode === 'base' ? `Base ${base}` : 'Decimal'}
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
              placeholder={`Enter in ${inputMode === 'base' ? `Base ${base}` : 'Decimal'}`}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          {errorMsg && <p className="text-[11px] text-rose-600 font-medium mt-0.5">{errorMsg}</p>}
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
              disabled={disabled || decimalVal >= Math.pow(base, numRods) - 1}
              onClick={() => handleStep(1)}
              className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> +1
            </button>
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
            expansionTerms.map((term, idx) => (
              <React.Fragment key={term.power}>
                {idx > 0 && <span className="text-stone-400">+</span>}
                <span className="inline-flex items-center bg-white px-2 py-1 rounded border border-stone-200 shadow-2xs">
                  <span className="font-bold text-amber-800">{term.digitChar}</span>
                  <span className="text-stone-500 text-xs mx-0.5">×</span>
                  <span className="text-stone-700">
                    {base}
                    <sup className="text-xs font-bold text-amber-700">{term.power}</sup>
                  </span>
                  <span className="text-stone-400 text-[10px] ml-1.5">
                    ({term.totalVal})
                  </span>
                </span>
              </React.Fragment>
            ))
          )}
          <span className="text-stone-400">=</span>
          <span className="font-extrabold text-stone-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {decimalVal}₍₁₀₎
          </span>
        </div>
      </div>
    </div>
  );
};
