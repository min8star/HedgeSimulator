import React, { useState, useMemo } from 'react';
import {
  Building2,
  Landmark,
  TrendingUp,
  ShoppingCart,
  Layers,
  Sparkles,
  BarChart3,
  Scale,
} from 'lucide-react';
import {
  DEFAULT_FX_INPUT,
  FxSimulationInput,
  calculateFxImpact,
} from './fxEngine';
import { Header } from './components/Header';
import { CorporateTab } from './components/CorporateTab';
import { FinanceTab } from './components/FinanceTab';
import { SalesTab } from './components/SalesTab';
import { ProcurementTab } from './components/ProcurementTab';
import { QaSection } from './components/QaSection';
import { Footer } from './components/Footer';

type TabType = 'corporate' | 'finance' | 'sales' | 'procurement';

export default function App() {
  const [input, setInput] = useState<FxSimulationInput>(DEFAULT_FX_INPUT);
  const [activeTab, setActiveTab] = useState<TabType>('corporate');

  // Compute all calculations purely via fxEngine
  const result = useMemo(() => {
    return calculateFxImpact(input);
  }, [input]);

  const handleBaseRateChange = (newBaseRate: number) => {
    setInput((prev) => ({
      ...prev,
      baseRate: newBaseRate,
    }));
  };

  const handleScenarioRateChange = (newScenarioRate: number) => {
    setInput((prev) => ({
      ...prev,
      scenarioRate: newScenarioRate,
    }));
  };

  const tabs: Array<{
    id: TabType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    metricBadge: string;
  }> = [
    {
      id: 'corporate',
      label: '전사 관점',
      sublabel: '자연헤지 & 회계 불일치',
      icon: <Building2 className="w-4 h-4" />,
      metricBadge: `경제적 영향 ${result.economicMetrics.economicImpactKrw > 0 ? `+${result.economicMetrics.economicImpactKrw}` : result.economicMetrics.economicImpactKrw}억`,
    },
    {
      id: 'finance',
      label: '재무 부서',
      sublabel: '장부 Hedge & 파생손익',
      icon: <Landmark className="w-4 h-4" />,
      metricBadge: `Hedge ${result.officialMetrics.hedgeRatio}%`,
    },
    {
      id: 'sales',
      label: '영업 부서',
      sublabel: '수출 마진 & BEP 환율',
      icon: <TrendingUp className="w-4 h-4" />,
      metricBadge: `마진 ${result.exportResults.reduce((s, e) => s + e.marginKrw, 0).toFixed(0)}억`,
    },
    {
      id: 'procurement',
      label: '구매 부서',
      sublabel: '수입 결제액 & 원가 부담',
      icon: <ShoppingCart className="w-4 h-4" />,
      metricBadge: `결제변동 ${result.economicMetrics.procurementDeltaCostTotalKrw > 0 ? `+${result.economicMetrics.procurementDeltaCostTotalKrw}` : result.economicMetrics.procurementDeltaCostTotalKrw}억`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Slider Controls */}
      <Header
        baseRate={input.baseRate}
        scenarioRate={input.scenarioRate}
        onBaseRateChange={handleBaseRateChange}
        onScenarioRateChange={handleScenarioRateChange}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1.5 flex flex-wrap sm:flex-nowrap gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-3 rounded-xl transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                      {tab.label}
                    </div>
                    <div
                      className={`text-[11px] hidden sm:block ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {tab.sublabel}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 hidden md:inline-block ${
                    isActive
                      ? 'bg-slate-800 text-blue-300 border border-slate-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.metricBadge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab View Content */}
        <div className="animate-in fade-in duration-150">
          {activeTab === 'corporate' && (
            <CorporateTab
              result={result}
              input={input}
              onInputChange={setInput}
              onSelectRate={handleScenarioRateChange}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              result={result}
              input={input}
              onInputChange={setInput}
            />
          )}

          {activeTab === 'sales' && (
            <SalesTab
              result={result}
              input={input}
              onInputChange={setInput}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementTab
              result={result}
              input={input}
              onInputChange={setInput}
            />
          )}
        </div>

        {/* Bottom Q&A Section grounded on calculated JSON */}
        <QaSection result={result} />
      </main>

      {/* Mandatory Disclaimer Footer */}
      <Footer />
    </div>
  );
}
