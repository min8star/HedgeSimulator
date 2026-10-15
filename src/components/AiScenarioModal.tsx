import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingDown, TrendingUp, Minus, X, Loader2 } from 'lucide-react';
import { generateAiScenarios, ScenarioProposal } from '../geminiService';

interface AiScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseRate: number;
  onApplyRate: (rate: number) => void;
}

export const AiScenarioModal: React.FC<AiScenarioModalProps> = ({
  isOpen,
  onClose,
  baseRate,
  onApplyRate,
}) => {
  const [prompt, setPrompt] = useState<string>('연준 금리 동결, 엔화 약세 지속');
  const [loading, setLoading] = useState<boolean>(false);
  const [proposals, setProposals] = useState<ScenarioProposal[] | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await generateAiScenarios(prompt, baseRate);
      setProposals(res.scenarios);
      setIsAiGenerated(res.isAi);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    '연준 금리 동결, 엔화 약세 지속',
    '미국 기준금리 50bp 빅컷, 달러화 급락세',
    '중동 분쟁 격화, 유가 급등 및 안전자산 달러 쏠림',
    '글로벌 무역분쟁 재점화, 원화 변동성 확대',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-semibold text-base">AI 거시 환율 시나리오 생성기</h3>
              <p className="text-xs text-slate-300">
                시장 이슈를 입력하면 비관/기본/낙관 3대 환율을 자동 도출합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              거시경제 / 외환시장 주요 변수 입력
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 연준 금리 동결, 엔화 약세 지속"
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>생성</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-slate-500 font-medium">추천 예시:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {proposals && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                <span>기준환율: <strong className="text-slate-800">{baseRate.toLocaleString()}원</strong> 기준 제안</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-medium">
                  {isAiGenerated ? 'Gemini 생성 완료' : '규칙 엔진 생성'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {proposals.map((sc, idx) => {
                  const delta = sc.rate - baseRate;
                  const deltaFormatted = delta > 0 ? `+${delta}원` : `${delta}원`;
                  const isPessimistic = sc.type === 'pessimistic';
                  const isOptimistic = sc.type === 'optimistic';

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isPessimistic
                          ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                          : isOptimistic
                          ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
                          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              isPessimistic
                                ? 'bg-amber-100 text-amber-800'
                                : isOptimistic
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {sc.label}
                          </span>
                          <span className="text-base font-bold text-slate-900">
                            {sc.rate.toLocaleString()}원
                          </span>
                          <span
                            className={`text-xs font-medium flex items-center gap-0.5 ${
                              delta > 0
                                ? 'text-red-600'
                                : delta < 0
                                ? 'text-blue-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {delta > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : delta < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            {deltaFormatted}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{sc.rationale}</p>
                      </div>

                      <button
                        onClick={() => {
                          onApplyRate(sc.rate);
                          onClose();
                        }}
                        className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>적용</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
