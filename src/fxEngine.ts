/**
 * LX MMA 환율 변동 영향 시뮬레이션 계산 엔진
 *
 * [원칙]
 * 1. 순수 함수로만 작성 (부작용 없음)
 * 2. 모든 수치 계산은 본 파일에서만 완결 (AI는 계산하지 않음)
 * 3. 단위: 외화=USD 백만, 원화=억원 (USD 백만 × 환율(원) ÷ 100 = 억원), 환율=원
 */

export interface TreasuryBalances {
  foreignDeposits: number; // 외화예금 (USD 백만)
  ar: number;              // 외화매출채권 (USD 백만)
  ap: number;              // 외화매입채무 (USD 백만)
  billsDiscounted: number; // 채권 네고 (USD 백만)
}

export type ForwardContractType = 'sell' | 'buy'; // 매도 또는 매입

export interface ForwardContract {
  id: string;
  name: string;
  type: ForwardContractType;
  amount: number;          // 금액 (USD 백만)
  contractRate: number;    // 계약환율 (원)
  maturity: string;        // 만기 표시 (예: "10월말")
  isMaturedInPeriod: boolean; // true: 분석 기간 내 만기(실현), false: 분석 기간 말 미도래(미실현)
}

export interface PlannedExport {
  id: string;
  month: string;           // 예: "10월"
  usdAmount: number;       // USD 백만
  krwCost: number;         // 원화원가 (억원)
}

export interface PlannedImport {
  id: string;
  month: string;           // 예: "10월"
  usdAmount: number;       // USD 백만
}

export interface FxSimulationInput {
  baseRate: number;        // 기준환율 (원, 기본 1,400)
  scenarioRate: number;    // 시나리오환율 (원, 기본 1,400)
  treasury: TreasuryBalances;
  forwardContracts: ForwardContract[];
  plannedExports: PlannedExport[];
  plannedImports: PlannedImport[];
}

export interface ForwardContractResult extends ForwardContract {
  // 시나리오 환율 하에서의 총 손익 (억원)
  scenarioProfitKrw: number;
  // 기준 환율 하에서의 총 손익 (억원)
  baseProfitKrw: number;
  // 기준환율 대비 손익 변화 (억원)
  deltaProfitKrw: number;
  // 회계 계정명 (통화선도거래손익(실현) vs 통화선도평가손익(미실현))
  accountingCategory: '통화선도거래손익(실현)' | '통화선도평가손익(미실현)';
}

export interface ExportMonthResult extends PlannedExport {
  revenueKrw: number;       // 원화매출 (억원)
  marginKrw: number;        // 원화마진 (억원)
  marginRate: number;       // 마진율 (%)
  bepRate: number;          // 손익분기 환율 (원)
  deltaMarginKrw: number;   // 기준 대비 마진 증감 (억원)
}

export interface ImportMonthResult extends PlannedImport {
  settlementKrw: number;    // 원화 결제액 (억원)
  deltaSettlementKrw: number; // 기준 대비 증감 (억원)
}

export interface FxOfficialMetrics {
  longUsd: number;          // AR + 외화예금 + 선물환 매입
  shortUsd: number;         // AP + 채권네고 + 선물환 매도
  hedgeRatio: number;       // (Short ÷ Long) * 100 (%)
  netExposureUsd: number;   // Long - Short (USD 백만)
  forwardBuyTotalUsd: number;
  forwardSellTotalUsd: number;
}

export interface FxExtendedMetrics {
  extendedLongUsd: number;  // Long + 영업예정 수출
  extendedShortUsd: number; // Short + 구매예정 수입
  extendedHedgeRatio: number; // (확장 Short ÷ 확장 Long) * 100 (%)
  extendedNetExposureUsd: number; // 확장 Long - 확장 Short (USD 백만)
  plannedExportsTotalUsd: number;
  plannedImportsTotalUsd: number;
}

export interface FxAccountingPnl {
  fxTranslationDeltaKrw: number;   // 환산손익 변화 (억원)
  forwardTradingGainKrw: number;   // 통화선도거래손익 (실현분 기준대비 변화, 억원)
  forwardValuationGainKrw: number; // 통화선도평가손익 (미실현분 기준대비 변화, 억원)
  forwardDeltaTotalKrw: number;    // 선물환 손익의 기준 대비 총 변화 (억원)
  totalAccountingPnlDeltaKrw: number; // 당기 회계손익 변화 (억원)
  reconciliationCheckPassed: boolean; // Net Exposure * ΔFX 와 일치 여부
}

