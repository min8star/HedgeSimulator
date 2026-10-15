/**
 * LX MMA 환율 시뮬레이터 - Gemini AI 서비스
 *
 * [원칙]
 * 1. Gemini는 계산을 수행하지 않음. 오직 fxEngine.ts의 계산 결과 JSON만을 인용.
 * 2. 프롬프트에 "주어진 숫자만 인용하고 새로 계산하지 말 것"을 명시.
 * 3. Gemini 호출은 본 파일에서만 통합 관리.
 * 4. 네트워크 단절, 키 미설정, 쿼터 초과 시 규칙 기반의 완벽한 전문가 해설로 즉각 폴백하여 앱이 절대 멈추지 않음.
 */

import { FxSimulationResult } from './fxEngine';

export interface TabCommentaryResult {
  text: string;
  isAi: boolean;
  generatedAt: string;
}

export interface ScenarioProposal {
  type: 'pessimistic' | 'base' | 'optimistic';
  label: string;
  rate: number;
  rationale: string;
}

export interface ScenarioProposalResult {
  scenarios: ScenarioProposal[];
  isAi: boolean;
}

export interface QaResponseResult {
  answer: string;
  isAi: boolean;
}

/**
 * 계산 결과를 Gemini에 전달하기 위한 정제된 요약 JSON 생성
 */
function buildSimulationSummary(result: FxSimulationResult) {
  const { input, deltaFx, officialMetrics, extendedMetrics, accountingPnl, economicMetrics, exportResults, importResults } = result;

  const totalExportRevenue = exportResults.reduce((sum, item) => sum + item.revenueKrw, 0);
  const totalExportCost = input.plannedExports.reduce((sum, item) => sum + item.krwCost, 0);
  const totalExportMargin = totalExportRevenue - totalExportCost;
  const avgExportBep = totalExportCost > 0 && extendedMetrics.plannedExportsTotalUsd > 0
    ? (totalExportCost * 100) / extendedMetrics.plannedExportsTotalUsd
    : 0;

  const totalImportSettlement = importResults.reduce((sum, item) => sum + item.settlementKrw, 0);

  return {
    exchangeRates: {
      baseRate: input.baseRate,
      scenarioRate: input.scenarioRate,
      deltaFx,
    },
    companyOfficialMetrics: {
      longUsd: officialMetrics.longUsd,
      shortUsd: officialMetrics.shortUsd,
      hedgeRatioPercent: officialMetrics.hedgeRatio,
      netExposureUsd: officialMetrics.netExposureUsd,
      forwardSellTotalUsd: officialMetrics.forwardSellTotalUsd,
      forwardBuyTotalUsd: officialMetrics.forwardBuyTotalUsd,
    },
    extendedCorporateMetrics: {
      extendedLongUsd: extendedMetrics.extendedLongUsd,
      extendedShortUsd: extendedMetrics.extendedShortUsd,
      extendedHedgeRatioPercent: extendedMetrics.extendedHedgeRatio,
      extendedNetExposureUsd: extendedMetrics.extendedNetExposureUsd,
      plannedExportsTotalUsd: extendedMetrics.plannedExportsTotalUsd,
      plannedImportsTotalUsd: extendedMetrics.plannedImportsTotalUsd,
    },
    accountingProfitLoss: {
      fxTranslationDeltaKrw: accountingPnl.fxTranslationDeltaKrw,
      forwardTradingGainRealizedKrw: accountingPnl.forwardTradingGainKrw,
      forwardValuationGainUnrealizedKrw: accountingPnl.forwardValuationGainKrw,
      forwardDeltaTotalKrw: accountingPnl.forwardDeltaTotalKrw,
      totalAccountingPnlDeltaKrw: accountingPnl.totalAccountingPnlDeltaKrw,
    },
    economicImpactAndMismatch: {
      economicImpactKrw: economicMetrics.economicImpactKrw,
      accountingMismatchKrw: economicMetrics.accountingMismatchKrw,
      salesDeltaMarginTotalKrw: economicMetrics.salesDeltaMarginTotalKrw,
      procurementDeltaCostTotalKrw: economicMetrics.procurementDeltaCostTotalKrw,
    },
    departmentTotals: {
      sales: {
        totalUsd: extendedMetrics.plannedExportsTotalUsd,
        totalCostKrw: Math.round(totalExportCost * 10) / 10,
        totalRevenueKrw: Math.round(totalExportRevenue * 10) / 10,
        totalMarginKrw: Math.round(totalExportMargin * 10) / 10,
        avgBepRate: Math.round(avgExportBep * 10) / 10,
      },
      procurement: {
        totalUsd: extendedMetrics.plannedImportsTotalUsd,
        totalSettlementKrw: Math.round(totalImportSettlement * 10) / 10,
        costDeltaKrw: economicMetrics.procurementDeltaCostTotalKrw,
      },
    },
  };
}

