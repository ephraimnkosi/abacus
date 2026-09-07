import React from 'react';
import { motion } from 'motion/react';
import { valueToChar } from '../utils/baseMath';
import { playBeadClick } from '../utils/audio';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AbacusProps {
  base: number;
  numRods: number;
  rodValues: number[]; // Array of length numRods, index 0 is least significant (rightmost rod)
  onChangeRodValue?: (rodIndex: number, newValue: number) => void;
  highlightRods?: number[];
  readOnly?: boolean;
  carryBorrowBadge?: { rodIndex: number; text: string; type: 'carry' | 'borrow' } | null;
}

export const Abacus: React.FC<AbacusProps> = ({
  base,
  numRods,
  rodValues,
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
    // beadIndexFromBeam is 0-indexed distance from the counting beam
    // If user clicks a bead that is currently active:
    // If they click the highest active bead, or any active bead, we can set active beads to beadIndexFromBeam
    // If they click an inactive bead (beyond currentActive), we set active beads to beadIndexFromBeam + 1
    let nextValue: number;
    if (beadIndexFromBeam < currentActive) {
      // It's currently active. Clicking it deactivates it and beads above it
      nextValue = beadIndexFromBeam;
    } else {
      // It's currently inactive. Clicking it activates up to this bead
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

  // The rods are physically displayed from highest power (left) to lowest power (right, base^0)
  const rodIndices = Array.from({ length: numRods }, (_, i) => numRods - 1 - i);

  // Height calculations for beads:
  // Dynamically size bead height depending on base (bases with up to 15 beads need compact bead heights)
  const beadHeightPx = base > 10 ? 15 : base > 6 ? 20 : 26;
  const beadGapPx = 2;
  const activeZoneHeightPx = Math.max(70, maxBeadsPerRod * (beadHeightPx + beadGapPx) + 12);
  const inactiveZoneHeightPx = Math.max(70, maxBeadsPerRod * (beadHeightPx + beadGapPx) + 12);

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
                const activeCount = rodValues[rodIndex] || 0;
                const placeVal = Math.pow(base, rodIndex);
                const isHighlighted = highlightRods.includes(rodIndex);
                const isCarryBorrow = carryBorrowBadge && carryBorrowBadge.rodIndex === rodIndex;

                return (
                  <div
                    key={rodIndex}
                    id={`abacus-rod-${rodIndex}`}
                    className={`flex flex-col items-center relative transition-all rounded-xl p-1 sm:p-2 ${
                      isHighlighted
                        ? 'bg-amber-500/15 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900'
                        : 'hover:bg-stone-800/40'
                    }`}
                    tabIndex={readOnly ? -1 : 0}
                    onKeyDown={(e) => handleKeyDown(e, rodIndex)}
                    role="group"
                    aria-label={`Rod ${rodIndex}, Place value ${base} to the power ${rodIndex} (${placeVal}), current value ${activeCount}`}
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

                    {/* Rod Header: Power of Base and Multiplier */}
                    <div className="flex flex-col items-center mb-2">
                      <div className="px-2 py-0.5 rounded bg-stone-800/90 border border-stone-700/70 text-stone-200 text-[10px] sm:text-xs font-mono font-semibold">
                        {base}
                        <sup className="text-[9px] text-amber-300 font-bold ml-0.5">{rodIndex}</sup>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {placeVal >= 10000 ? placeVal.toExponential(0) : `×${placeVal}`}
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
                        className="w-6 h-5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-20 disabled:hover:bg-stone-800 text-amber-200 flex items-center justify-center transition-all mb-1 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* The Physical Rod Track with Beads & Counting Beam */}
                    <div className="relative flex flex-col items-center w-10 sm:w-12 md:w-14">
                      {/* Metallic Rod Wire running vertically */}
                      <div
                        className="absolute inset-y-0 w-1 sm:w-1.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.3)] z-0"
                        style={{ left: 'calc(50% - 2px)' }}
                      />

                      {/* INACTIVE ZONE (Top: Beads parked away from beam) */}
                      <div
                        className="relative w-full flex flex-col justify-start items-center pt-1 z-10"
                        style={{ height: `${inactiveZoneHeightPx}px` }}
                      >
                        {Array.from({ length: maxBeadsPerRod - activeCount }, (_, idx) => {
                          // Inactive bead
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
                                background:
                                  'radial-gradient(ellipse at top, #78716c 0%, #44403c 60%, #292524 100%)',
                                border: '1px solid #57534e',
                              }}
                            >
                              <div className="absolute inset-x-2 top-0.5 h-0.5 bg-white/20 rounded-full" />
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* THE COUNTING BEAM (Horizontal Brass Inlay) */}
                      <div className="relative w-full h-3 my-0.5 flex items-center justify-center z-15">
                        <div className="w-full h-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-xs shadow-md border-y border-amber-400/40 flex items-center justify-center">
                          {/* Center brass bead alignment pin */}
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-xs" />
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
                                background:
                                  'radial-gradient(ellipse at 40% 30%, #f59e0b 0%, #d97706 40%, #b45309 75%, #78350f 100%)',
                                border: '1px solid #fbbf24',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                              }}
                            >
                              {/* Bead Highlight / Wood Shine */}
                              <div className="absolute inset-x-2 top-0.5 h-0.5 bg-amber-100/40 rounded-full" />
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
                        className="w-6 h-5 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-20 disabled:hover:bg-stone-800 text-amber-200 flex items-center justify-center transition-all mt-1 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Rod Footer: Digit and Contribution */}
                    <div className="mt-2.5 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border transition-colors ${
                          activeCount > 0
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                            : 'bg-stone-800 text-stone-400 border-stone-700/60'
                        }`}
                      >
                        {valueToChar(activeCount)}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono mt-1 text-center whitespace-nowrap">
                        ={activeCount * placeVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
