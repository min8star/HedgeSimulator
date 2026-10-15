import React from 'react';
import {
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FxSimulationResult, FxSimulationInput } from '../fxEngine';
import { AiCommentaryCard } from './AiCommentaryCard';
import { DataEditorAccordion } from './DataEditorAccordion';

interface ProcurementTabProps {
  result: FxSimulationResult;
  input: FxSimulationInput;
  onInputChange: (newInput: FxSimulationInput) => void;
}

export const ProcurementTab: React.FC<ProcurementTabProps> = ({
  result,
  input,
  onInputChange,
}) => {
  const { importResults, economicMetrics, input: simInput, deltaFx, extendedMetrics } = result;

  const totalUsd = importResults.reduce((sum, i) => sum + i.usdAmount, 0);
  const totalSettlement = importResults.reduce((sum, i) => sum + i.settlementKrw, 0);
  const baseTotalSettlement = (totalUsd * simInput.baseRate) / 100;
  const totalDeltaSettlement = economicMetrics.procurementDeltaCostTotalKrw;

  // Natural Hedge Offset ratio by Export (수출 유입에 의한 원자재 결제 자연헤지 상쇄율)
  const naturalHedgeOffsetRatio =
    extendedMetrics.plannedExportsTotalUsd > 0
      ? ((totalUsd / extendedMetrics.plannedExportsTotalUsd) * 100).toFixed(1)
      : '0.0';

  // Chart data for monthly comparison
  const monthlyChartData = importResults.map((imp) => {
    const baseSettlement = (imp.usdAmount * simInput.baseRate) / 100;
    return {
      month: imp.month,
      '기준환율 결제액': Math.round(baseSettlement * 10) / 10,
      '시나리오 결제액': imp.settlementKrw,
      '증감액': imp.deltaSettlementKrw,
      usd: imp.usdAmount,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Core Procurement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1: Total USD Imports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">4분기 총 예정 수입</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalUsd}
            <span className="text-sm font-normal text-slate-500 ml-1.5">백만 USD</span>
          </div>
          <p className="text-xs text-slate-500">원자재/부자재 10~12월 수입물량</p>
        </div>

        {/* Card 2: Total KRW Settlement */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">원화 총 결제액 (시나리오)</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalSettlement.toFixed(1)}
            <span className="text-sm font-normal text-slate-500 ml-1.5">억원</span>
          </div>
          <p className="text-xs text-slate-500">
            기준환율 결제액: {baseTotalSettlement.toFixed(1)} 억원
          </p>
        </div>

        {/* Card 3: KRW Cost Delta */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">기준대비 원가 증감</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
              ΔFX: {deltaFx >= 0 ? `+${deltaFx}` : deltaFx}원
            </span>
          </div>
          <div
            className={`text-3xl font-black tracking-tight ${
              totalDeltaSettlement > 0
                ? 'text-amber-600'
                : totalDeltaSettlement < 0
                ? 'text-emerald-600'
                : 'text-slate-900'
            }`}
          >
            {totalDeltaSettlement > 0 ? `+${totalDeltaSettlement}` : totalDeltaSettlement}
            <span className="text-sm font-normal text-slate-500 ml-1.5">억원</span>
          </div>
          <p className="text-xs text-slate-500">
            {totalDeltaSettlement > 0 ? '원가 상승 (결제부담 가중)' : '원가 절감 (결제부담 완화)'}
          </p>
        </div>

        {/* Card 4: Natural Hedge Ratio */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">수출 대비 수입 비율</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              자연헤지 완충
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {naturalHedgeOffsetRatio}%
          </div>
          <p className="text-xs text-slate-500">
            수입 {totalUsd}M$ ÷ 수출 {extendedMetrics.plannedExportsTotalUsd}M$
          </p>
        </div>
      </div>

      {/* 2. Monthly Settlement Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              월별 원화 결제액 및 기준 대비 증감액 비교
            </h3>
            <p className="text-xs text-slate-500">
              기준환율 {simInput.baseRate.toLocaleString()}원 vs 시나리오 환율 {simInput.scenarioRate.toLocaleString()}원 결제액 비교 (단위: 억원)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold">
            총 조달변동: {totalDeltaSettlement > 0 ? `+${totalDeltaSettlement}` : totalDeltaSettlement}억원
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
                          {label} 수입 결제
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
              <Bar dataKey="기준환율 결제액" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="시나리오 결제액" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="증감액" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              월별 원자재 수입 결제 소요액 상세 내역
            </h3>
            <p className="text-xs text-slate-500">
              원화 결제액 = USD수입액 × 환율 ÷ 100, 기준 대비 증감 = USD수입액 × ΔFX ÷ 100
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">단위: USD 백만, 억원</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">월별</th>
                <th className="py-2.5 px-3 text-right">예정 수입액 (USD M)</th>
                <th className="py-2.5 px-3 text-right">기준환율 결제액 (억원)</th>
                <th className="py-2.5 px-3 text-right font-bold text-blue-900">
                  시나리오 환율 결제액 (억원)
                </th>
                <th className="py-2.5 px-3 text-right font-bold text-amber-800">
                  기준 대비 증감 (억원)
                </th>
                <th className="py-2.5 px-3">비고 / 결제 영향</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {importResults.map((imp) => {
                const baseKrw = (imp.usdAmount * simInput.baseRate) / 100;
                return (
                  <tr key={imp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{imp.month}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {imp.usdAmount} M$
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {baseKrw.toFixed(1)} 억
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-950">
                      {imp.settlementKrw} 억
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          imp.deltaSettlementKrw > 0
                            ? 'text-amber-700'
                            : imp.deltaSettlementKrw < 0
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }
                      >
                        {imp.deltaSettlementKrw > 0
                          ? `+${imp.deltaSettlementKrw}`
                          : imp.deltaSettlementKrw}{' '}
                        억
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {imp.deltaSettlementKrw > 0 ? '원화 결제자금 추가 소요' : '결제비용 절감 효과'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="py-2.5 px-3">4분기 합계</td>
                <td className="py-2.5 px-3 text-right font-mono">{totalUsd} M$</td>
                <td className="py-2.5 px-3 text-right font-mono">{baseTotalSettlement.toFixed(1)} 억</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-900 font-black">
                  {totalSettlement.toFixed(1)} 억
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-800 font-black">
                  {totalDeltaSettlement > 0 ? `+${totalDeltaSettlement}` : totalDeltaSettlement} 억원
                </td>
                <td className="py-2.5 px-3 text-slate-500 text-xs">
                  전사 수출로 100% 이상 커버 가능
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. AI Commentary Card */}
      <AiCommentaryCard
        tab="procurement"
        tabTitle="구매(수입 & 결제)"
        result={result}
      />

      {/* 5. Input Data Editor */}
      <DataEditorAccordion
        input={input}
        onInputChange={onInputChange}
        activeTabSection="procurement"
      />
    </div>
  );
};
