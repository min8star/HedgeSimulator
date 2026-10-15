import React from 'react';
import { AlertCircle, ShieldCheck, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-100/80 text-slate-600 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Mandatory Policy Disclaimer Box */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
            <span>회계 기준 및 데이터 처리 고지 (Accounting & Compliance Notice)</span>
          </div>
          <p className="text-slate-600 leading-relaxed pl-6">
            샘플 데이터 기반 데모입니다. 당사 선물환 회계처리 기준 적용:
            <br />
            <strong>
              월말 평가손익 = (계약환율 − 월말 매매기준율) × 외화금액, 현재가치 할인 미반영. 만기 결제·연장 시 차액은 거래손익으로 인식.
            </strong>
          </p>
        </div>

        {/* Corporate Branding & Engine Information */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-[11px] pt-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">LX MMA 전사 환율 변동 영향 시뮬레이터</span>
            <span>·</span>
            <span>버전 2.5 (Enterprise Edition)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>단위: 외화 USD 백만 / 원화 억원</span>
            <span>·</span>
            <span>계산: Pure fxEngine v1.0</span>
            <span>·</span>
            <span>AI 해설: Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
