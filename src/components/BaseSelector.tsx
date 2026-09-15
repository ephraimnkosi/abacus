import React from 'react';
import { BASE_CONFIGS, getBaseConfig } from '../utils/baseMath';
import { Layers, Hash, Info } from 'lucide-react';

interface BaseSelectorProps {
  currentBase: number;
  onSelectBase: (base: number) => void;
  numRods: number;
  onChangeNumRods: (rods: number) => void;
  fractionalRods?: number;
  onChangeFractionalRods?: (fractionalRods: number) => void;
  disabled?: boolean;
}

const PRESET_BASES = [
  { base: 2, label: 'Binary (2)', short: 'BIN' },
  { base: 8, label: 'Octal (8)', short: 'OCT' },
  { base: 10, label: 'Decimal (10)', short: 'DEC' },
  { base: 12, label: 'Duodecimal (12)', short: 'DUO' },
  { base: 16, label: 'Hexadecimal (16)', short: 'HEX' },
];

export const BaseSelector: React.FC<BaseSelectorProps> = ({
  currentBase,
  onSelectBase,
  numRods,
  onChangeNumRods,
  fractionalRods = 0,
  onChangeFractionalRods,
  disabled = false,
}) => {
  const config = getBaseConfig(currentBase);

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 sm:p-5 transition-all">
      {/* Top Row: Base Presets and Rod Count */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 mr-1 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" /> Base:
          </span>
          {PRESET_BASES.map((preset) => {
            const isSelected = currentBase === preset.base;
            return (
              <button
                key={preset.base}
                id={`base-preset-${preset.base}`}
                type="button"
                disabled={disabled}
                onClick={() => onSelectBase(preset.base)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs font-semibold'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={isSelected}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Rods & Fractions Steppers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Whole Rods */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5">
            <Layers className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-medium text-stone-700">Whole Rods:</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-stone-800 w-4 text-center">
              {numRods - fractionalRods}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button
                id="rods-decrease-btn"
                type="button"
                aria-label="Decrease number of whole rods"
                disabled={disabled || numRods - fractionalRods <= 2}
                onClick={() => onChangeNumRods(Math.max(fractionalRods + 2, numRods - 1))}
                className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                -
              </button>
              <button
                id="rods-increase-btn"
                type="button"
                aria-label="Increase number of whole rods"
                disabled={disabled || numRods >= 9}
                onClick={() => onChangeNumRods(Math.min(9, numRods + 1))}
                className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Fractional Rods Control */}
          {onChangeFractionalRods && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all ${
                fractionalRods > 0
                  ? 'bg-cyan-50/80 border-cyan-300/80 text-cyan-950'
                  : 'bg-stone-50 border-stone-200/80 text-stone-700'
              }`}
            >
              <span className="font-mono font-bold text-xs">.</span>
              <span className="text-xs font-medium">Fractional Rods:</span>
              <span
                className={`font-mono text-xs sm:text-sm font-bold w-4 text-center ${
                  fractionalRods > 0 ? 'text-cyan-800' : 'text-stone-800'
                }`}
              >
                {fractionalRods}
              </span>
              <div className="flex items-center gap-1 ml-1">
                <button
                  id="frac-rods-dec-btn"
                  type="button"
                  aria-label="Decrease fractional rods"
                  disabled={disabled || fractionalRods <= 0}
                  onClick={() => onChangeFractionalRods(Math.max(0, fractionalRods - 1))}
                  className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  -
                </button>
                <button
                  id="frac-rods-inc-btn"
                  type="button"
                  aria-label="Increase fractional rods"
                  disabled={disabled || fractionalRods >= 4}
                  onClick={() => onChangeFractionalRods(Math.min(4, fractionalRods + 1))}
                  className="w-6 h-6 rounded-md bg-stone-200 hover:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Base Slider & Description */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Slider for any base 2-16 */}
        <div className="flex items-center gap-3 flex-1">
          <label htmlFor="base-slider" className="text-stone-700 font-medium whitespace-nowrap">
            Base <span className="font-mono font-bold text-stone-900">{currentBase}</span>
          </label>
          <input
            id="base-slider"
            type="range"
            min="2"
            max="16"
            step="1"
            value={currentBase}
            disabled={disabled}
            onChange={(e) => onSelectBase(parseInt(e.target.value, 10))}
            className="w-full max-w-xs h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-800"
            aria-label="Adjust number base from 2 to 16"
          />
          <span className="text-stone-700 text-xs font-mono">2-16</span>
        </div>

        {/* Digits Palette */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-700 text-xs font-medium">Digits ({config.digits.length}):</span>
          <div className="flex items-center gap-0.5 font-mono text-xs bg-stone-100 px-2 py-1 rounded-md text-stone-800">
            {config.digits.map((d) => (
              <span
                key={d}
                className={`inline-block px-1 py-0.2 rounded font-semibold ${
                  ['A', 'B', 'C', 'D', 'E', 'F'].includes(d) ? 'text-amber-800' : 'text-stone-800'
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Base Description Note */}
      <div className="mt-2.5 flex items-start gap-2 text-stone-700 text-xs bg-stone-50/70 p-2.5 rounded-lg border border-stone-100">
        <Info className="w-3.5 h-3.5 text-stone-700 mt-0.5 shrink-0" />
        <p className="leading-relaxed">{config.description}</p>
      </div>
    </div>
  );
};
