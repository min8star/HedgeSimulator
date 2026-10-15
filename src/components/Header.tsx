import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sliders,
  Building2,
  DollarSign,
} from 'lucide-react';
import { AiScenarioModal } from './AiScenarioModal';

interface HeaderProps {
  baseRate: number;
  scenarioRate: number;
  onBaseRateChange: (rate: number) => void;
  onScenarioRateChange: (rate: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  baseRate,
  scenarioRate,
  onBaseRateChange,
  onScenarioRateChange,
}) => {
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [tempBaseRate, setTempBaseRate] = useState(baseRate.toString());

  const deltaFx = scenarioRate - baseRate;
  const deltaPercent = baseRate > 0 ? ((deltaFx / baseRate) * 100).toFixed(1) : '0.0';

  const minRate = baseRate - 200;
  const maxRate = baseRate + 200;

  const presets = [-100, -50, 0, 50, 100];

  const handleBaseRateBlur = () => {
    const parsed = parseFloat(tempBaseRate.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 500 && parsed < 3000) {
      onBaseRateChange(parsed);
    } else {
      setTempBaseRate(baseRate.toString());
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top corporate branding bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs tracking-wider rounded-sm shadow-xs">
              LX
            </span>
            <span className="font-extrabold tracking-tight text-white text-lg">
              MMA
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              환율 변동 영향 시뮬레이터
              <span className="hidden md:inline-flex text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                FX Risk & Natural Hedge Simulator
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              재무 · 영업 · 구매 부서별 다면 평가 및 전사 자연헤지 · 회계 불일치 분석
            </p>
          </div>
        </div>

        {/* AI Scenario Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>AI 시나리오 생성</span>
          </button>
        </div>
      </div>

      {/* Main Exchange Rate Control Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* 1. Base Rate Input */}
          <div className="lg:col-span-3 flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-medium text-slate-400 block mb-0.5">
                기준환율 (Base FX)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={tempBaseRate}
                  onChange={(e) => setTempBaseRate(e.target.value)}
                  onBlur={handleBaseRateBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBaseRateBlur();
                  }}
                  className="w-24 bg-slate-800 text-white font-bold text-sm px-2.5 py-1 rounded-md border border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#ffffff', backgroundColor: '#1e293b' }}
                />
                <span className="text-xs font-semibold text-slate-300">원 / USD</span>
              </div>
            </div>
          </div>

          {/* 2. Scenario Rate Slider & Presets */}
          <div className="lg:col-span-6 bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                시나리오 환율 조절 (±200원, 10원 단위)
              </span>
              <div className="flex items-center gap-1">
                {presets.map((diff) => {
                  const targetRate = baseRate + diff;
                  const isActive = scenarioRate === targetRate;
                  return (
                    <button
                      key={diff}
                      onClick={() => onScenarioRateChange(targetRate)}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {diff === 0 ? '기준' : diff > 0 ? `+${diff}` : diff}
                    </button>
                  );
                })}
                {scenarioRate !== baseRate && (
                  <button
                    onClick={() => onScenarioRateChange(baseRate)}
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                    title="기준환율로 리셋"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono w-14 text-right">
                {minRate.toLocaleString()}
              </span>
              <input
                type="range"
                min={minRate}
                max={maxRate}
                step={10}
                value={scenarioRate}
                onChange={(e) => onScenarioRateChange(parseInt(e.target.value, 10))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] text-slate-500 font-mono w-14">
                {maxRate.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3. Current Active Scenario Metrics Banner */}
          <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 to-blue-950/80 p-3 rounded-xl border border-blue-900/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-300 block font-medium">
                분석 시나리오 환율
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                {scenarioRate.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">원</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">변동폭 (ΔFX)</span>
              <div
                className={`inline-flex items-center gap-1 font-bold text-sm ${
                  deltaFx > 0
                    ? 'text-rose-400'
                    : deltaFx < 0
                    ? 'text-cyan-400'
                    : 'text-slate-400'
                }`}
              >
                {deltaFx > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : deltaFx < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                <span>
                  {deltaFx > 0 ? `+${deltaFx}` : deltaFx}원
                </span>
                <span className="text-xs font-normal">
                  ({deltaFx > 0 ? `+${deltaPercent}` : deltaPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AiScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        baseRate={baseRate}
        onApplyRate={(rate) => onScenarioRateChange(rate)}
      />
    </header>
  );
};
