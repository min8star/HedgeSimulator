import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY_NOT_CONFIGURED' }));
          return;
        }

        // Parse JSON body
        let bodyText = '';
        req.on('data', (chunk) => {
          bodyText += chunk;
        });

        req.on('end', async () => {
          try {
            const body = bodyText ? JSON.parse(bodyText) : {};
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            if (req.url === '/api/gemini/commentary') {
              const { tab, simulationSummary } = body;
              const systemInstruction = `당신은 대한민국 대표 화학 소재 기업 LX MMA의 최고재무책임자(CFO) 산하 전사 FX 리스크 전략 자문역입니다.
[절대 규칙]
1. 당신은 어떤 수치도 직접 계산하지 마십시오. 모든 계산은 시스템이 이미 계산한 'simulationSummary' JSON에 들어 있습니다.
2. 반드시 주어진 JSON 수치(USD 백만, 억원, %)만을 그대로 인용하십시오.
3. 탭별로 지정된 전문적 어조로 3~4문장으로 상황을 요약하고, 마지막에 명확한 '실행 제안 1개'를 bullet(- [실행 제안]) 형태로 제공하십시오.
- 'corporate'(전사): 경영진 보고용. 회사 공식 장부 헤지 vs 영업/구매 예정거래 포함 확장 자연헤지 비교 및 '회계 불일치'의 원인과 경제적 실체 요약.
- 'finance'(재무): Hedge 비율·Net Exposure 관점, "선물환 손실이 당기손익에 먼저 반영되더라도 경제적으로는 미래 수출 환차익과 상쇄된다"는 회계 불일치 관점 필수 포함.
- 'sales'(영업): 원화 마진, 월별 손익분기 환율(BEP) 대비 시나리오 환율 마진 버퍼, 수출 단가 협상 하한선 가이드.
- 'procurement'(구매): 원화 결제액 증감 부담, 수입 결제 시점 및 조달 물량/선적 조정 방안.
한국어로 정중하고 격조 높은 비즈니스 어조로 작성하십시오.`;

              const prompt = `[분석 요청 탭]: ${tab}
[계산 엔진 결과 JSON]:
${JSON.stringify(simulationSummary, null, 2)}

위 JSON 데이터를 바탕으로 주어진 규칙에 맞춰 해설과 실행 제안을 작성하십시오.`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: 0.2,
                },
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ text: response.text }));
              return;
            }

            if (req.url === '/api/gemini/scenarios') {
              const { userPrompt, currentBaseRate } = body;
              const systemInstruction = `당신은 LX MMA 외환시장 수석 이코노미스트입니다.
사용자가 입력한 거시경제/환율 이슈(예: "연준 금리 동결, 엔화 약세 지속")를 분석하여
현재 기준환율(${currentBaseRate}원)을 기준으로 합리적인 [비관 / 기본 / 낙관] 3가지 시나리오 환율(원 단위, 정수)과 1줄 근거를 JSON으로 출력하십시오.
비관(수출 또는 기업 입장에서 불리한 급변동 또는 급락/급등), 기본(중립 전망), 낙관(우호적 방향).
반드시 아래 JSON 형식으로만 응답하십시오:
{
  "scenarios": [
    { "type": "pessimistic", "label": "비관 시나리오", "rate": 1350, "rationale": "한 줄 근거" },
    { "type": "base", "label": "기본 시나리오", "rate": 1400, "rationale": "한 줄 근거" },
    { "type": "optimistic", "label": "낙관 시나리오", "rate": 1450, "rationale": "한 줄 근거" }
  ]
}`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `기준환율: ${currentBaseRate}원, 사용자 시장 전망 질의: "${userPrompt}"`,
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  temperature: 0.3,
                },
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(response.text);
              return;
            }

            if (req.url === '/api/gemini/qa') {
              const { question, simulationSummary } = body;
              const systemInstruction = `당신은 LX MMA 환율 영향 시뮬레이터의 외환 전문 AI 컨설턴트입니다.
[절대 규칙]
1. 당신은 새로운 숫자를 계산하거나 임의로 지어내지 마십시오.
2. 아래에 제공된 fxEngine 계산 결과 JSON에 있는 숫자만을 정밀하게 인용하십시오.
3. 질문에 대해 한국어로 2~4문장으로 핵심을 짚고, 전사 자연헤지와 회계손익의 차이를 명확히 설명하십시오.`;

              const prompt = `[사용자 질문]: ${question}
[엔진 계산 결과 JSON]:
${JSON.stringify(simulationSummary, null, 2)}`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: 0.2,
                },
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ text: response.text }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (error: any) {
            console.error('Gemini API Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: error.message || 'Internal error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
