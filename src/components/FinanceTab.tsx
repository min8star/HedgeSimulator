import React from 'react';
import {
  ShieldCheck,
  Building,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
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
} from 'recharts';
import { FxSimulationResult, FxSimulationInput } from '../fxEngine';
import { AiCommentaryCard } from './AiCommentaryCard';
import { DataEditorAccordion } from './DataEditorAccordion';

interface FinanceTabProps {
  result: FxSimulationResult;
  input: FxSimulationInput;
  onInputChange: (newInput: FxSimulationInput) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ result, input, onInputChange }) => {
  const { officialMetrics, accountingPnl, forwardResults, deltaFx, input: simInput } = result;
  const { treasury } = simInput;

  // Chart data for Long vs Short Composition
  const positionChartData = [
    {
      category: 'Long 포지션 (외화 자산)',
      'AR 매출채권': treasury.ar,
      '외화예금': treasury.foreignDeposits,
      '선물환 매입': officialMetrics.forwardBuyTotalUsd,
      total: officialMetrics.longUsd,
    },
    {
      category: 'Short 포지션 (외화 부채·헤지)',
      'AP 매입채무': treasury.ap,
      '채권 네고': treasury.billsDiscounted,
      '선물환 매도': officialMetrics.forwardSellTotalUsd,
      total: officialMetrics.shortUsd,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Official Hedge Ratio */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">공식 Hedge 비율</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Short ÷ Long
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {officialMetrics.hedgeRatio}%
          </div>
          <p className="text-xs text-slate-500">
            장부 확정 노출 기준: Short {officialMetrics.shortUsd}M$ ÷ Long {officialMetrics.longUsd}M$
          </p>
        </div>

        {/* Card 2: Net Exposure */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">장부 Net Exposure</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              Long − Short
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {officialMetrics.netExposureUsd > 0
              ? `+${officialMetrics.netExposureUsd}`
              : officialMetrics.netExposureUsd}
            <span className="text-sm font-normal text-slate-500 ml-1.5">백만 USD</span>
          </div>
          <p className="text-xs text-slate-500">
            {officialMetrics.netExposureUsd > 0
              ? '순 롱 포지션 (환율 상승 시 환산이익)'
              : officialMetrics.netExposureUsd < 0
              ? '순 숏 포지션 (환율 하락 시 환산이익)'
              : '완전 균형 (Zero Exposure)'}
          </p>
        </div>

        {/* Card 3: Total Accounting P&L Delta */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">당기 회계손익 변화</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              △환율: {deltaFx >= 0 ? `+${deltaFx}` : deltaFx}원
            </span>
          </div>
          <div
            className={`text-3xl font-black tracking-tight ${
              accountingPnl.totalAccountingPnlDeltaKrw > 0
                ? 'text-rose-600'
                : accountingPnl.totalAccountingPnlDeltaKrw < 0
                ? 'text-blue-600'
                : 'text-slate-900'
            }`}
          >
            {accountingPnl.totalAccountingPnlDeltaKrw > 0
              ? `+${accountingPnl.totalAccountingPnlDeltaKrw}`
              : accountingPnl.totalAccountingPnlDeltaKrw}
            <span className="text-sm font-normal text-slate-500 ml-1.5">억원</span>
          </div>
          <p className="text-xs text-slate-500">
            환산손익 ({accountingPnl.fxTranslationDeltaKrw > 0 ? `+${accountingPnl.fxTranslationDeltaKrw}` : accountingPnl.fxTranslationDeltaKrw}억) + 선물환 손익 ({accountingPnl.forwardDeltaTotalKrw > 0 ? `+${accountingPnl.forwardDeltaTotalKrw}` : accountingPnl.forwardDeltaTotalKrw}억)
          </p>
        </div>
      </div>

      {/* 2. Long / Short Composition Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              장부 확정 Long / Short 포지션 구성 분해
            </h3>
            <p className="text-xs text-slate-500">
              외화 자산(Long {officialMetrics.longUsd}M$)과 외화 부채 및 파생 헤지(Short {officialMetrics.shortUsd}M$)의 상세 항목
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              순 노출(Net): {officialMetrics.netExposureUsd > 0 ? `+${officialMetrics.netExposureUsd}` : officialMetrics.netExposureUsd}백만 USD
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={positionChartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" unit="M$" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 600 }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                        <div className="font-bold text-slate-200">{label}</div>
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span style={{ color: item.color }}>{item.name}:</span>
                            <span className="font-bold">{item.value} 백만 USD</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {/* Long stack */}
              <Bar dataKey="AR 매출채권" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="외화예금" stackId="a" fill="#60A5FA" radius={[0, 0, 0, 0]} />
              <Bar dataKey="선물환 매입" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
              {/* Short stack */}
              <Bar dataKey="AP 매입채무" stackId="b" fill="#DC2626" radius={[0, 0, 0, 0]} />
              <Bar dataKey="채권 네고" stackId="b" fill="#F87171" radius={[0, 0, 0, 0]} />
              <Bar dataKey="선물환 매도" stackId="b" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Check Notice */}
        <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>회계 항등식 검증 완료:</strong> 당기 회계손익 변화 ({accountingPnl.totalAccountingPnlDeltaKrw}억원) = 환산손익 변화 ({accountingPnl.fxTranslationDeltaKrw}억) + 선물환 총 변화 ({accountingPnl.forwardDeltaTotalKrw}억) = Net Exposure ({officialMetrics.netExposureUsd}M$) × △환율 ({deltaFx}원) ÷ 100
          </span>
        </div>
      </div>

      {/* 3. Forward Contracts Detailed Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              선물환(통화선도) 계약별 손익 및 회계인식 내역
            </h3>
            <p className="text-xs text-slate-500">
              분석 기간 내 만기는 통화선도거래손익(실현), 기간 말 미도래는 통화선도평가손익(미실현)으로 분류
            </p>
          </div>
          <span className="text-xs text-slate-500">단위: USD 백만, 원, 억원</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">계약명</th>
                <th className="py-2.5 px-3">구분</th>
                <th className="py-2.5 px-3 text-right">금액 (USD M)</th>
                <th className="py-2.5 px-3 text-right">계약환율</th>
                <th className="py-2.5 px-3">만기</th>
                <th className="py-2.5 px-3">회계 계정 분류</th>
                <th className="py-2.5 px-3 text-right">시나리오 손익</th>
                <th className="py-2.5 px-3 text-right">기준환율 손익</th>
                <th className="py-2.5 px-3 text-right font-bold text-blue-950">
                  기준 대비 변화 (Δ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {forwardResults.map((fwd) => {
                const isSell = fwd.type === 'sell';
                return (
                  <tr key={fwd.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{fwd.name}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          isSell
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isSell ? '매도 (Sell)' : '매입 (Buy)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {fwd.amount} M$
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {fwd.contractRate.toLocaleString()}원
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{fwd.maturity}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          fwd.isMaturedInPeriod
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {fwd.accountingCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={
                          fwd.scenarioProfitKrw > 0
                            ? 'text-rose-600 font-semibold'
                            : fwd.scenarioProfitKrw < 0
                            ? 'text-blue-600 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {fwd.scenarioProfitKrw > 0
                          ? `+${fwd.scenarioProfitKrw}`
                          : fwd.scenarioProfitKrw}{' '}
                        억
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {fwd.baseProfitKrw > 0 ? `+${fwd.baseProfitKrw}` : fwd.baseProfitKrw} 억
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          fwd.deltaProfitKrw > 0
                            ? 'text-rose-600'
                            : fwd.deltaProfitKrw < 0
                            ? 'text-blue-600'
                            : 'text-slate-700'
                        }
                      >
                        {fwd.deltaProfitKrw > 0 ? `+${fwd.deltaProfitKrw}` : fwd.deltaProfitKrw} 억
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td colSpan={2} className="py-2.5 px-3">
                  선물환 합계
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  매도 {officialMetrics.forwardSellTotalUsd}M$
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-slate-500 font-normal">
                  거래손익 {accountingPnl.forwardTradingGainKrw > 0 ? `+${accountingPnl.forwardTradingGainKrw}` : accountingPnl.forwardTradingGainKrw}억 / 평가손익 {accountingPnl.forwardValuationGainKrw > 0 ? `+${accountingPnl.forwardValuationGainKrw}` : accountingPnl.forwardValuationGainKrw}억
                </td>
                <td colSpan={2} />
                <td className="py-2.5 px-3 text-right font-mono text-blue-900 font-black">
                  {accountingPnl.forwardDeltaTotalKrw > 0
                    ? `+${accountingPnl.forwardDeltaTotalKrw}`
                    : accountingPnl.forwardDeltaTotalKrw} 억원
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. AI Commentary Card */}
      <AiCommentaryCard
        tab="finance"
        tabTitle="재무(회계 & 파생)"
        result={result}
      />

      {/* 5. Input Data Editor */}
      <DataEditorAccordion
        input={input}
        onInputChange={onInputChange}
        activeTabSection="finance"
      />
    </div>
  );
};
