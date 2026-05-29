/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { MatchState, Difficulty, MatchHistoryItem, PedagogicalFeedback } from "../types.ts";
import { BookOpen, Award, BarChart3, TrendingUp, Sparkles, RefreshCcw, Landmark, Zap } from "lucide-react";
import { generateReport } from "../utils/aiClient";

interface PedagogicalDashboardProps {
  matchState: MatchState;
  onResetMatch: () => void;
  apiKey: string;
  aiModel: string;
}

export const PedagogicalDashboard: React.FC<PedagogicalDashboardProps> = ({
  matchState,
  onResetMatch,
  apiKey,
  aiModel
}) => {
  const { teamRed, teamBlue, quizTopic, mode, ropePosition } = matchState;

  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportData, setReportData] = useState<PedagogicalFeedback | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Compute stats
  const stats = useMemo(() => {
    const redCorrect = teamRed.history.filter(h => h.correct).length;
    const blueCorrect = teamBlue.history.filter(h => h.correct).length;
    const redTotal = teamRed.history.length || 1;
    const blueTotal = teamBlue.history.length || 1;

    // Bloom difficulties calculations
    const bloomLevels = [Difficulty.KNOWLEDGE, Difficulty.COMPREHENSION, Difficulty.APPLICATION, Difficulty.HIGH_APPLICATION];
    
    const countByLevelRed = bloomLevels.reduce((acc, lvl) => {
      const levelHistory = teamRed.history.filter(h => h.difficulty === lvl);
      const total = levelHistory.length;
      const correct = levelHistory.filter(h => h.correct).length;
      acc[lvl] = { total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
      return acc;
    }, {} as Record<Difficulty, { total: number; correct: number; pct: number }>);

    const countByLevelBlue = bloomLevels.reduce((acc, lvl) => {
      const levelHistory = teamBlue.history.filter(h => h.difficulty === lvl);
      const total = levelHistory.length;
      const correct = levelHistory.filter(h => h.correct).length;
      acc[lvl] = { total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
      return acc;
    }, {} as Record<Difficulty, { total: number; correct: number; pct: number }>);

    // Reflex calculations
    const redReflexes = teamRed.reflexHistory.filter(t => t > 0);
    const blueReflexes = teamBlue.reflexHistory.filter(t => t > 0);
    const avgReflexRed = redReflexes.length > 0 ? (redReflexes.reduce((a, b) => a + b, 0) / redReflexes.length).toFixed(1) : "0.0";
    const avgReflexBlue = blueReflexes.length > 0 ? (blueReflexes.reduce((a, b) => a + b, 0) / blueReflexes.length).toFixed(1) : "0.0";

    // Who won
    let winnerName = "Hòa Hơn Tài Sức";
    let winnerId: "RED" | "BLUE" | "TIE" = "TIE";
    
    if (ropePosition < 0) {
      winnerName = teamRed.name;
      winnerId = "RED";
    } else if (ropePosition > 0) {
      winnerName = teamBlue.name;
      winnerId = "BLUE";
    }

    return {
      redCorrect,
      blueCorrect,
      redPct: Math.round((redCorrect / redTotal) * 100),
      bluePct: Math.round((blueCorrect / blueTotal) * 100),
      countByLevelRed,
      countByLevelBlue,
      avgReflexRed,
      avgReflexBlue,
      winnerName,
      winnerId
    };
  }, [teamRed, teamBlue, ropePosition]);

  // Request detailed report from server via Gemini
  const generateGeminiAnalysis = async () => {
    setIsLoadingReport(true);
    setReportError(null);

    // Filter useful question logs to save prompt tokens
    const trimmedHistoryRed = teamRed.history.map(item => ({
      quest: item.questionText.substring(0, 50) + "...",
      correct: item.correct,
      reflex: item.responseTime,
      diff: item.difficulty
    }));

    try {
      if (!apiKey) {
        throw new Error("Chưa cấu hình API Key. Vui lòng bấm vào Settings trên Header.");
      }
      
      const matchData = {
          topic: quizTopic,
          mode,
          scoreRed: teamRed.score,
          scoreBlue: teamBlue.score,
          winner: stats.winnerId,
          history: trimmedHistoryRed,
          reflexHistoryRed: teamRed.reflexHistory,
          reflexHistoryBlue: teamBlue.reflexHistory
      };

      const data = await generateReport(apiKey, aiModel, matchData);
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      setReportError(`Lỗi liên kết AI: ${err.message || 'Không thể tính toán tư vấn'}. Báo cáo đã dừng do lỗi.`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Victory Celebration Box */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500" />
        <div className="inline-flex justify-center p-3 rounded-full bg-amber-500/10 mb-3 text-amber-400">
          <Award className="w-8 h-8 animate-bounce" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">KẾT QUẢ KÉO CO CHUNG CUỘC</span>
        <h2 className="text-2xl font-black text-white mt-1 uppercase">
          {stats.winnerId === "TIE" ? "HÒA NHAU KHÁCH QUAN" : `CHIẾN THẮNG CHUNG CUỘC: ${stats.winnerName}`}
        </h2>
        <p className="text-xs text-zinc-400 mt-2 max-w-xl mx-auto">
          Trận đấu giằng co hoàn thành xuất sắc lực lượng. Điểm số: {teamRed.name} ({teamRed.score}đ) — {teamBlue.name} ({teamBlue.score}đ).
        </p>
      </div>

      {/* Main Stats Bento-grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RED TEAM DETAILS PANEL */}
        <div className="bg-zinc-900 border border-rose-950/30 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-rose-950/30">
            <h3 className="text-xs uppercase font-mono font-black text-rose-400">
              📊 {teamRed.name} (Team Đỏ)
            </h3>
            <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">
              Chính Xác: {stats.redPct}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 block">TRẢ LỜI ĐÚNG</span>
              <span className="text-xl font-bold font-mono text-white">{stats.redCorrect} / 8</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 block">AVG PHẢN XẠ</span>
              <span className="text-xl font-bold font-mono text-white">{stats.avgReflexRed}s</span>
            </div>
          </div>

          {/* Bloom levels tracking */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase">Hiệu suất Bloom's Taxonomy:</span>
            <div className="space-y-1.5 text-xs">
              {[Difficulty.KNOWLEDGE, Difficulty.COMPREHENSION, Difficulty.APPLICATION, Difficulty.HIGH_APPLICATION].map((level) => {
                const data = stats.countByLevelRed[level];
                return (
                  <div key={level} className="flex items-center justify-between p-2 rounded bg-black/20 border border-zinc-900">
                    <span className="text-[10px] uppercase font-mono text-zinc-400">{level.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${data.pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-zinc-300">{data.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BLUE TEAM DETAILS PANEL */}
        <div className="bg-zinc-900 border border-blue-950/30 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-b-blue-950/30">
            <h3 className="text-xs uppercase font-mono font-black text-blue-400">
              📊 {teamBlue.name} (Team Xanh)
            </h3>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
              Chính Xác: {stats.bluePct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 block">TRẢ LỜI ĐÚNG</span>
              <span className="text-xl font-bold font-mono text-white">{stats.blueCorrect} / 8</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 block">AVG PHẢN XẠ</span>
              <span className="text-xl font-bold font-mono text-white">{stats.avgReflexBlue}s</span>
            </div>
          </div>

          {/* Bloom levels tracking */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 uppercase">Hiệu suất Bloom's Taxonomy:</span>
            <div className="space-y-1.5 text-xs">
              {[Difficulty.KNOWLEDGE, Difficulty.COMPREHENSION, Difficulty.APPLICATION, Difficulty.HIGH_APPLICATION].map((level) => {
                const data = stats.countByLevelBlue[level];
                return (
                  <div key={level} className="flex items-center justify-between p-2 rounded bg-black/20 border border-zinc-900">
                    <span className="text-[10px] uppercase font-mono text-zinc-400">{level.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${data.pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-zinc-300">{data.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* SVG GRAPH: MULTI-COORDINATE REFLEX PULSE SPEEDS */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
        <h3 className="text-xs uppercase font-mono font-black text-white tracking-widest flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> BIỂU ĐỒ BIÊN ĐỘ TỐC ĐỘ PHẢN XẠ KÉO CO (GIÂY)
        </h3>
        <p className="text-[10px] text-zinc-500 leading-snug">Thời gian trả lời ngắn hơn kích hoạt hệ số gia tốc lực kéo $F$ lớn hơn.</p>
        
        <div className="pt-2 bg-black/30 p-4 rounded-xl border border-zinc-850 overflow-hidden">
          {/* Beautiful Custom SVG Line Graph */}
          <svg viewBox="0 0 500 220" className="w-full h-auto text-zinc-400">
            {/* Grid Lines */}
            <line x1="30" y1="20" x2="480" y2="20" stroke="#1f2937" strokeDasharray="3,3" />
            <line x1="30" y1="60" x2="480" y2="60" stroke="#1f2937" strokeDasharray="3,3" />
            <line x1="30" y1="100" x2="480" y2="100" stroke="#1f2937" strokeDasharray="3,3" />
            <line x1="30" y1="140" x2="480" y2="140" stroke="#1f2937" strokeDasharray="3,3" />
            <line x1="30" y1="180" x2="480" y2="180" stroke="#27272a" />

            {/* Axes */}
            <line x1="30" y1="20" x2="30" y2="180" stroke="#27272a" />

            {/* Y axis text */}
            <text x="5" y="24" fontSize="8" fill="#52525b" fontFamily="monospace">20s</text>
            <text x="5" y="64" fontSize="8" fill="#52525b" fontFamily="monospace">15s</text>
            <text x="5" y="104" fontSize="8" fill="#52525b" fontFamily="monospace">10s</text>
            <text x="5" y="144" fontSize="8" fill="#52525b" fontFamily="monospace">5s</text>
            <text x="5" y="184" fontSize="8" fill="#52525b" fontFamily="monospace">0s</text>

            {/* X axis labels (Rounds) */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((round, idx) => {
              const xPos = 40 + (idx * (430 / 7));
              return (
                <text key={round} x={xPos - 5} y="195" fontSize="8" fill="#71717a" fontFamily="monospace">C{round}</text>
              );
            })}

            {/* Red Team Line Path */}
            {teamRed.reflexHistory.length > 0 && (() => {
              const coords = teamRed.reflexHistory.map((time, idx) => {
                const x = 40 + (idx * (430 / 7));
                // Clamp time to max 20 for scaling
                const clamped = Math.min(20, time);
                const y = 180 - (clamped * (160 / 20));
                return { x, y };
              });
              
              const dStr = coords.reduce((acc, c, idx) => {
                return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
              }, "");

              return (
                <>
                  <path d={dStr} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {coords.map((c, idx) => (
                    <circle key={idx} cx={c.x} cy={c.y} r="3.5" fill="#f43f5e" stroke="#18181b" strokeWidth="1" />
                  ))}
                </>
              );
            })()}

            {/* Blue Team Line Path */}
            {teamBlue.reflexHistory.length > 0 && (() => {
              const coords = teamBlue.reflexHistory.map((time, idx) => {
                const x = 40 + (idx * (430 / 7));
                // Clamp time
                const clamped = Math.min(20, time);
                const y = 180 - (clamped * (160 / 20));
                return { x, y };
              });
              
              const dStr = coords.reduce((acc, c, idx) => {
                return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
              }, "");

              return (
                <>
                  <path d={dStr} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {coords.map((c, idx) => (
                    <circle key={idx} cx={c.x} cy={c.y} r="3.5" fill="#3b82f6" stroke="#18181b" strokeWidth="1" />
                  ))}
                </>
              );
            })()}
          </svg>
          
          <div className="flex justify-center gap-6 mt-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 block" /> {teamRed.name}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 block" /> {teamBlue.name}</span>
          </div>
        </div>
      </div>

      {/* GEMINI EDTECH DIAGNOSTICS GENERATION CARD */}
      <div className="bg-zinc-900 border border-cyan-950/40 p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-xs uppercase font-mono font-black text-white">Chẩn Đoán Sư Phạm Chuyên Gia AI</h3>
              <p className="text-[10px] text-zinc-500 leading-none">Phân tích chuyên gia, đánh giá hành vi và đưa lời khuyên ôn tập.</p>
            </div>
          </div>
          
          {!reportData && (
            <button
              id="dash_gen_report_btn"
              type="button"
              disabled={isLoadingReport}
              onClick={generateGeminiAnalysis}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-black tracking-wider text-black bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 flex items-center gap-2 transition-all ${
                isLoadingReport ? "opacity-75 cursor-wait" : "cursor-pointer"
              }`}
            >
              {isLoadingReport ? "ĐANG BIÊN TẬP BÁO CÁO..." : "XUẤT BÁO CÁO SƯ PHẠM (GEMINI AI)"}
            </button>
          )}
        </div>

        {reportError && (
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
            {reportError}
          </div>
        )}

        {isLoadingReport && (
          <div className="py-12 text-center space-y-3 animate-pulse bg-black/20 rounded-xl border border-zinc-850">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
            <p className="text-xs font-mono text-zinc-400">Kiến trúc sư Trưởng Trí Tuệ đang giải mã dữ liệu kéo co...</p>
          </div>
        )}

        {reportData && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-black/40 p-4 rounded-xl border border-zinc-850">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold mb-1">
                  1. THÁP KIẾN THỨC BỊ KHÓ KHĂN
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {reportData.focusArea}
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-zinc-850">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold mb-1">
                  2. PHÂN TÍCH DIỄN BIẾN PHẢN XẠ & TÂM LÝ
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {reportData.reflexAnalysis}
                </p>
              </div>

            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-zinc-850">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold mb-1">
                3. HỒ SƠ CHUẨN ĐÚNG BLOOM
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {reportData.cognitiveProfile}
              </p>
            </div>

            <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20 space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase font-black tracking-wider block flex items-center gap-1">
                🏆 CHIẾN LƯỢC REMEDIAL CHO VÒNG SAU
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {reportData.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Play again button */}
      <div className="text-center pt-3">
        <button
          id="dash_restart_btn"
          type="button"
          onClick={onResetMatch}
          className="px-8 py-3 bg-zinc-800 text-white rounded-xl text-xs font-mono font-black tracking-widest hover:bg-zinc-700 active:scale-[0.98] transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4 text-white" /> QUAY LẠI THIẾT LẬP TRẬN ĐẤU MỚI
        </button>
      </div>

    </div>
  );
};
