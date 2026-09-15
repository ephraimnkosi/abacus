import React from 'react';
import { motion } from 'motion/react';
import { valueToChar } from '../utils/baseMath';
import { playBeadClick } from '../utils/audio';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AbacusProps {
  base: number;
  numRods: number;
  rodValues: number[]; // Array of length numRods, index 0 is lowest power (power = 0 - fractionalRods)
  fractionalRods?: number;
  onChangeRodValue?: (rodIndex: number, newValue: number) => void;
  highlightRods?: number[];
  readOnly?: boolean;
  carryBorrowBadge?: { rodIndex: number; text: string; type: 'carry' | 'borrow' } | null;
}

export const Abacus: React.FC<AbacusProps> = ({
  base,
  numRods,
  rodValues,
  fractionalRods = 0,
  onChangeRodValue,
  highlightRods = [],
  readOnly = false,
  carryBorrowBadge,
}) => {
  const maxBeadsPerRod = base - 1;

  // Handle clicking a bead directly
  const handleBeadClick = (rodIndex: number, beadIndexFromBeam: number) => {
    if (readOnly || !onChangeRodValue) return;

    const currentActive = rodValues[rodIndex] || 0;
    let nextValue: number;
    if (beadIndexFromBeam < currentActive) {
      nextValue = beadIndexFromBeam;
    } else {
      nextValue = beadIndexFromBeam + 1;
    }

    playBeadClick(0.8 + (rodIndex / numRods) * 0.4);
    onChangeRodValue(rodIndex, Math.max(0, Math.min(maxBeadsPerRod, nextValue)));
  };

  const handleStepValue = (rodIndex: number, delta: number) => {
    if (readOnly || !onChangeRodValue) return;
    const currentActive = rodValues[rodIndex] || 0;
    const nextVal = Math.max(0, Math.min(maxBeadsPerRod, currentActive + delta));
    if (nextVal !== currentActive) {
      playBeadClick(0.8 + (rodIndex / numRods) * 0.4);
      onChangeRodValue(rodIndex, nextVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rodIndex: number) => {
    if (readOnly || !onChangeRodValue) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleStepValue(rodIndex, 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStepValue(rodIndex, -1);
    }
  };

  // The rods are physically displayed from highest power (left) to lowest power (right)
  const rodIndices = Array.from({ length: numRods }, (_, i) => numRods - 1 - i);

  // Height calculations for beads:
  const beadHeightPx = base > 10 ? 15 : base > 6 ? 20 : 26;
  const beadGapPx = 2;
  const activeZoneHeightPx = Math.max(70, maxBeadsPerRod * (beadHeightPx + beadGapPx) + 12);
  const inactiveZoneHeightPx = Math.max(70, maxBeadsPerRod * (beadHeightPx + beadGapPx) + 12);

  const radixName =
    base === 2
      ? 'Binary Point'
      : base === 8
      ? 'Octal Point'
      : base === 10
      ? 'Decimal Point'
      : base === 16
      ? 'Hex Point'
      : `Base-${base} Point`;

  return (
    <div className="w-full select-none" id="abacus-container">
      {/* Scrollable Container with Wooden Outer Frame */}
      <div className="custom-scrollbar overflow-x-auto pb-3 pt-1 px-1">
        <div className="min-w-fit mx-auto inline-block p-3 sm:p-5 bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950 rounded-2xl sm:rounded-3xl shadow-xl border-4 border-amber-950/80">
          {/* Inner Abacus Border & Inlay */}
          <div className="relative bg-gradient-to-b from-stone-900/90 to-stone-950/95 rounded-xl border-2 border-amber-900/60 p-3 sm:p-4 shadow-inner">
            {/* Horizontal Beams and Frame Accents */}
            <div className="flex items-start justify-center gap-2 sm:gap-4 md:gap-6">
              {rodIndices.map((rodIndex) => {
                const power = rodIndex - fractionalRods;
                const isFractional = power < 0;
                const activeCount = rodValues[rodIndex] || 0;
                const placeVal = Math.pow(base, power);
                const isHighlighted = highlightRods.includes(rodIndex);
                const isCarryBorrow = carryBorrowBadge && carryBorrowBadge.rodIndex === rodIndex;

                // Show radix point separator immediately before the first fractional rod (power === -1)
                const showRadixPointDivider = fractionalRods > 0 && rodIndex === fractionalRods - 1;

                const denominator = isFractional ? Math.round(Math.pow(base, -power)) : 1;

                return (
                  <React.Fragment key={rodIndex}>
                    {/* RADIX POINT DIVIDER */}
                    {showRadixPointDivider && (
                      <div
                        id="radix-point-divider"
                        className="flex flex-col items-center justify-between self-stretch px-1 sm:px-2 z-20"
                        title={radixName}
                      >
                        {/* Top Radix Badge */}
                        <div className="flex flex-col items-center mb-2">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-mono text-[9px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
                            {base === 10 ? 'DECIMAL' : 'RADIX'} ( . )
                          </span>
                          <span className="text-[8px] text-cyan-400/80 font-mono mt-0.5 whitespace-nowrap">
                            point
                          </span>
                        </div>

                        {/* Middle Brass Separator with Golden Radix Point */}
                        <div className="relative flex-1 flex flex-col items-center justify-center my-1 w-4 sm:w-6">
                          <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
                          {/* Glowing Radix Bead Dot aligned with Counting Beam */}
                          <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-200 border border-cyan-100 shadow-[0_0_12px_rgba(56,189,248,0.9)] flex items-center justify-center animate-pulse">
                              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                            </div>
                            <span className="text-[18px] sm:text-[22px] font-black leading-none text-cyan-300 select-none">
                              .
                            </span>
                          </div>
                        </div>

                        {/* Bottom Radix Indicator */}
                        <div className="mt-2.5 flex flex-col items-center">
                          <div className="w-5 h-7 sm:w-6 sm:h-8 rounded flex items-center justify-center font-mono font-black text-lg text-cyan-300">
                            •
                          </div>
                          <span className="text-[9px] text-cyan-400/70 font-mono mt-1 whitespace-nowrap">
                            fractional →
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ROD COMPONENT */}
                    <div
                      id={`abacus-rod-${rodIndex}`}
                      className={`flex flex-col items-center relative transition-all rounded-xl p-1 sm:p-2 ${
                        isHighlighted
                          ? 'bg-amber-500/15 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900'
                          : isFractional
                          ? 'bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-800/30'
                          : 'hover:bg-stone-800/40'
                      }`}
                      tabIndex={readOnly ? -1 : 0}
                      onKeyDown={(e) => handleKeyDown(e, rodIndex)}
                      role="group"
                      aria-label={`Rod ${rodIndex}, Power ${power} (${
                        isFractional ? `1/${denominator}` : placeVal
                      }), current value ${activeCount}`}
                    >
                      {/* Floating Carry / Borrow Banner */}
                      {isCarryBorrow && (
                        <div
                          className={`absolute -top-7 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight shadow-md animate-bounce z-20 whitespace-nowrap ${
                            carryBorrowBadge.type === 'carry'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {carryBorrowBadge.text}
                        </div>
                      )}

                      {/* Rod Header: Power of Base and Multiplier / Fraction */}
                      <div className="flex flex-col items-center mb-2">
                        <div
                          className={`px-2 py-0.5 rounded border text-[10px] sm:text-xs font-mono font-semibold ${
                            isFractional
                              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                              : 'bg-stone-800/90 border-stone-700/70 text-stone-200'
                          }`}
                        >
                          {base}
                          <sup
                            className={`text-[9px] font-bold ml-0.5 ${
                              isFractional ? 'text-cyan-300' : 'text-amber-300'
                            }`}
                          >
                            {power}
                          </sup>
                        </div>
                        <span
                          className={`text-[10px] font-mono mt-0.5 ${
                            isFractional ? 'text-cyan-300/90' : 'text-stone-400'
                          }`}
                        >
                          {isFractional
                            ? `1/${denominator}`
                            : placeVal >= 10000
                            ? placeVal.toExponential(0)
                            : `×${placeVal}`}
                        </span>
                      </div>

                      {/* Quick Step Up (+) button */}
                      {!readOnly && (
                        <button
                          type="button"
                          id={`rod-${rodIndex}-inc`}
                          aria-label={`Add bead to rod ${rodIndex}`}
                          disabled={activeCount >= maxBeadsPerRod}
                          onClick={() => handleStepValue(rodIndex, 1)}
                          className={`w-6 h-5 rounded hover:bg-stone-700 disabled:opacity-20 disabled:hover:bg-stone-800 flex items-center justify-center transition-all mb-1 cursor-pointer ${
                            isFractional ? 'bg-cyan-950 text-cyan-300' : 'bg-stone-800 text-amber-200'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* The Physical Rod Track with Beads & Counting Beam */}
                      <div className="relative flex flex-col items-center w-10 sm:w-12 md:w-14">
                        {/* Metallic Rod Wire running vertically */}
                        <div
                          className={`absolute inset-y-0 w-1 sm:w-1.5 rounded-full z-0 ${
                            isFractional
                              ? 'bg-gradient-to-r from-cyan-200 via-sky-100 to-cyan-300 shadow-[0_0_5px_rgba(56,189,248,0.3)]'
                              : 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 shadow-[0_0_5px_rgba(251,191,36,0.3)]'
                          }`}
                          style={{ left: 'calc(50% - 2px)' }}
                        />

                        {/* INACTIVE ZONE (Top: Beads parked away from beam) */}
                        <div
                          className="relative w-full flex flex-col justify-start items-center pt-1 z-10"
                          style={{ height: `${inactiveZoneHeightPx}px` }}
                        >
                          {Array.from({ length: maxBeadsPerRod - activeCount }, (_, idx) => {
                            const beadPosFromBeam = activeCount + idx;
                            return (
                              <motion.button
                                key={`inactive-${idx}`}
                                type="button"
                                layout
                                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                onClick={() => handleBeadClick(rodIndex, beadPosFromBeam)}
                                disabled={readOnly}
                                aria-label={`Inactive bead ${idx + 1}`}
                                className="w-8 sm:w-10 md:w-11 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 z-10 my-[1px] shadow-sm relative group"
                                style={{
                                  height: `${beadHeightPx}px`,
                                  background: isFractional
                                    ? 'radial-gradient(ellipse at top, #334155 0%, #1e293b 60%, #0f172a 100%)'
                                    : 'radial-gradient(ellipse at top, #78716c 0%, #44403c 60%, #292524 100%)',
                                  border: isFractional ? '1px solid #475569' : '1px solid #57534e',
                                }}
                              >
                                <div className="absolute inset-x-2 top-0.5 h-0.5 bg-white/20 rounded-full" />
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* THE COUNTING BEAM (Horizontal Beam) */}
                        <div className="relative w-full h-3 my-0.5 flex items-center justify-center z-15">
                          <div
                            className={`w-full h-2 rounded-xs shadow-md border-y flex items-center justify-center ${
                              isFractional
                                ? 'bg-gradient-to-r from-cyan-800 via-sky-700 to-cyan-900 border-cyan-400/40'
                                : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-amber-400/40'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full shadow-xs ${
                                isFractional ? 'bg-cyan-200/90' : 'bg-amber-200/90'
                              }`}
                            />
                          </div>
                        </div>

                        {/* ACTIVE ZONE (Bottom: Beads touching/slid towards the beam) */}
                        <div
                          className="relative w-full flex flex-col justify-start items-center pt-1 z-10"
                          style={{ height: `${activeZoneHeightPx}px` }}
                        >
                          {Array.from({ length: activeCount }, (_, idx) => {
                            return (
                              <motion.button
                                key={`active-${idx}`}
                                type="button"
                                layout
                                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                onClick={() => handleBeadClick(rodIndex, idx)}
                                disabled={readOnly}
                                aria-label={`Active bead ${idx + 1} of ${activeCount}`}
                                className="w-8 sm:w-10 md:w-11 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 z-10 my-[1px] shadow-md relative group"
                                style={{
                                  height: `${beadHeightPx}px`,
                                  background: isFractional
                                    ? 'radial-gradient(ellipse at 40% 30%, #06b6d4 0%, #0284c7 40%, #0369a1 75%, #0c4a6e 100%)'
                                    : 'radial-gradient(ellipse at 40% 30%, #f59e0b 0%, #d97706 40%, #b45309 75%, #78350f 100%)',
                                  border: isFractional ? '1px solid #38bdf8' : '1px solid #fbbf24',
                                  boxShadow: isFractional
                                    ? '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.5)'
                                    : '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                                }}
                              >
                                <div className="absolute inset-x-2 top-0.5 h-0.5 bg-white/40 rounded-full" />
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Step Down (-) button */}
                      {!readOnly && (
                        <button
                          type="button"
                          id={`rod-${rodIndex}-dec`}
                          aria-label={`Remove bead from rod ${rodIndex}`}
                          disabled={activeCount <= 0}
                          onClick={() => handleStepValue(rodIndex, -1)}
                          className={`w-6 h-5 rounded hover:bg-stone-700 disabled:opacity-20 disabled:hover:bg-stone-800 flex items-center justify-center transition-all mt-1 cursor-pointer ${
                            isFractional ? 'bg-cyan-950 text-cyan-300' : 'bg-stone-800 text-amber-200'
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Rod Footer: Digit and Contribution */}
                      <div className="mt-2.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border transition-colors ${
                            activeCount > 0
                              ? isFractional
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                              : 'bg-stone-800 text-stone-400 border-stone-700/60'
                          }`}
                        >
                          {valueToChar(activeCount)}
                        </div>
                        <span
                          className={`text-[10px] font-mono mt-1 text-center whitespace-nowrap ${
                            isFractional ? 'text-cyan-300/80' : 'text-stone-400'
                          }`}
                        >
                          {isFractional
                            ? activeCount === 0
                              ? '=0'
                              : `=${activeCount}/${denominator}`
                            : `=${activeCount * placeVal}`}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
