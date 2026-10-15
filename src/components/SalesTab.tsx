import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BadgePercent,
  CircleDollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { FxSimulationResult, FxSimulationInput } from '../fxEngine';
import { AiCommentaryCard } from './AiCommentaryCard';
import { DataEditorAccordion } from './DataEditorAccordion';

interface SalesTabProps {
  result: FxSimulationResult;
  input: FxSimulationInput;
  onInputChange: (newInput: FxSimulationInput) => void;
}

export const SalesTab: React.FC<SalesTabProps> = ({ result, input, onInputChange }) => {
  const { exportResults, economicMetrics, input: simInput, deltaFx } = result;

  const totalUsd = exportResults.reduce((sum, e) => sum + e.usdAmount, 0);
  const totalCost = exportResults.reduce((sum, e) => sum + e.krwCost, 0);
  const totalRevenue = exportResults.reduce((sum, e) => sum + e.revenueKrw, 0);
  const totalMargin = totalRevenue - totalCost;
  const avgMarginRate = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  const avgBep = totalUsd > 0 ? (totalCost * 100) / totalUsd : 0;
  const bepBuffer = simInput.scenarioRate - avgBep;

  // Chart data for Monthly Margin and BEP comparison
  const monthlyChartData = exportResults.map((e) => ({
    month: e.month,
    '원화매출': e.revenueKrw,
    '원화원가': e.krwCost,
    '영업마진': e.marginKrw,
    '손익분기환율(BEP)': e.bepRate,
    '시나리오환율': simInput.scenarioRate,
    marginRate: e.marginRate,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Core Sales Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1: Total USD Exports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">4분기 총 예정 수출</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalUsd}
            <span className="text-sm font-normal text-slate-500 ml-1.5">백만 USD</span>
          </div>
          <p className="text-xs text-slate-500">10~12월 3개월 누적 수출물량</p>
        </div>

        {/* Card 2: Total KRW Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">총 원화매출 (시나리오)</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalRevenue.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1.5">억원</span>
          </div>
          <p className="text-xs text-slate-500">
            기준대비 매출 증감: {economicMetrics.salesDeltaMarginTotalKrw > 0 ? `+${economicMetrics.salesDeltaMarginTotalKrw}` : economicMetrics.salesDeltaMarginTotalKrw} 억원
          </p>
        </div>

        {/* Card 3: Total Margin & Margin Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">총 영업마진</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {avgMarginRate.toFixed(1)}%
            </span>
          </div>
          <div
            className={`text-3xl font-black tracking-tight ${
              totalMargin >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {totalMargin.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1.5">억원</span>
          </div>
          <p className="text-xs text-slate-500">원화원가 합계: {totalCost.toFixed(1)} 억원</p>
        </div>

        {/* Card 4: Break-Even Rate (BEP) vs Scenario Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">평균 손익분기(BEP)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                bepBuffer >= 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              버퍼 {bepBuffer >= 0 ? `+${bepBuffer.toFixed(1)}원` : `${bepBuffer.toFixed(1)}원`}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {avgBep.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1.5">원</span>
          </div>
          <p className="text-xs text-slate-500">
            현재 환율({simInput.scenarioRate}원) 대비 안전마진 확보
          </p>
        </div>
      </div>

      {/* 2. Monthly Revenue, Cost, and Margin Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              월별 원화 매출 · 원가 · 영업마진 비교
            </h3>
            <p className="text-xs text-slate-500">
              시나리오 환율 {simInput.scenarioRate.toLocaleString()}원 적용 시 월별 영업 실적 추정 (단위: 억원)
            </p>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            전체 원화마진: {totalMargin.toFixed(1)}억원
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
              <YAxis unit="억" tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1.5">
                        <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                          {label} 수출 실적
                        </div>
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span style={{ color: item.color }}>{item.name}:</span>
                            <span className="font-bold">{item.value} 억원</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="원화매출" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="원화원가" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="영업마진" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Break-Even (BEP) vs Scenario Rate Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              월별 손익분기 환율(BEP) 및 마진 구조 상세
            </h3>
            <p className="text-xs text-slate-500">
              손익분기 환율(원화원가 ÷ USD수출)을 하회할 경우 수출 영업 적자가 발생합니다.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-semibold">
            시나리오 환율: {simInput.scenarioRate.toLocaleString()}원
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">월별</th>
                <th className="py-2.5 px-3 text-right">예정 수출 (USD M)</th>
                <th className="py-2.5 px-3 text-right">원화원가 (억원)</th>
                <th className="py-2.5 px-3 text-right">시나리오 매출 (억원)</th>
                <th className="py-2.5 px-3 text-right font-bold text-emerald-800">영업 마진 (억원)</th>
                <th className="py-2.5 px-3 text-right font-bold">마진율 (%)</th>
                <th className="py-2.5 px-3 text-right font-bold text-blue-900">손익분기 환율 (BEP)</th>
                <th className="py-2.5 px-3 text-right">기준 대비 마진 증감</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {exportResults.map((exp) => {
                const buffer = simInput.scenarioRate - exp.bepRate;
                return (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{exp.month}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{exp.usdAmount} M$</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{exp.krwCost} 억</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">{exp.revenueKrw} 억</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {exp.marginKrw} 억
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {exp.marginRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-950">
                      {exp.bepRate.toLocaleString()}원
                      <span className="text-[11px] block font-normal text-slate-500">
                        (버퍼 {buffer >= 0 ? `+${buffer.toFixed(1)}원` : `${buffer.toFixed(1)}원`})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          exp.deltaMarginKrw > 0
                            ? 'text-rose-600'
                            : exp.deltaMarginKrw < 0
                            ? 'text-blue-600'
                            : 'text-slate-600'
                        }
                      >
                        {exp.deltaMarginKrw > 0 ? `+${exp.deltaMarginKrw}` : exp.deltaMarginKrw} 억
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="py-2.5 px-3">4분기 합계</td>
                <td className="py-2.5 px-3 text-right font-mono">{totalUsd} M$</td>
                <td className="py-2.5 px-3 text-right font-mono">{totalCost.toFixed(1)} 억</td>
                <td className="py-2.5 px-3 text-right font-mono">{totalRevenue.toFixed(1)} 억</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-800">{totalMargin.toFixed(1)} 억</td>
                <td className="py-2.5 px-3 text-right font-mono">{avgMarginRate.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-900 font-black">
                  가중평균 {avgBep.toFixed(1)}원
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600">
                  {economicMetrics.salesDeltaMarginTotalKrw > 0
                    ? `+${economicMetrics.salesDeltaMarginTotalKrw}`
                    : economicMetrics.salesDeltaMarginTotalKrw} 억원
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. AI Commentary Card */}
      <AiCommentaryCard
        tab="sales"
        tabTitle="영업(수출 & 마진)"
        result={result}
      />

      {/* 5. Input Data Editor */}
      <DataEditorAccordion
        input={input}
        onInputChange={onInputChange}
        activeTabSection="sales"
      />
    </div>
  );
};