export interface FxEconomicMetrics {
  economicImpactKrw: number;       // 확장 Net Exposure × ΔFX (억원)
  accountingMismatchKrw: number;   // 경제적 영향 - 당기 회계손익 변화 (억원)
  salesDeltaMarginTotalKrw: number; // 영업 마진 변동 합계 (억원)
  procurementDeltaCostTotalKrw: number; // 구매 결제액 변동 합계 (억원)
}

export interface SensitivityRow {
  rateDiff: number;        // -200 ~ +200
  scenarioRate: number;
  accountingPnlDeltaKrw: number;
  salesDeltaMarginKrw: number;
  procurementDeltaCostKrw: number;
  economicImpactKrw: number;
  accountingMismatchKrw: number;
}

export interface FxSimulationResult {
  input: FxSimulationInput;
  deltaFx: number;                 // 시나리오환율 - 기준환율 (원)
  officialMetrics: FxOfficialMetrics;
  extendedMetrics: FxExtendedMetrics;
  accountingPnl: FxAccountingPnl;
  economicMetrics: FxEconomicMetrics;
  forwardResults: ForwardContractResult[];
  exportResults: ExportMonthResult[];
  importResults: ImportMonthResult[];
  sensitivityTable: SensitivityRow[];
}

/**
 * 기본 샘플 데이터 (초기값)
 */
export const DEFAULT_TREASURY: TreasuryBalances = {
  foreignDeposits: 30, // 외화예금 30
  ar: 120,             // AR(외화매출채권) 120
  ap: 85,              // AP(외화매입채무) 85
  billsDiscounted: 20, // 채권 네고 20
};

export const DEFAULT_FORWARD_CONTRACTS: ForwardContract[] = [
  {
    id: 'fwd-a',
    name: '계약A',
    type: 'sell',
    amount: 15,
    contractRate: 1380,
    maturity: '10월말',
    isMaturedInPeriod: true, // 분석 기간 내 만기
  },
  {
    id: 'fwd-b',
    name: '계약B',
    type: 'sell',
    amount: 25,
    contractRate: 1388,
    maturity: '12월말',
    isMaturedInPeriod: false, // 분석 기간 말 미도래
  },
];

export const DEFAULT_PLANNED_EXPORTS: PlannedExport[] = [
  { id: 'exp-10', month: '10월', usdAmount: 60, krwCost: 780 },
  { id: 'exp-11', month: '11월', usdAmount: 55, krwCost: 720 },
  { id: 'exp-12', month: '12월', usdAmount: 65, krwCost: 840 },
];

export const DEFAULT_PLANNED_IMPORTS: PlannedImport[] = [
  { id: 'imp-10', month: '10월', usdAmount: 45 },
  { id: 'imp-11', month: '11월', usdAmount: 42 },
  { id: 'imp-12', month: '12월', usdAmount: 48 },
];

export const DEFAULT_FX_INPUT: FxSimulationInput = {
  baseRate: 1400,
  scenarioRate: 1400,
  treasury: DEFAULT_TREASURY,
  forwardContracts: DEFAULT_FORWARD_CONTRACTS,
  plannedExports: DEFAULT_PLANNED_EXPORTS,
  plannedImports: DEFAULT_PLANNED_IMPORTS,
};

/**
 * 숫자 반올림 헬퍼 (소수점 지정 자리수)
 */
export function round(value: number, decimals: number = 1): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * USD 백만 × 환율(원) ÷ 100 = 억원 변환
 */
export function usdMillionToKrwHundredMillion(usdMillion: number, rate: number): number {
  return (usdMillion * rate) / 100;
}

/**
 * 전체 환율 변동 영향 계산 순수 함수
 */
