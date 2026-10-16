import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Scale,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
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
  Cell,
  ReferenceLine,
} from 'recharts';
import { FxSimulationResult, FxSimulationInput } from '../fxEngine';
import { AiCommentaryCard } from './AiCommentaryCard';
import { DataEditorAccordion } from './DataEditorAccordion';

interface CorporateTabProps {
  result: FxSimulationResult;
  input: FxSimulationInput;
  onInputChange: (newInput: FxSimulationInput) => void;
  onSelectRate: (rate: number) => void;
}

export const CorporateTab: React.FC<CorporateTabProps> = ({
  result,
  input,
  onInputChange,
  onSelectRate,
}) => {
  const { officialMetrics, extendedMetrics, accountingPnl, economicMetrics, deltaFx, sensitivityTable } = result;

  // Chart data for Department Impacts
  const departmentChartData = [
    {
      name: '재무 당기회계손익',
      value: accountingPnl.totalAccountingPnlDeltaKrw,
      category: '재무',
      desc: '환산손익 + 선물환 손익 변화',
    },
    {
      name: '영업 마진 변동',
      value: economicMetrics.salesDeltaMarginTotalKrw,
      category: '영업',
      desc: '4분기 수출 환율 마진 증감',
    },
    {
      name: '구매 원가 변동',
      // Purchasing cost increase is negative impact for company
      value: -economicMetrics.procurementDeltaCostTotalKrw,
      category: '구매',
      desc: '원자재 수입 결제액 증감 (비용)',
    },
    {
      name: '전사 경제적 영향',
      value: economicMetrics.economicImpactKrw,
      category: '전사 종합',
      desc: '자연헤지 반영 실질 현금흐름 영향',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Comparison Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Official Book vs Extended Corporate Hedge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  회사 공식 장부 vs 예정거래 포함 확장 지표
                </h3>
                <p className="text-xs text-slate-500">
                  확정 장부 노출과 미래 4분기 영업·구매 자연헤지 비교
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              외화 포지션
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Left: Official */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">회사 공식 기준</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  장부 확정
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">공식 Hedge 비율</span>
                <div className="text-2xl font-black text-slate-900">
                  {officialMetrics.hedgeRatio}%
                </div>
              </div>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Net Exposure</span>
                <span className="font-bold text-slate-800">
                  {officialMetrics.netExposureUsd > 0 ? `+${officialMetrics.netExposureUsd}` : officialMetrics.netExposureUsd} M$
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Long: {officialMetrics.longUsd} M$</span>
                <span>Short: {officialMetrics.shortUsd} M$</span>
              </div>
            </div>

            {/* Right: Extended Natural Hedge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">예정거래 포함</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-800 font-semibold">
                  자연헤지 관점
                </span>
              </div>
              <div>
                <span className="text-[11px] text-blue-700 block">확장 Hedge 비율</span>
                <div className="text-2xl font-black text-blue-950">
                  {extendedMetrics.extendedHedgeRatio}%
                </div>
              </div>
              <div className="pt-1 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-blue-700">확장 Net Exposure</span>
                <span className="font-bold text-blue-950">
                  {extendedMetrics.extendedNetExposureUsd > 0 ? `+${extendedMetrics.extendedNetExposureUsd}` : extendedMetrics.extendedNetExposureUsd} M$
                </span>
              </div>
              <div className="text-[11px] text-blue-600 flex justify-between">
                <span>수출포함: {extendedMetrics.extendedLongUsd} M$</span>
                <span>수입포함: {extendedMetrics.extendedShortUsd} M$</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              4분기 예정 영업 수출({extendedMetrics.plannedExportsTotalUsd}M$)과 원자재 수입({extendedMetrics.plannedImportsTotalUsd}M$)이 서로 상쇄되는 자연헤지(Natural Hedge)로 인해 전사 실질 Net Exposure는 <strong>+{extendedMetrics.extendedNetExposureUsd}M$</strong> 수준입니다.
            </span>
          </div>
        </div>

        {/* Card 2: Accounting P&L vs Economic Impact & Accounting Mismatch */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  당기 회계손익 vs 전사 경제적 영향 (회계 불일치)
                </h3>
                <p className="text-xs text-slate-500">
                  △환율 ({deltaFx >= 0 ? `+${deltaFx}` : deltaFx}원) 변동에 따른 손익 구조 분해
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              손익 변동
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Accounting P&L */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 block">당기 회계손익 변화</span>
              <div
                className={`text-2xl font-black ${
                  accountingPnl.totalAccountingPnlDeltaKrw > 0
                    ? 'text-rose-600'
                    : accountingPnl.totalAccountingPnlDeltaKrw < 0
                    ? 'text-blue-600'
                    : 'text-slate-800'
                }`}
              >
                {accountingPnl.totalAccountingPnlDeltaKrw > 0
                  ? `+${accountingPnl.totalAccountingPnlDeltaKrw}`
                  : accountingPnl.totalAccountingPnlDeltaKrw}
                <span className="text-sm font-normal text-slate-500 ml-1">억원</span>
              </div>
              <p className="text-[11px] text-slate-500">
                장부 손익계산서 즉시 반영분 (환산 + 선물환)
              </p>
            </div>

            {/* Economic Impact */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-200 space-y-1.5">
              <span className="text-xs font-semibold text-indigo-900 block">종합 경제적 영향</span>
              <div
                className={`text-2xl font-black ${
                  economicMetrics.economicImpactKrw > 0
                    ? 'text-rose-600'
                    : economicMetrics.economicImpactKrw < 0
                    ? 'text-blue-600'
                    : 'text-slate-800'
                }`}
              >
                {economicMetrics.economicImpactKrw > 0
                  ? `+${economicMetrics.economicImpactKrw}`
                  : economicMetrics.economicImpactKrw}
                <span className="text-sm font-normal text-slate-500 ml-1">억원</span>
              </div>
              <p className="text-[11px] text-indigo-700">
                미래 영업·구매 실질 현금흐름 포괄
              </p>
            </div>
          </div>

          {/* Accounting Mismatch Highlight Box */}
          <div className="mt-3.5 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-950 block">
                회계 불일치 (Accounting Mismatch) = {economicMetrics.accountingMismatchKrw > 0 ? `+${economicMetrics.accountingMismatchKrw}` : economicMetrics.accountingMismatchKrw} 억원
              </span>
              <span className="text-amber-800 text-[11px]">
                경제적 영향({economicMetrics.economicImpactKrw}억) − 당기 회계손익({accountingPnl.totalAccountingPnlDeltaKrw}억)
              </span>
            </div>
            <span className="text-[11px] px-2 py-1 rounded bg-amber-200/70 text-amber-900 font-semibold shrink-0">
              시차 발생분
            </span>
          </div>
        </div>
      </div>

      {/* 2. Department Impact Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              부서별 환율 변동 영향 및 전사 경제적 효과 비교
            </h3>
            <p className="text-xs text-slate-500">
              기준환율 {input.baseRate.toLocaleString()}원 대비 시나리오 {input.scenarioRate.toLocaleString()}원 (△환율: {deltaFx > 0 ? `+${deltaFx}` : deltaFx}원) 변동 시 부서별 손익 기여 (단위: 억원)
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            + 이익 기여 / - 손실 또는 비용 증가
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
              />
              <YAxis
                unit="억"
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                        <div className="font-bold text-slate-200">{data.name}</div>
                        <div className="text-sm font-black text-cyan-300">
                          {data.value > 0 ? `+${data.value}` : data.value} 억원
                        </div>
                        <div className="text-[11px] text-slate-400">{data.desc}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {departmentChartData.map((entry, index) => {
                  // Custom bar colors
                  let fillColor = '#0284C7';
                  if (entry.name === '재무 당기회계손익') fillColor = '#3B82F6';
                  if (entry.name === '영업 마진 변동') fillColor = '#10B981';
                  if (entry.name === '구매 원가 변동') fillColor = '#F59E0B';
                  if (entry.name === '전사 경제적 영향') fillColor = '#6366F1';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
          <div className="p-2 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11px]">재무 당기회계</span>
            <strong className="text-slate-900">
              {accountingPnl.totalAccountingPnlDeltaKrw > 0 ? `+${accountingPnl.totalAccountingPnlDeltaKrw}` : accountingPnl.totalAccountingPnlDeltaKrw} 억원
            </strong>
          </div>
          <div className="p-2 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11px]">영업 마진</span>
            <strong className="text-slate-900">
              {economicMetrics.salesDeltaMarginTotalKrw > 0 ? `+${economicMetrics.salesDeltaMarginTotalKrw}` : economicMetrics.salesDeltaMarginTotalKrw} 억원
            </strong>
          </div>
          <div className="p-2 rounded bg-slate-50">
            <span className="text-slate-500 block text-[11px]">구매 결제부담</span>
            <strong className="text-slate-900">
              {economicMetrics.procurementDeltaCostTotalKrw > 0 ? `+${economicMetrics.procurementDeltaCostTotalKrw}` : economicMetrics.procurementDeltaCostTotalKrw} 억원 증가
            </strong>
          </div>
          <div className="p-2 rounded bg-blue-50/80">
            <span className="text-blue-700 block text-[11px]">전사 경제적 영향</span>
            <strong className="text-blue-950 font-bold">
              {economicMetrics.economicImpactKrw > 0 ? `+${economicMetrics.economicImpactKrw}` : economicMetrics.economicImpactKrw} 억원
            </strong>
          </div>
        </div>
      </div>

      {/* 3. AI Commentary Card */}
      <AiCommentaryCard
        tab="corporate"
        tabTitle="전사(CFO 보고용)"
        result={result}
      />

      {/* 4. FX Sensitivity Analysis Table (-200 ~ +200) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              환율 민감도 분석 표 (기준환율 ±200원, 50원 단위)
            </h3>
            <p className="text-xs text-slate-500">
              각 행을 클릭하면 해당 환율 시나리오로 즉시 변경됩니다.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">단위: 억원 (환율: 원)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">시나리오 환율</th>
                <th className="py-2.5 px-3">△환율 (변동폭)</th>
                <th className="py-2.5 px-3 text-right">당기 회계손익</th>
                <th className="py-2.5 px-3 text-right">영업 마진 변동</th>
                <th className="py-2.5 px-3 text-right">구매 원가 변동</th>
                <th className="py-2.5 px-3 text-right font-bold text-indigo-950">
                  전사 경제적 영향
                </th>
                <th className="py-2.5 px-3 text-right text-amber-900">회계 불일치</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {sensitivityTable.map((row) => {
                const isSelected = row.scenarioRate === input.scenarioRate;
                return (
                  <tr
                    key={row.rateDiff}
                    onClick={() => onSelectRate(row.scenarioRate)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-100/70 font-semibold text-blue-950'
                        : row.rateDiff === 0
                        ? 'bg-slate-50 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-1.5 font-bold">
                      {row.scenarioRate.toLocaleString()}원
                      {row.rateDiff === 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-normal">
                          기준
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-normal">
                          선택됨
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          row.rateDiff > 0
                            ? 'text-rose-600 font-semibold'
                            : row.rateDiff < 0
                            ? 'text-blue-600 font-semibold'
                            : 'text-slate-500'
                        }
                      >
                        {row.rateDiff > 0 ? `+${row.rateDiff}` : row.rateDiff}원
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {row.accountingPnlDeltaKrw > 0
                        ? `+${row.accountingPnlDeltaKrw}`
                        : row.accountingPnlDeltaKrw}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                      {row.salesDeltaMarginKrw > 0
                        ? `+${row.salesDeltaMarginKrw}`
                        : row.salesDeltaMarginKrw}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                      {row.procurementDeltaCostKrw > 0
                        ? `+${row.procurementDeltaCostKrw}`
                        : row.procurementDeltaCostKrw}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-900">
                      {row.economicImpactKrw > 0
                        ? `+${row.economicImpactKrw}`
                        : row.economicImpactKrw}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800">
                      {row.accountingMismatchKrw > 0
                        ? `+${row.accountingMismatchKrw}`
                        : row.accountingMismatchKrw}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Input Data Editor */}
      <DataEditorAccordion
        input={input}
        onInputChange={onInputChange}
        activeTabSection="all"
      />
    </div>
  );
};
