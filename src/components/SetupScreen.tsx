/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GameTheme, GameMode, Difficulty } from "../types.ts";
import { PRELOADED_QUIZZES, QuizPackage } from "../preloadedQuizzes.ts";
import { Play, Sparkles, BrainCircuit, Globe, Layers, Settings, Swords } from "lucide-react";
import { generateQuiz } from "../utils/aiClient";

interface SetupScreenProps {
  onStartMatch: (config: {
    selectedQuiz: QuizPackage;
    theme: GameTheme;
    mode: GameMode;
    isAiAdaptive: boolean;
    teamRedName: string;
    teamBlueName: string;
    isCustomTopic: boolean;
    customTopic: string;
  }) => void;
  isGeneratingQuiz: boolean;
  setGeneratingQuiz: (val: boolean) => void;
  apiKey: string;
  aiModel: string;
  onOpenSettings: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartMatch,
  isGeneratingQuiz,
  setGeneratingQuiz,
  apiKey,
  aiModel,
  onOpenSettings
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>("vietnam_history");
  const [useCustomTopic, setUseCustomTopic] = useState<boolean>(false);
  const [customTopicText, setCustomTopicText] = useState<string>("");
  
  const [theme, setTheme] = useState<GameTheme>(GameTheme.HISTORIC);
  const [mode, setMode] = useState<GameMode>(GameMode.VS_AI);
  const [isAiAdaptive, setIsAiAdaptive] = useState<boolean>(true);
  
  const [teamRedName, setTeamRedName] = useState<string>("Bách Việt Hùng Quân");
  const [teamBlueName, setTeamBlueName] = useState<string>("Trọng Lực Đế Quốc");
  
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Helper when user selects a preset
  const selectedPreset = PRELOADED_QUIZZES.find(q => q.id === selectedPackId) || PRELOADED_QUIZZES[0];

  // Auto set theme when preset changes to fit the vibe
  const handlePresetSelect = (id: string) => {
    setSelectedPackId(id);
    if (id === "vietnam_history") {
      setTheme(GameTheme.HISTORIC);
      setTeamRedName("Bách Việt Hùng Quân");
      setTeamBlueName("Giặc Ngoại Sâm");
    } else if (id === "space_physics") {
      setTheme(GameTheme.CYBER);
      setTeamRedName("Cyber Phản Vật Chất");
      setTeamBlueName("Chân Trời Sự Kiện AI");
    } else if (id === "mythology_east_west") {
      setTheme(GameTheme.MYTHOLOGY);
      setTeamRedName("Sơn Tinh Thần Lực");
      setTeamBlueName("Thủy Tinh Cuồng Nộ");
    }
  };