/**
 * 규칙 기반 폴백 해설 (네트워크 오류나 API 키 부재 시에도 100% 동작)
 */
function generateFallbackCommentary(tab: 'corporate' | 'finance' | 'sales' | 'procurement', result: FxSimulationResult): string {
  const summary = buildSimulationSummary(result);
  const { exchangeRates, companyOfficialMetrics, extendedCorporateMetrics, accountingProfitLoss, economicImpactAndMismatch, departmentTotals } = summary;
  const deltaSign = exchangeRates.deltaFx > 0 ? `+${exchangeRates.deltaFx}` : `${exchangeRates.deltaFx}`;

  if (tab === 'corporate') {
    return `회사 공식 장부상 Hedge 비율은 ${companyOfficialMetrics.hedgeRatioPercent}%이며 확정 Net Exposure는 ${companyOfficialMetrics.netExposureUsd}백만 USD(순 롱)입니다.
반면 영업 및 구매 부서의 4분기 예정거래를 포괄한 전사 확장 Hedge 비율은 ${extendedCorporateMetrics.extendedHedgeRatioPercent}%, 확장 Net Exposure는 ${extendedCorporateMetrics.extendedNetExposureUsd}백만 USD입니다.
환율 ${deltaSign}원 변동 시 단기 장부상 당기 회계손익 변화는 ${accountingProfitLoss.totalAccountingPnlDeltaKrw}억원에 그치지만, 미래 영업 현금흐름까지 감안한 경제적 영향은 ${economicImpactAndMismatch.economicImpactKrw}억원으로 ${economicImpactAndMismatch.accountingMismatchKrw}억원의 회계 불일치(Accounting Mismatch)가 시각화됩니다.
이는 선물환 평가손익 등 단기 장부상 변동이 향후 입금될 영업 수출대금의 원화 환차익과 상쇄되는 전사 자연헤지(Natural Hedge) 효과를 명확히 입증합니다.
- [실행 제안] 경영진 보고 시 단기 장부 손익(${accountingProfitLoss.totalAccountingPnlDeltaKrw}억원)의 착시에 매몰되지 않도록 '확장 Net Exposure 기반 종합 경제적 영향(${economicImpactAndMismatch.economicImpactKrw}억원)'을 병기 보고하고, 순수출 익스포저(${extendedCorporateMetrics.extendedNetExposureUsd}백만 USD)에 맞춰 만기 도래 선물환의 롤오버 규모를 전략적으로 결정하십시오.`;
  }

  if (tab === 'finance') {
    return `현재 장부상 Long 포지션은 ${companyOfficialMetrics.longUsd}백만 USD, Short 포지션은 ${companyOfficialMetrics.shortUsd}백만 USD로 Hedge 비율은 ${companyOfficialMetrics.hedgeRatioPercent}%, Net Exposure는 ${companyOfficialMetrics.netExposureUsd}백만 USD입니다.
시나리오 환율 ${exchangeRates.scenarioRate}원 적용 시 외화자산·부채 환산손익 변화는 ${accountingProfitLoss.fxTranslationDeltaKrw}억원이며, 선물환 파생상품 손익 변화는 ${accountingProfitLoss.forwardDeltaTotalKrw}억원(실현 ${accountingProfitLoss.forwardTradingGainRealizedKrw}억원, 미실현 ${accountingProfitLoss.forwardValuationGainUnrealizedKrw}억원)으로 당기 회계손익 변화는 총 ${accountingProfitLoss.totalAccountingPnlDeltaKrw}억원으로 집계됩니다.
환율 상승 구간에서는 만기 미도래 선물환 매도 계약에서 통화선도평가손실이 선제적으로 당기손익에 계상되지만, 이는 경제적으로 추후 실현될 영업본부의 미래 수출대금 환차익과 상쇄되므로 실질적 현금유출 리스크는 통제되고 있습니다.
- [실행 제안] 10월말 만기 도래 선물환 계약A(${result.forwardResults.find(f => f.id === 'fwd-a')?.amount || 15}백만 USD)의 결제대금 소요를 점검하고, 통화선도평가손익과 영업 매출 간의 회계 불일치 설명자료를 사전에 구비하십시오.`;
  }

  if (tab === 'sales') {
    const safetyMargin = Math.round((exchangeRates.scenarioRate - departmentTotals.sales.avgBepRate) * 10) / 10;
    return `4분기 총 영업 예정 수출은 ${departmentTotals.sales.totalUsd}백만 USD(원화 원가 ${departmentTotals.sales.totalCostKrw}억원) 규모입니다.
시나리오 환율 ${exchangeRates.scenarioRate}원 하에서 총 원화매출은 ${departmentTotals.sales.totalRevenueKrw}억원, 영업 마진은 ${departmentTotals.sales.totalMarginKrw}억원으로 기준환율 대비 ${economicImpactAndMismatch.salesDeltaMarginTotalKrw}억원의 마진 ${economicImpactAndMismatch.salesDeltaMarginTotalKrw >= 0 ? '개선' : '감소'} 효과가 발생합니다.
전체 가중평균 손익분기 환율(BEP)은 ${departmentTotals.sales.avgBepRate}원이며, 현재 시나리오 환율(${exchangeRates.scenarioRate}원)은 전 월에 걸쳐 건전한 마진 버퍼(안전마진 ${safetyMargin}원)를 확보하고 있습니다.
- [실행 제안] 글로벌 바이어와의 4분기 공급단가 협상 시 월별 BEP 환율(10월 1,300원, 11월 1,309.1원, 12월 1,292.3원)을 하한선으로 방어하고, 환율 급락에 대비한 최저보장 환율 연동제를 사전 협의하십시오.`;
  }

  // procurement
  return `4분기 원자재 수입 조달 규모는 총 ${departmentTotals.procurement.totalUsd}백만 USD입니다.
시나리오 환율 ${exchangeRates.scenarioRate}원 적용 시 총 원화 결제액은 ${departmentTotals.procurement.totalSettlementKrw}억원으로, 기준환율 대비 구매 결제 부담이 ${economicImpactAndMismatch.procurementDeltaCostTotalKrw}억원 ${economicImpactAndMismatch.procurementDeltaCostTotalKrw >= 0 ? '증가' : '절감'}합니다.
원화 결제액 증가 부담은 회사 전체의 영업 수출 유입(${departmentTotals.sales.totalUsd}백만 USD)을 통한 자연헤지로 완충되나, 구매 부서 개별 실적에는 직접적인 원가 상승 압력으로 작용합니다.
- [실행 제안] 고환율 시기 결제 부담 완화를 위해 주요 납품처와 Usance 결제기한 연장을 협의하고, 급등 우려 원료에 대해서는 수입 선물환(Buy Forward) 매입을 재무팀과 공동 검토하십시오.`;
}

