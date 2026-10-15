import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { FxSimulationResult } from '../fxEngine';
import { askFxAdvisor, QaResponseResult } from '../geminiService';

interface QaSectionProps {
  result: FxSimulationResult;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isAi?: boolean;
  time: string;
}

export const QaSection: React.FC<QaSectionProps> = ({ result }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `안녕하세요. LX MMA 환율 리스크 관리 AI 자문역입니다. 현재 시나리오 환율(${result.input.scenarioRate.toLocaleString()}원, ΔFX ${result.deltaFx >= 0 ? '+' : ''}${result.deltaFx}원)의 엔진 계산 결과 JSON을 기반으로 재무, 영업, 구매 영향 및 전사 자연헤지 방안에 대해 질문해 주시면 팩트 기반으로 답변해 드립니다.`,
      isAi: false,
      time: '안내',
    },
  ]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    `환율이 ${result.input.scenarioRate.toLocaleString()}원으로 가면 전사 이익에 미치는 영향은?`,
    '현재 포지션에서 선물환 추가 헤지가 필요한 상황인가요?',
    '회계 불일치와 자연헤지 효과를 경영진에게 어떻게 보고해야 하나요?',
    '영업본부의 4분기 손익분기 환율(BEP)과 최저 단가 가이드는?',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || question).trim();
    if (!q || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await askFxAdvisor(q, result);
      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        isAi: res.isAi,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `대화가 초기화되었습니다. 현재 시나리오 환율(${result.input.scenarioRate.toLocaleString()}원)을 바탕으로 질문해 주세요.`,
        isAi: false,
        time: '안내',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              FX 전략 AI 질의응답 (Q&A)
            </h3>
            <p className="text-xs text-slate-500">
              fxEngine의 확정 계산 JSON을 근거로 재무·영업·구매 연계 답변 제공
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          title="대화 내역 초기화"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">초기화</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 block">
          빠른 질문 추천 (클릭 시 즉시 질의):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qq)}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors text-left disabled:opacity-50 cursor-pointer"
            >
              {qq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 max-h-80 overflow-y-auto p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs shadow-2xs ${
                  isUser
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-100 text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-700">FX AI 자문역</span>
                    <span>·</span>
                    <span>{m.isAi ? 'Gemini 3.8 Flash' : '엔진 확정 분석'}</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    isUser ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>엔진 결과 JSON을 분석하여 답변을 구성하고 있습니다...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예: 선물환 손익과 실제 수출 이익의 회계적 차이는 무엇인가요?"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>질문</span>
        </button>
      </div>
    </div>
  );
};
