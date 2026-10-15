import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { FxSimulationResult } from '../fxEngine';
import { getTabCommentary, TabCommentaryResult } from '../geminiService';

interface AiCommentaryCardProps {
  tab: 'corporate' | 'finance' | 'sales' | 'procurement';
  tabTitle: string;
  result: FxSimulationResult;
}

export const AiCommentaryCard: React.FC<AiCommentaryCardProps> = ({ tab, tabTitle, result }) => {
  const [commentary, setCommentary] = useState<TabCommentaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCommentary = async () => {
    setLoading(true);
    try {
      const res = await getTabCommentary(tab, result);
      setCommentary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentary();
  }, [tab, result.input.baseRate, result.input.scenarioRate]);

  // Format the commentary text to highlight the action proposal
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line, idx) => {
      if (line.includes('[실행 제안]') || line.startsWith('- [') || line.startsWith('실행 제안:')) {
        return (
          <div
            key={idx}
            className="mt-3.5 p-3.5 rounded-lg bg-blue-50/80 border border-blue-200/80 text-blue-950 font-medium text-sm flex items-start gap-2.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{line.replace(/^-\s*/, '')}</div>
          </div>
        );
      }
      return (
        <p key={idx} className="text-slate-700 text-sm leading-relaxed mb-2 last:mb-0">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-xs p-5 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500" />

      <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-sm">{tabTitle} AI 전략 해설</h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  commentary?.isAi
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {commentary?.isAi ? 'Gemini 3.8 Flash' : '규칙 기반 분석 엔진'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              fxEngine 확정 수치 기반 인용 분석 · 계산 변조 없음
            </p>
          </div>
        </div>

        <button
          onClick={fetchCommentary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          title="해설 새로고침"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">재분석</span>
        </button>
      </div>

      <div className="min-h-[90px]">
        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs">FX 데이터 및 리스크 구조 분석 중...</span>
          </div>
        ) : commentary ? (
          <div className="text-slate-800 space-y-1">
            {renderFormattedText(commentary.text)}
            <div className="pt-2 text-[11px] text-slate-400 text-right">
              생성 시각: {commentary.generatedAt}
            </div>
          </div>
        ) : (
          <div className="py-4 text-xs text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            분석 해설을 불러오지 못했습니다.
          </div>
        )}
      </div>
    </div>
  );
};