export function calculateFxImpact(input: FxSimulationInput): FxSimulationResult {
  const { baseRate, scenarioRate, treasury, forwardContracts, plannedExports, plannedImports } = input;
  const deltaFx = scenarioRate - baseRate;

  // 1. 선물환 매도/매입 합계
  let forwardSellTotalUsd = 0;
  let forwardBuyTotalUsd = 0;
  forwardContracts.forEach((c) => {
    if (c.type === 'sell') {
      forwardSellTotalUsd += c.amount;
    } else {
      forwardBuyTotalUsd += c.amount;
    }
  });

  // (1) 회사 공식 지표 - 장부 확정 노출 기준
  const longUsd = treasury.ar + treasury.foreignDeposits + forwardBuyTotalUsd;
  const shortUsd = treasury.ap + treasury.billsDiscounted + forwardSellTotalUsd;
  const hedgeRatio = longUsd > 0 ? (shortUsd / longUsd) * 100 : 0;
  const netExposureUsd = longUsd - shortUsd;

  // (2) 선물환 계약별 손익 계산
  // 매도 계약: 금액 × (계약환율 - 시나리오환율) ÷ 100
  // 매입 계약: 금액 × (시나리오환율 - 계약환율) ÷ 100
  let forwardTradingGainKrw = 0;   // 실현 거래손익 증감
  let forwardValuationGainKrw = 0; // 미실현 평가손익 증감
  let forwardDeltaTotalKrw = 0;    // 선물환 전체 손익 변화 합계

  const forwardResults: ForwardContractResult[] = forwardContracts.map((c) => {
    const isSell = c.type === 'sell';
    
    // 시나리오 환율 시 총 손익 (억원)
    const scenarioProfitKrw = isSell
      ? (c.amount * (c.contractRate - scenarioRate)) / 100
      : (c.amount * (scenarioRate - c.contractRate)) / 100;

    // 기준 환율 시 총 손익 (억원)
    const baseProfitKrw = isSell
      ? (c.amount * (c.contractRate - baseRate)) / 100
      : (c.amount * (baseRate - c.contractRate)) / 100;

    // 기준환율 대비 손익 변화 (억원)
    const deltaProfitKrw = scenarioProfitKrw - baseProfitKrw;

    const accountingCategory = c.isMaturedInPeriod
      ? '통화선도거래손익(실현)'
      : '통화선도평가손익(미실현)';

    if (c.isMaturedInPeriod) {
      forwardTradingGainKrw += deltaProfitKrw;
    } else {
      forwardValuationGainKrw += deltaProfitKrw;
    }
    forwardDeltaTotalKrw += deltaProfitKrw;

    return {
      ...c,
      scenarioProfitKrw: round(scenarioProfitKrw, 1),
      baseProfitKrw: round(baseProfitKrw, 1),
      deltaProfitKrw: round(deltaProfitKrw, 1),
      accountingCategory,
    };
  });

  // (3) 재무 회계손익 변화
  // 환산손익 변화 = (AR + 외화예금 − AP − 채권 네고) × ΔFX ÷ 100
  const translationExposureUsd = treasury.ar + treasury.foreignDeposits - treasury.ap - treasury.billsDiscounted;
  const fxTranslationDeltaKrw = (translationExposureUsd * deltaFx) / 100;

  // 당기 회계손익 변화 = 환산손익 변화 + 선물환 손익의 기준 대비 변화
  const totalAccountingPnlDeltaKrw = fxTranslationDeltaKrw + forwardDeltaTotalKrw;

  // 검증: Net Exposure × ΔFX ÷ 100
  const expectedPnlCheck = (netExposureUsd * deltaFx) / 100;
  const reconciliationCheckPassed = Math.abs(totalAccountingPnlDeltaKrw - expectedPnlCheck) < 0.001;

  // (4) 영업 분석 (월별 및 합계)
  let plannedExportsTotalUsd = 0;
  let salesDeltaMarginTotalKrw = 0;

  const exportResults: ExportMonthResult[] = plannedExports.map((exp) => {
    plannedExportsTotalUsd += exp.usdAmount;
    const revenueKrw = (exp.usdAmount * scenarioRate) / 100;
    const baseRevenueKrw = (exp.usdAmount * baseRate) / 100;
    const marginKrw = revenueKrw - exp.krwCost;
    const marginRate = revenueKrw > 0 ? (marginKrw / revenueKrw) * 100 : 0;
    // 손익분기 환율: 원화원가 ÷ USD매출 × 100
    const bepRate = exp.usdAmount > 0 ? (exp.krwCost * 100) / exp.usdAmount : 0;
    const deltaMarginKrw = revenueKrw - baseRevenueKrw; // (exp.usdAmount * deltaFx) / 100
    salesDeltaMarginTotalKrw += deltaMarginKrw;

    return {
      ...exp,
      revenueKrw: round(revenueKrw, 1),
      marginKrw: round(marginKrw, 1),
      marginRate: round(marginRate, 1),
      bepRate: round(bepRate, 1),
      deltaMarginKrw: round(deltaMarginKrw, 1),
    };
  });

  // (5) 구매 분석 (월별 및 합계)
  let plannedImportsTotalUsd = 0;
  let procurementDeltaCostTotalKrw = 0;

  const importResults: ImportMonthResult[] = plannedImports.map((imp) => {
    plannedImportsTotalUsd += imp.usdAmount;
    const settlementKrw = (imp.usdAmount * scenarioRate) / 100;
    const deltaSettlementKrw = (imp.usdAmount * deltaFx) / 100;
    procurementDeltaCostTotalKrw += deltaSettlementKrw;

    return {
      ...imp,
      settlementKrw: round(settlementKrw, 1),
      deltaSettlementKrw: round(deltaSettlementKrw, 1),
    };
  });

  // (6) 예정거래 포함 지표 - 전사 관점 (Extended Corporate Indicators)
  const extendedLongUsd = longUsd + plannedExportsTotalUsd;
  const extendedShortUsd = shortUsd + plannedImportsTotalUsd;
  const extendedHedgeRatio = extendedLongUsd > 0 ? (extendedShortUsd / extendedLongUsd) * 100 : 0;
  const extendedNetExposureUsd = extendedLongUsd - extendedShortUsd;

  // 경제적 영향 = 확장 Net Exposure × ΔFX ÷ 100 (억원)
  const economicImpactKrw = (extendedNetExposureUsd * deltaFx) / 100;

  // 회계 불일치 = 경제적 영향 − 당기 회계손익 변화
  const accountingMismatchKrw = economicImpactKrw - totalAccountingPnlDeltaKrw;

  // (7) 민감도 분석 표 (-200 ~ +200, 50원 단위)
  const sensitivityDeltas = [-200, -150, -100, -50, 0, 50, 100, 150, 200];
  const sensitivityTable: SensitivityRow[] = sensitivityDeltas.map((d) => {
    const sRate = baseRate + d;
    const sDelta = d;
    const sAccounting = (netExposureUsd * sDelta) / 100;
    const sSalesDelta = (plannedExportsTotalUsd * sDelta) / 100;
    const sProcDelta = (plannedImportsTotalUsd * sDelta) / 100;
    const sEconomic = (extendedNetExposureUsd * sDelta) / 100;
    const sMismatch = sEconomic - sAccounting;

    return {
      rateDiff: sDelta,
      scenarioRate: sRate,
      accountingPnlDeltaKrw: round(sAccounting, 1),
      salesDeltaMarginKrw: round(sSalesDelta, 1),
      procurementDeltaCostKrw: round(sProcDelta, 1),
      economicImpactKrw: round(sEconomic, 1),
      accountingMismatchKrw: round(sMismatch, 1),
    };
  });

  return {
    input,
    deltaFx: round(deltaFx, 1),
    officialMetrics: {
      longUsd: round(longUsd, 1),
      shortUsd: round(shortUsd, 1),
      hedgeRatio: round(hedgeRatio, 1),
      netExposureUsd: round(netExposureUsd, 1),
      forwardBuyTotalUsd: round(forwardBuyTotalUsd, 1),
      forwardSellTotalUsd: round(forwardSellTotalUsd, 1),
    },
    extendedMetrics: {
      extendedLongUsd: round(extendedLongUsd, 1),
      extendedShortUsd: round(extendedShortUsd, 1),
      extendedHedgeRatio: round(extendedHedgeRatio, 1),
      extendedNetExposureUsd: round(extendedNetExposureUsd, 1),
      plannedExportsTotalUsd: round(plannedExportsTotalUsd, 1),
      plannedImportsTotalUsd: round(plannedImportsTotalUsd, 1),
    },
    accountingPnl: {
      fxTranslationDeltaKrw: round(fxTranslationDeltaKrw, 1),
      forwardTradingGainKrw: round(forwardTradingGainKrw, 1),
      forwardValuationGainKrw: round(forwardValuationGainKrw, 1),
      forwardDeltaTotalKrw: round(forwardDeltaTotalKrw, 1),
      totalAccountingPnlDeltaKrw: round(totalAccountingPnlDeltaKrw, 1),
      reconciliationCheckPassed,
    },
    economicMetrics: {
      economicImpactKrw: round(economicImpactKrw, 1),
      accountingMismatchKrw: round(accountingMismatchKrw, 1),
      salesDeltaMarginTotalKrw: round(salesDeltaMarginTotalKrw, 1),
      procurementDeltaCostTotalKrw: round(procurementDeltaCostTotalKrw, 1),
    },
    forwardResults,
    exportResults,
    importResults,
    sensitivityTable,
  };
}