/**
 * 탭별 AI 해설 요청 (서버 프록시 호출 -> 실패 시 규칙 기반 폴백)
 */
export async function getTabCommentary(
  tab: 'corporate' | 'finance' | 'sales' | 'procurement',
  result: FxSimulationResult
): Promise<TabCommentaryResult> {
  const summary = buildSimulationSummary(result);
  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  try {
    const res = await fetch('/api/gemini/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab, simulationSummary: summary }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.text && typeof data.text === 'string' && data.text.trim().length > 10) {
      return {
        text: data.text.trim(),
        isAi: true,
        generatedAt: now,
      };
    }
    throw new Error('Empty text from server');
  } catch (err) {
    // 폴백 해설 반환
    return {
      text: generateFallbackCommentary(tab, result),
      isAi: false,
      generatedAt: now,
    };
  }
}

/**
 * AI 시나리오 생성 (비관/기본/낙관 3개 환율 제안)
 */
export async function generateAiScenarios(
  userPrompt: string,
  baseRate: number
): Promise<ScenarioProposalResult> {
  try {
    const res = await fetch('/api/gemini/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt, currentBaseRate: baseRate }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data && Array.isArray(data.scenarios) && data.scenarios.length === 3) {
      return {
        scenarios: data.scenarios,
        isAi: true,
      };
    }
    throw new Error('Invalid scenarios structure');
  } catch (err) {
    // 룰 기반 폴백 제안
    const pRate = Math.round(baseRate - 40);
    const bRate = baseRate;
    const oRate = Math.round(baseRate + 50);

    return {
      scenarios: [
        {
          type: 'pessimistic',
          label: '비관 시나리오',
          rate: pRate,
          rationale: `미국 조기 금리인하 및 원화 강세 전환으로 수출 마진 압박 심화 (${pRate}원)`,
        },
        {
          type: 'base',
          label: '기본 시나리오',
          rate: bRate,
          rationale: `글로벌 거시 불확실성 지속에 따른 현 박스권 레벨 횡보 (${bRate}원)`,
        },
        {
          type: 'optimistic',
          label: '낙관 시나리오',
          rate: oRate,
          rationale: `고금리 장기화 및 강달러 지속으로 수출 원화 환산 마진 극대화 (${oRate}원)`,
        },
      ],
      isAi: false,
    };
  }
}