  const handleModeChange = (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === GameMode.AI_VS_AI) {
      setTeamRedName("AI Đỏ Tri Thức");
      setTeamBlueName("AI Xanh Tác Chiến");
    } else if (selectedMode === GameMode.MULTIPLAYER) {
      setTeamRedName("Đội Đỏ (Liên Minh)");
      setTeamBlueName("Đội Xanh (Đối Kháng)");
    } else {
      setTeamRedName(selectedPackId === "vietnam_history" ? "Bách Việt Hùng Quân" : "Chiến Binh Loài Người");
      setTeamBlueName(selectedPackId === "vietnam_history" ? "AI Đội Bạn" : "Thực Thể Siêu Cấp AI");
    }
  };

  const startQuizSetup = async () => {
    if (useCustomTopic) {
      if (!customTopicText.trim()) {
        setGenerationError("Vui lòng nhập chủ đề học tập chi tiết để AI biên soạn.");
        return;
      }
      if (!apiKey) {
        setGenerationError("Bạn chưa nhập API Key. Vui lòng bấm vào Settings trên Header.");
        onOpenSettings();
        return;
      }
      
      setGeneratingQuiz(true);
      setGenerationError(null);
      
      try {
        const questions = await generateQuiz(apiKey, aiModel, customTopicText);
        
        if (questions && Array.isArray(questions) && questions.length > 0) {
          const mockQuizPackage: QuizPackage = {
            id: `custom_gen_${Date.now()}`,
            name: `Bộ Câu Hỏi: ${customTopicText.substring(0, 30)}...`,
            topic: customTopicText,
            description: `Được hỗ trợ biên soạn bởi Gemini AI dành riêng cho kỹ năng kéo co sư phạm.`,
            questions: questions
          };
          
          setGeneratingQuiz(false);
          
          onStartMatch({
            selectedQuiz: mockQuizPackage,
            theme,
            mode,
            isAiAdaptive,
            teamRedName,
            teamBlueName,
            isCustomTopic: true,
            customTopic: customTopicText
          });
        } else {
          throw new Error("Không trích xuất được câu hỏi từ AI. Định dạng sai.");
        }
      } catch (err: any) {
        console.error(err);
        setGenerationError(`⚠️ Lỗi sinh câu hỏi: ${err.message || 'Không có kết nối mạng'}`);
        setGeneratingQuiz(false); // Dừng lại ở trạng thái lỗi, không được tự động tiếp tục (đúng quy định AI_INSTRUCTIONS)
      }
    } else {
      // Just loaded standard preset
      onStartMatch({
        selectedQuiz: selectedPreset,
        theme,
        mode,
        isAiAdaptive,
        teamRedName,
        teamBlueName,
        isCustomTopic: false,
        customTopic: selectedPreset.topic
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header Box */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-amber-500 to-blue-500" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-mono mb-3">
          <BrainCircuit className="w-4 h-4" /> LEAD EDTECH ARCHITECT SIMULATOR v2.4
        </div>
        <h1 className="text-3xl md:text-4xl font-sans font-black tracking-tight text-white mb-2 uppercase">
          KÉO CO KỸ THUẬT SỐ
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          Chào mừng Đại sứ Sư phạm! Hệ sinh thái kéo co ứng dụng cơ học cân bằng lực để bộc lộ thế trận đối kháng tri thức khốc liệt nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Quiz Topic selection */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-md">
            <h2 className="text-md uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Layers className="text-amber-500 w-4 h-4" /> 1. CHỦ ĐỀ HỌC TẬP (BLOOM'S TAXONOMY)
            </h2>

            {/* Selector Option tabs */}
            <div className="flex border-b border-zinc-850 p-1 bg-black/40 rounded-lg">
              <button
                id="setup_preset_tab"
                type="button"
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${!useCustomTopic ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
                onClick={() => setUseCustomTopic(false)}
              >
                Mẫu Tải Sẵn Gốc (Định sẵn)
              </button>
              <button
                id="setup_custom_tab"
                type="button"
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${useCustomTopic ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
                onClick={() => setUseCustomTopic(true)}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Biên Soạn Bằng Trí Tuệ Nhân Tạo AI
              </button>
            </div>

            {/* Presets List */}
            {!useCustomTopic ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-zinc-400">Chọn 1 trong các bộ câu hỏi được phân nấc độ khó nghiêm ngặt từ dễ tới cực khó:</p>
                {PRELOADED_QUIZZES.map((quiz) => (
                  <button
                    id={`setup_pack_${quiz.id}`}
                    key={quiz.id}
                    type="button"
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 ${
                      selectedPackId === quiz.id
                        ? "border-amber-500 bg-amber-500/5 text-white"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700"
                    }`}
                    onClick={() => handlePresetSelect(quiz.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-zinc-100">{quiz.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                        {quiz.questions.length} câu phân bậc
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{quiz.description}</p>
                    <div className="text-[11px] text-amber-500/70 font-mono mt-1">Chủ đề: {quiz.topic}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="custom_topic_input" className="text-xs text-zinc-300 font-medium">Nhập Chủ Đề Hoặc Giáo Trình:</label>
                  <textarea
                    id="custom_topic_input"
                    rows={3}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-amber-400"
                    placeholder="Ví dụ: 'Sự điện phân hóa học lớp 11', 'Từ vựng tiếng Anh chủ đề du lịch A2', 'Các thành tựu Văn hóa phục hưng phương Tây'..."
                    value={customTopicText}
                    onChange={(e) => setCustomTopicText(e.target.value)}
                  />
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-400/80 leading-relaxed">
                  ☘️ <strong>Hành vi của AI:</strong> Hệ thống sử dụng mô hình <strong>Gemini 3.5</strong> để sinh chuẩn xác 8 câu hỏi kéo co cân bằng lực với 4 nấc Bloom (Nhận biết, Thông hiểu, Vận dụng, Vận dụng Cao). Nhờ vậy, trận đấu có nền tảng phân loại tư duy xuất sắc.
                </div>
              </div>
            )}
          </div>

          {/* Player profile config */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-md">
            <h2 className="text-md uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Swords className="text-rose-500 w-4 h-4" /> 2. ĐỊNH DANH BINH ĐOÀN ĐỐI ĐẦU
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="team_red_name" className="text-xs text-rose-400 font-mono font-semibold uppercase">Đội Hậu Vệ Đỏ (Bên Trái):</label>
                <input
                  id="team_red_name"
                  type="text"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  value={teamRedName}
                  onChange={(e) => setTeamRedName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="team_blue_name" className="text-xs text-blue-400 font-mono font-semibold uppercase">Đội Tấn Công Xanh (Bên Phải):</label>
                <input
                  id="team_blue_name"
                  type="text"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  value={teamBlueName}
                  onChange={(e) => setTeamBlueName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Game Engine Controls */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5 shadow-md">
            <h2 className="text-md uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Settings className="text-cyan-500 w-4 h-4" /> 3. THIẾT LẬP CƠ CHẾ VẬT LÝ & AI
            </h2>

            {/* Gameplay modes */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">Chế Độ Tác Chiến:</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="setup_mode_vs_ai"
                  type="button"
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    mode === GameMode.VS_AI ? "border-cyan-500 bg-cyan-500/5 text-white font-bold" : "border-zinc-800 text-zinc-400 hover:border-zinc-700 bg-zinc-950/20"
                  }`}
                  onClick={() => handleModeChange(GameMode.VS_AI)}
                >
                  <div>
                    <p className="font-semibold text-zinc-100">Người vs Máy (VS AI Opponent)</p>
                    <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Bạn đại diện Đội Đỏ, AI siêu thông minh tự giải Blue.</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-cyan-400 font-mono">Chính</span>
                </button>

                <button
                  id="setup_mode_multi"
                  type="button"
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    mode === GameMode.MULTIPLAYER ? "border-cyan-500 bg-cyan-500/5 text-white font-bold" : "border-zinc-800 text-zinc-400 hover:border-zinc-700 bg-zinc-950/20"
                  }`}
                  onClick={() => handleModeChange(GameMode.MULTIPLAYER)}
                >
                  <div>
                    <p className="font-semibold text-zinc-100">Đấu Nhóm Địa Phương (Local Turn Mode)</p>
                    <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Lớp học chia hai bên thay nhau bấm máy cực đông sầm uất.</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 font-mono">Co-op</span>
                </button>

                <button
                  id="setup_mode_ai_vs_ai"
                  type="button"
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    mode === GameMode.AI_VS_AI ? "border-cyan-500 bg-cyan-500/5 text-white font-bold" : "border-zinc-800 text-zinc-400 hover:border-zinc-700 bg-zinc-950/20"
                  }`}
                  onClick={() => handleModeChange(GameMode.AI_VS_AI)}
                >
                  <div>
                    <p className="font-semibold text-zinc-100">Kịch Bản Mô Phỏng AI vs AI (Full Simulation)</p>
                    <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Hai AI tự ngẫu nhiên kích hoạt, tung kỹ năng để giáo viên quan sát.</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-amber-500 font-mono">Quan sát</span>
                </button>
              </div>
            </div>

            {/* AI Adaptive study toggle */}
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-850 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs text-white uppercase font-mono font-bold flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" /> ALGORITHM AI ADAPTIVE
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">Cân bằng chiến tuyến duy trì trạng thái chảy hứng khởi (FLOW).</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="setup_adaptive_toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={isAiAdaptive}
                    onChange={(e) => setIsAiAdaptive(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-white"></div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                {isAiAdaptive 
                  ? "✅ ĐANG BẬT: Nếu bên nào thua sâu (>35% lệch dây), AI sẽ tự dồn câu hỏi nấc Nhận biết (KNOWLEDGE) cực dễ cho bên đó, và nấc thảm sầu (HIGH_APPLICATION) cực khó cho đội còn lại để giật dây kéo co kéo dài kịch tính."
                  : "❌ ĐANG TẮT: Câu hỏi bốc ngẫu nhiên tuần tự không quan tâm tới biến số lực căng dây của vạch kéo."
                }
              </p>
            </div>

            {/* Visual theme selection */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-semibold uppercase tracking-wider block">Bối Cảnh Phong Cảnh:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="setup_theme_historic"
                  type="button"
                  className={`py-2 text-xs rounded-lg border text-center font-medium transition-all ${
                    theme === GameTheme.HISTORIC
                      ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 bg-zinc-950/20"
                  }`}
                  onClick={() => setTheme(GameTheme.HISTORIC)}
                >
                  📜 Sử Việt
                </button>
                <button
                  id="setup_theme_cyber"
                  type="button"
                  className={`py-2 text-xs rounded-lg border text-center font-medium transition-all ${
                    theme === GameTheme.CYBER
                      ? "border-cyan-500 bg-cyan-500/10 text-white font-bold"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 bg-zinc-950/20"
                  }`}
                  onClick={() => setTheme(GameTheme.CYBER)}
                >
                  🛰️ Cyber
                </button>
                <button
                  id="setup_theme_mythology"
                  type="button"
                  className={`py-2 text-xs rounded-lg border text-center font-medium transition-all ${
                    theme === GameTheme.MYTHOLOGY
                      ? "border-indigo-500 bg-indigo-500/10 text-white font-bold"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300 bg-zinc-950/20"
                  }`}
                  onClick={() => setTheme(GameTheme.MYTHOLOGY)}
                >
                  🏛️ Linh Thần
                </button>
              </div>
            </div>

            {/* Prompt errors during generation */}
            {generationError && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 leading-snug animate-shake">
                {generationError}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              id="setup_start_btn"
              type="button"
              disabled={isGeneratingQuiz}
              onClick={startQuizSetup}
              className={`w-full py-3.5 rounded-xl text-xs font-mono font-black tracking-widest text-black flex items-center justify-center gap-2 transition-all ${
                isGeneratingQuiz 
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
              }`}
            >
              {isGeneratingQuiz ? (
                <>
                  <GrainLoader /> AI ĐANG BIÊN SOẠN BỘ ĐỀ THEO CHUẨN BLOOM...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 text-black" /> KÍCH HOẠT HỆ THỐNG KÉO CO BẮT ĐẦU!
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Tiny custom spinner loader to keep app clean without imports
const GrainLoader = () => (
  <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-900 rounded-full animate-spin"></div>
);
