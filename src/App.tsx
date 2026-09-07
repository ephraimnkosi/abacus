import React, { useState, useEffect } from 'react';
import { AppMode, OperationType } from './types';
import { BaseSelector } from './components/BaseSelector';
import { Abacus } from './components/Abacus';
import { ConversionBar } from './components/ConversionBar';
import { OperationVisualizer } from './components/OperationVisualizer';
import { PracticeMode } from './components/PracticeMode';
import { isAudioEnabled, setAudioEnabled, playBeadClick } from './utils/audio';
import {
  Volume2,
  VolumeX,
  Calculator,
  GraduationCap,
  Sliders,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('free');
  const [currentBase, setCurrentBase] = useState<number>(10);
  const [numRods, setNumRods] = useState<number>(5);

  // Free abacus state (rods from 0 = least significant)
  const [freeRods, setFreeRods] = useState<number[]>(() => new Array(5).fill(0));

  // Audio state
  const [audioOn, setAudioOn] = useState<boolean>(true);

  // Show guide modal or tips
  const [showTips, setShowTips] = useState<boolean>(false);

  // Sync rods array when base or numRods change
  useEffect(() => {
    setFreeRods((prev) => {
      const next = new Array(numRods).fill(0);
      for (let i = 0; i < Math.min(prev.length, numRods); i++) {
        next[i] = Math.min(currentBase - 1, prev[i]);
      }
      return next;
    });
  }, [currentBase, numRods]);

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setAudioEnabled(next);
    if (next) {
      playBeadClick(1.2);
    }
  };

  const handleOpenVisualizerWithProblem = (a: number, b: number, op: OperationType) => {
    setMode('operations');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <span className="font-mono font-extrabold text-lg">🧮</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900">
                  Base Abacus
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Base 2 → 16
                </span>
              </div>
              <p className="text-[11px] text-stone-700 hidden sm:block">
                Interactive positional numeral abacus & arithmetic engine
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <nav className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200" aria-label="Main Navigation">
            <button
              id="nav-free-mode"
              type="button"
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'free'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-800" />
              <span>Abacus</span>
            </button>

            <button
              id="nav-operations-mode"
              type="button"
              onClick={() => setMode('operations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'operations'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden xs:inline">Operations</span>
              <span className="xs:hidden">Ops</span>
            </button>

            <button
              id="nav-practice-mode"
              type="button"
              onClick={() => setMode('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'practice'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-800" />
              <span>Practice</span>
            </button>
          </nav>

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="sound-toggle-btn"
              type="button"
              onClick={toggleAudio}
              aria-label={audioOn ? 'Mute sound effects' : 'Unmute sound effects'}
              title={audioOn ? 'Sound On' : 'Sound Muted'}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              {audioOn ? <Volume2 className="w-4 h-4 text-amber-800" /> : <VolumeX className="w-4 h-4 text-stone-600" />}
            </button>

            <button
              id="tips-toggle-btn"
              type="button"
              onClick={() => setShowTips(!showTips)}
              aria-label="Toggle helpful guide"
              title="Help & Key Guides"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-stone-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 flex flex-col gap-5">
        {/* Help & Shortcuts Accordion / Card */}
        {showTips && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-950 text-xs sm:text-sm shadow-xs animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-700" />
                How the Base-N Abacus Works
              </h2>
              <button
                type="button"
                onClick={() => setShowTips(false)}
                className="text-amber-800 hover:text-amber-950 font-semibold cursor-pointer text-xs"
              >
                Dismiss ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 leading-relaxed">
              <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
                <strong className="block text-amber-900 mb-1">1. Positional Rods</strong>
                Each rod represents a power of your selected base <span className="font-mono font-bold">B</span>. From right to left: <span className="font-mono">B⁰ = 1</span>, <span className="font-mono">B¹</span>, <span className="font-mono">B²</span>...
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
                <strong className="block text-amber-900 mb-1">2. Active Beads & Beam</strong>
                The brass bar in the middle is the counting beam. Beads touching the beam are active and counted toward that column digit (from <span className="font-mono">0</span> up to <span className="font-mono">B - 1</span>).
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-amber-200/60">
                <strong className="block text-amber-900 mb-1">3. Carrying & Operations</strong>
                When a rod accumulates <span className="font-mono">B</span> beads, it overflows! Those <span className="font-mono">B</span> beads collapse into <span className="font-mono">1</span> bead on the next rod to the left.
              </div>
            </div>
          </div>
        )}

        {/* Base Selector (Available across all modes) */}
        <BaseSelector
          currentBase={currentBase}
          onSelectBase={setCurrentBase}
          numRods={numRods}
          onChangeNumRods={setNumRods}
        />

        {/* View Mode 1: Free Exploration Abacus */}
        {mode === 'free' && (
          <div className="flex flex-col gap-4">
            {/* Interactive Abacus */}
            <div className="w-full">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Interactive Abacus Surface:
                </span>
                <span className="text-xs text-stone-700">
                  Click beads or use + / - to set values
                </span>
              </div>
              <Abacus
                base={currentBase}
                numRods={numRods}
                rodValues={freeRods}
                onChangeRodValue={(rodIndex, newVal) => {
                  const updated = [...freeRods];
                  updated[rodIndex] = newVal;
                  setFreeRods(updated);
                }}
              />
            </div>

            {/* Conversions & Place-Value Decomposition */}
            <ConversionBar
              base={currentBase}
              numRods={numRods}
              rodValues={freeRods}
              onChangeRods={setFreeRods}
            />
          </div>
        )}

        {/* View Mode 2: Operation Visualizer (+, -, *, /) */}
        {mode === 'operations' && (
          <OperationVisualizer
            base={currentBase}
            numRods={numRods}
          />
        )}

        {/* View Mode 3: Practice & Problem Generator */}
        {mode === 'practice' && (
          <PracticeMode
            base={currentBase}
            numRods={numRods}
            onOpenVisualizerWithProblem={handleOpenVisualizerWithProblem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white/70 py-4 px-4 text-center text-xs text-stone-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Base Abacus — Positional Numeral Arithmetic in Bases 2 through 16</span>
          <span className="text-stone-700">Tactile counting beam, step-by-step carries, and problem testing</span>
        </div>
      </footer>
    </div>
  );
}