/**
 * 하단 질의응답 (Q&A)
 */
export async function askFxAdvisor(
  question: string,
  result: FxSimulationResult
): Promise<QaResponseResult> {
  const summary = buildSimulationSummary(result);

  try {
    const res = await fetch('/api/gemini/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, simulationSummary: summary }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.text && typeof data.text === 'string') {
      return {
        answer: data.text.trim(),
        isAi: true,
      };
    }
    throw new Error('Empty QA response');
  } catch (err) {
    // 계산 결과 JSON 기반의 정밀 폴백 응답
    const { exchangeRates, companyOfficialMetrics, extendedCorporateMetrics, accountingProfitLoss, economicImpactAndMismatch } = summary;
    
    let answer = `현재 시뮬레이션 기준환율은 ${exchangeRates.baseRate}원, 시나리오 환율은 ${exchangeRates.scenarioRate}원(ΔFX ${exchangeRates.deltaFx >= 0 ? '+' : ''}${exchangeRates.deltaFx}원)입니다.
장부 확정 Net Exposure는 ${companyOfficialMetrics.netExposureUsd}백만 USD이며, 당기 회계손익 변화는 ${accountingProfitLoss.totalAccountingPnlDeltaKrw}억원입니다.
반면 영업·구매 4분기 예정거래를 감안한 확장 Net Exposure는 ${extendedCorporateMetrics.extendedNetExposureUsd}백만 USD로, 실제 경제적 영향은 ${economicImpactAndMismatch.economicImpactKrw}억원에 달해 ${economicImpactAndMismatch.accountingMismatchKrw}억원의 회계 불일치가 발생합니다.
따라서 장부상 파생상품 손실에 흔들리지 마시고 전사 자연헤지 현금흐름을 바탕으로 의사결정을 내리시는 것을 권고합니다.`;

    if (question.includes('헤지') || question.includes('추가')) {
      answer = `현재 회사의 공식 장부 Hedge 비율은 ${companyOfficialMetrics.hedgeRatioPercent}%로 확정 노출에 대해서는 이미 ${companyOfficialMetrics.hedgeRatioPercent >= 90 ? '충분히 높은' : '적정한'} 헤지가 완료되어 있습니다.
다만 4분기 영업 예정 순유입(${extendedCorporateMetrics.extendedNetExposureUsd}백만 USD)을 고려할 때, 환율 하락 위험에 대한 추가 선물환 매도 헤지는 목표 마진율 방어 수준에 맞춰 분할 실행하시는 것이 안전합니다.`;
    }

    return {
      answer,
      isAi: false,
    };
  }
}
