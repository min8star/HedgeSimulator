import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  Save,
} from 'lucide-react';
import {
  FxSimulationInput,
  ForwardContract,
  PlannedExport,
  PlannedImport,
  DEFAULT_TREASURY,
  DEFAULT_FORWARD_CONTRACTS,
  DEFAULT_PLANNED_EXPORTS,
  DEFAULT_PLANNED_IMPORTS,
} from '../fxEngine';

interface DataEditorAccordionProps {
  input: FxSimulationInput;
  onInputChange: (newInput: FxSimulationInput) => void;
  activeTabSection?: 'all' | 'finance' | 'sales' | 'procurement';
}

export const DataEditorAccordion: React.FC<DataEditorAccordionProps> = ({
  input,
  onInputChange,
  activeTabSection = 'all',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateTreasuryField = (field: keyof typeof input.treasury, value: number) => {
    onInputChange({
      ...input,
      treasury: {
        ...input.treasury,
        [field]: value,
      },
    });
  };

  const handleAddForward = () => {
    const newContract: ForwardContract = {
      id: `fwd-${Date.now()}`,
      name: `계약${String.fromCharCode(65 + input.forwardContracts.length)}`,
      type: 'sell',
      amount: 10,
      contractRate: input.baseRate,
      maturity: '11월말',
      isMaturedInPeriod: false,
    };
    onInputChange({
      ...input,
      forwardContracts: [...input.forwardContracts, newContract],
    });
  };

  const handleUpdateForward = (id: string, updates: Partial<ForwardContract>) => {
    onInputChange({
      ...input,
      forwardContracts: input.forwardContracts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const handleDeleteForward = (id: string) => {
    onInputChange({
      ...input,
      forwardContracts: input.forwardContracts.filter((c) => c.id !== id),
    });
  };

  const handleUpdateExport = (id: string, field: 'usdAmount' | 'krwCost', value: number) => {
    onInputChange({
      ...input,
      plannedExports: input.plannedExports.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const handleUpdateImport = (id: string, value: number) => {
    onInputChange({
      ...input,
      plannedImports: input.plannedImports.map((i) =>
        i.id === id ? { ...i, usdAmount: value } : i
      ),
    });
  };

  const handleResetToDefault = () => {
    if (confirm('모든 입력 데이터를 공식 샘플 기본값으로 초기화하시겠습니까?')) {
      onInputChange({
        ...input,
        treasury: DEFAULT_TREASURY,
        forwardContracts: DEFAULT_FORWARD_CONTRACTS,
        plannedExports: DEFAULT_PLANNED_EXPORTS,
        plannedImports: DEFAULT_PLANNED_IMPORTS,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden mt-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-200/60"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-sm text-slate-800">
            시뮬레이션 입력 데이터 편집 (재무 잔액 · 선물환 · 영업 수출 · 구매 수입)
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
            {isOpen ? '접기' : '수정하려면 클릭 (기본 접힘)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResetToDefault();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 bg-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>기본 샘플 복원</span>
            </button>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6 bg-white animate-in fade-in duration-200">
          {/* Section 1: Treasury Balances */}
          {(activeTabSection === 'all' || activeTabSection === 'finance') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  1. 재무 확정 외화 잔액 (단위: USD 백만)
                </h4>
                <span className="text-xs text-slate-500">장부 확정 외화자산 및 부채</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    외화예금 (자산)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      value={input.treasury.foreignDeposits}
                      onChange={(e) => updateTreasuryField('foreignDeposits', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 font-bold text-sm text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">M$</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    AR 외화매출채권 (자산)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      value={input.treasury.ar}
                      onChange={(e) => updateTreasuryField('ar', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 font-bold text-sm text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">M$</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    AP 외화매입채무 (부채)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      value={input.treasury.ap}
                      onChange={(e) => updateTreasuryField('ap', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 font-bold text-sm text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">M$</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    채권 네고 (외화할인어음)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      value={input.treasury.billsDiscounted}
                      onChange={(e) => updateTreasuryField('billsDiscounted', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 font-bold text-sm text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">M$</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Forward Contracts */}
          {(activeTabSection === 'all' || activeTabSection === 'finance') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    2. 선물환 계약 관리 (행 추가/삭제 가능)
                  </h4>
                  <p className="text-xs text-slate-500">
                    분석 기간 내 만기는 거래손익(실현), 미도래는 평가손익(미실현)으로 인식
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddForward}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>계약 추가</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">계약명</th>
                      <th className="py-2 px-3">구분 (매도/매입)</th>
                      <th className="py-2 px-3">금액 (USD M)</th>
                      <th className="py-2 px-3">계약환율 (원)</th>
                      <th className="py-2 px-3">만기</th>
                      <th className="py-2 px-3">기간 내 만기 여부</th>
                      <th className="py-2 px-3 text-center">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {input.forwardContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => handleUpdateForward(c.id, { name: e.target.value })}
                            className="w-20 px-1.5 py-1 bg-white text-slate-900 border border-slate-300 rounded-md text-xs font-medium"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={c.type}
                            onChange={(e) =>
                              handleUpdateForward(c.id, { type: e.target.value as 'sell' | 'buy' })
                            }
                            className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                              c.type === 'sell'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            <option value="sell">매도 (Sell Forward)</option>
                            <option value="buy">매입 (Buy Forward)</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={c.amount}
                            onChange={(e) =>
                              handleUpdateForward(c.id, { amount: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20 px-1.5 py-1 bg-white text-slate-900 border border-slate-300 rounded-md text-xs font-semibold text-right"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={c.contractRate}
                            onChange={(e) =>
                              handleUpdateForward(c.id, { contractRate: parseFloat(e.target.value) || 0 })
                            }
                            className="w-24 px-1.5 py-1 bg-white text-slate-900 border border-slate-300 rounded-md text-xs font-semibold text-right"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={c.maturity}
                            onChange={(e) => handleUpdateForward(c.id, { maturity: e.target.value })}
                            className="w-20 px-1.5 py-1 bg-white text-slate-900 border border-slate-300 rounded-md text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.isMaturedInPeriod}
                              onChange={(e) =>
                                handleUpdateForward(c.id, { isMaturedInPeriod: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded text-blue-600"
                            />
                            <span className="text-[11px] text-slate-700">
                              {c.isMaturedInPeriod ? '만기 실현 (거래손익)' : '미도래 (평가손익)'}
                            </span>
                          </label>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteForward(c.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="계약 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Sales Planned Exports */}
          {(activeTabSection === 'all' || activeTabSection === 'sales') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  3. 영업본부 예정 수출 계획 (월별 USD 매출 및 원화원가)
                </h4>
                <span className="text-xs text-slate-500">손익분기 환율(BEP) = 원화원가 ÷ USD매출 × 100</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {input.plannedExports.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{exp.month} 예정 수출</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        BEP: {((exp.krwCost * 100) / (exp.usdAmount || 1)).toFixed(1)}원
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-0.5">
                          USD 수출 (백만)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={exp.usdAmount}
                          onChange={(e) =>
                            handleUpdateExport(exp.id, 'usdAmount', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white text-slate-900 px-2 py-1 rounded-md border border-slate-300 font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-0.5">
                          원화원가 (억원)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={exp.krwCost}
                          onChange={(e) =>
                            handleUpdateExport(exp.id, 'krwCost', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-white text-slate-900 px-2 py-1 rounded-md border border-slate-300 font-semibold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Procurement Planned Imports */}
          {(activeTabSection === 'all' || activeTabSection === 'procurement') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  4. 구매본부 예정 원자재 수입 계획 (월별 USD 수입액)
                </h4>
                <span className="text-xs text-slate-500">환율 변동 시 원화 결제액 변동 = USD수입 × △환율 ÷ 100</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {input.plannedImports.map((imp) => (
                  <div key={imp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {imp.month} 예정 수입 (USD 백만)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="any"
                        value={imp.usdAmount}
                        onChange={(e) => handleUpdateImport(imp.id, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 font-bold text-sm text-slate-900"
                      />
                      <span className="text-xs text-slate-500 font-medium">M$</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
