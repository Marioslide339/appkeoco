/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Question, Difficulty, GameMode, GameTheme, MatchState, TeamState } from "../types.ts";
import { Shield, Flame, Zap, Hourglass, BrainCircuit, Play, ArrowRight, UserCheck, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ActiveBattleProps {
  matchState: MatchState;
  onUpdateState: (newState: MatchState) => void;
  onRoundResult: (
    redResult: { isCorrect: boolean, timeUsed: number, timeout: boolean, selectedOption: number },
    blueResult: { isCorrect: boolean, timeUsed: number, timeout: boolean, selectedOption: number },
    question: Question
  ) => void;
  onCompleteMatch: () => void;
}

export const ActiveBattle: React.FC<ActiveBattleProps> = ({
  matchState,
  onUpdateState,
  onRoundResult,
  onCompleteMatch
}) => {
  const {
    questions,
    currentQuestionIndex,
    teamRed,
    teamBlue,
    timer,
    mode,
    isAiAdaptive,
    ropePosition
  } = matchState;

  const maxTimer = 25;
  const [redSelection, setRedSelection] = useState<number | null>(null);
  const [blueSelection, setBlueSelection] = useState<number | null>(null);
  const [redTime, setRedTime] = useState<number>(0);
  const [blueTime, setBlueTime] = useState<number>(0);
  
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  const [aiThinkingRed, setAiThinkingRed] = useState<number>(0);
  const [aiThinkingBlue, setAiThinkingBlue] = useState<number>(0);

  const lockRef = useRef<boolean>(false);

  // Current Question
  const currentQuestion: Question = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        id: "empty",
        text: "Không có câu hỏi sẵn sàng.",
        options: ["A", "B", "C", "D"],
        correctIndex: 0,
        difficulty: Difficulty.KNOWLEDGE,
        explanation: "",
        points: 10
      };
    }

    if (isAiAdaptive && Math.abs(ropePosition) > 30) {
      const redIsLosing = ropePosition > 30;
      const blueIsLosing = ropePosition < -30;

      const easyQuestions = questions.filter(
        q => q.difficulty === Difficulty.KNOWLEDGE || q.difficulty === Difficulty.COMPREHENSION
      );
      const hardQuestions = questions.filter(
        q => q.difficulty === Difficulty.APPLICATION || q.difficulty === Difficulty.HIGH_APPLICATION
      );

      // If Red is losing, give Red an easy question (Wait, both teams answer the SAME question)
      // So if Red is losing, we make the question easy so Red can answer fast.
      if (redIsLosing && easyQuestions.length > 0) {
        return easyQuestions[currentQuestionIndex % easyQuestions.length];
      } else if (blueIsLosing && easyQuestions.length > 0) {
        return easyQuestions[currentQuestionIndex % easyQuestions.length];
      }
    }

    return questions[currentQuestionIndex % questions.length];
  }, [questions, currentQuestionIndex, isAiAdaptive, ropePosition]);

  // Bloom's taxonomy mapping
  const difficultyDisplay = useMemo(() => {
    switch (currentQuestion.difficulty) {
      case Difficulty.KNOWLEDGE: return { title: "Nhận Biết", color: "text-emerald-400 border-emerald-500/30" };
      case Difficulty.COMPREHENSION: return { title: "Thông Hiểu", color: "text-blue-400 border-blue-500/30" };
      case Difficulty.APPLICATION: return { title: "Vận Dụng", color: "text-amber-400 border-amber-500/30" };
      case Difficulty.HIGH_APPLICATION: return { title: "Vận Dụng Cao", color: "text-rose-400 border-rose-500/50" };
      default: return { title: "Kiến Thức", color: "text-zinc-400 border-zinc-700" };
    }
  }, [currentQuestion.difficulty]);

  // Global UI Timer
  useEffect(() => {
    if (showAnswerFeedback) return;

    const interval = setInterval(() => {
      onUpdateState({
        ...matchState,
        timer: Math.max(0, timer - 1)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, showAnswerFeedback]);

  // Handle local answer selection
  const handleAnswerSelection = (team: "RED" | "BLUE", optionIndex: number) => {
    if (showAnswerFeedback) return;
    
    const timeUsedSeconds = Math.min(25, (Date.now() - questionStartTime) / 1000);
    
    if (team === "RED" && redSelection === null) {
      setRedSelection(optionIndex);
      setRedTime(timeUsedSeconds);
    } else if (team === "BLUE" && blueSelection === null) {
      setBlueSelection(optionIndex);
      setBlueTime(timeUsedSeconds);
    }
  };

  // Keyboard Listener for simultaneous local play
  useEffect(() => {
    if (showAnswerFeedback) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (redSelection === null && (mode === GameMode.MULTIPLAYER || mode === GameMode.VS_AI)) {
        if (key === 'a') handleAnswerSelection("RED", 0);
        if (key === 's') handleAnswerSelection("RED", 1);
        if (key === 'd') handleAnswerSelection("RED", 2);
        if (key === 'f') handleAnswerSelection("RED", 3);
      }
      
      if (blueSelection === null && mode === GameMode.MULTIPLAYER) {
        if (key === 'h') handleAnswerSelection("BLUE", 0);
        if (key === 'j') handleAnswerSelection("BLUE", 1);
        if (key === 'k') handleAnswerSelection("BLUE", 2);
        if (key === 'l') handleAnswerSelection("BLUE", 3);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswerFeedback, redSelection, blueSelection, mode]);

  // End round logic (both answered or timeout)
  useEffect(() => {
    let roundEnded = false;
    let redForceTimeout = false;
    let blueForceTimeout = false;

    if (redSelection !== null && blueSelection !== null) {
      roundEnded = true;
    } else if (timer === 0 && !showAnswerFeedback && !lockRef.current) {
      roundEnded = true;
      if (redSelection === null) redForceTimeout = true;
      if (blueSelection === null) blueForceTimeout = true;
    }

    if (roundEnded && !lockRef.current) {
      lockRef.current = true;
      setShowAnswerFeedback(true);
      
      const rRes = {
        isCorrect: redSelection === currentQuestion.correctIndex,
        timeUsed: redForceTimeout ? 25 : redTime,
        timeout: redForceTimeout,
        selectedOption: redSelection ?? -1
      };
      
      const bRes = {
        isCorrect: blueSelection === currentQuestion.correctIndex,
        timeUsed: blueForceTimeout ? 25 : blueTime,
        timeout: blueForceTimeout,
        selectedOption: blueSelection ?? -1
      };
      
      onRoundResult(rRes, bRes, currentQuestion);

      // AI auto trigger skills
      const autoSkill = (tState: TeamState, team: "RED" | "BLUE") => {
        if (tState.skillsGauge >= 80 && !tState.skillsUsed.collectiveForce) {
          triggerSkill(team, "collectiveForce");
        } else if (tState.skillsGauge >= 60 && !tState.skillsUsed.knowledgeShield) {
          triggerSkill(team, "knowledgeShield");
        }
      };

      if (rRes.isCorrect && mode === GameMode.AI_VS_AI) autoSkill(teamRed, "RED");
      if (bRes.isCorrect && (mode === GameMode.AI_VS_AI || mode === GameMode.VS_AI)) autoSkill(teamBlue, "BLUE");
    }
  }, [redSelection, blueSelection, timer, showAnswerFeedback]);

  // AI Logic
  useEffect(() => {
    if (showAnswerFeedback) return;

    const setupAI = (team: "RED" | "BLUE", setThinking: (v: number) => void) => {
      let accuracyRate = 0.80;
      let delay = 6;
      
      switch (currentQuestion.difficulty) {
        case Difficulty.KNOWLEDGE: accuracyRate = 0.88; delay = 5; break;
        case Difficulty.COMPREHENSION: accuracyRate = 0.78; delay = 7; break;
        case Difficulty.APPLICATION: accuracyRate = 0.65; delay = 10; break;
        case Difficulty.HIGH_APPLICATION: accuracyRate = 0.50; delay = 13; break;
      }

      // Randomize delay slightly to feel more organic
      delay += (Math.random() * 2 - 1);

      let currentTick = 0;
      const totalTicks = Math.floor(delay * 5); // 5 updates per sec
      
      const interval = setInterval(() => {
        currentTick++;
        const pct = Math.floor((currentTick / totalTicks) * 100);
        setThinking(pct);

        if (currentTick >= totalTicks) {
          clearInterval(interval);
          if (lockRef.current || (team === "RED" ? redSelection !== null : blueSelection !== null)) return;
          
          const isCorrect = Math.random() < accuracyRate;
          const choice = isCorrect ? currentQuestion.correctIndex : (currentQuestion.correctIndex + 1) % 4;
          handleAnswerSelection(team, choice);
        }
      }, 200);

      return () => clearInterval(interval);
    };

    let clearRed, clearBlue;
    
    if (mode === GameMode.AI_VS_AI && redSelection === null) {
      clearRed = setupAI("RED", setAiThinkingRed);
    }
    if ((mode === GameMode.AI_VS_AI || mode === GameMode.VS_AI) && blueSelection === null) {
      clearBlue = setupAI("BLUE", setAiThinkingBlue);
    }

    return () => {
      if (clearRed) clearRed();
      if (clearBlue) clearBlue();
    };
  }, [currentQuestionIndex, showAnswerFeedback, mode]);

  const triggerSkill = (team: "RED" | "BLUE", skillType: "knowledgeShield" | "collectiveForce") => {
    const tState = team === "RED" ? teamRed : teamBlue;
    const cost = skillType === "knowledgeShield" ? 60 : 80;

    if (tState.skillsGauge < cost) return;

    const updatedTeam = {
      ...tState,
      skillsGauge: tState.skillsGauge - cost,
      skillsUsed: { ...tState.skillsUsed, [skillType]: true }
    };

    onUpdateState({
      ...matchState,
      teamRed: team === "RED" ? updatedTeam : teamRed,
      teamBlue: team === "BLUE" ? updatedTeam : teamBlue
    });
  };

  const handleNextQuestion = () => {
    lockRef.current = false;
    setRedSelection(null);
    setBlueSelection(null);
    setShowAnswerFeedback(false);
    setAiThinkingRed(0);
    setAiThinkingBlue(0);
    setQuestionStartTime(Date.now());

    if (currentQuestionIndex >= 7) {
      onCompleteMatch();
    } else {
      onUpdateState({
        ...matchState,
        currentQuestionIndex: currentQuestionIndex + 1,
        timer: maxTimer
      });
    }
  };

  const renderOptions = (team: "RED" | "BLUE") => {
    const isBlue = team === "BLUE";
    const selection = isBlue ? blueSelection : redSelection;
    const isAI = isBlue ? (mode === GameMode.VS_AI || mode === GameMode.AI_VS_AI) : (mode === GameMode.AI_VS_AI);
    const thinkingPct = isBlue ? aiThinkingBlue : aiThinkingRed;
    const teamState = isBlue ? teamBlue : teamRed;
    const hotkeys = isBlue ? ['H', 'J', 'K', 'L'] : ['A', 'S', 'D', 'F'];
    const accentColor = isBlue ? 'blue' : 'rose';

    if (isAI && selection === null && !showAnswerFeedback) {
      return (
        <div className={`bg-${accentColor}-950/20 p-8 rounded-xl border border-${accentColor}-900/50 text-center space-y-4 h-full flex flex-col justify-center`}>
          <BrainCircuit className={`w-8 h-8 text-${accentColor}-400 mx-auto animate-pulse`} />
          <div className="max-w-xs mx-auto w-full">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
              <span>{teamState.name} ĐANG TÍNH TOÁN</span>
              <span>{thinkingPct}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`bg-${accentColor}-500 h-full rounded-full transition-all duration-300`}
                style={{ width: `${thinkingPct}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (selection !== null && !showAnswerFeedback) {
      return (
        <div className={`bg-${accentColor}-950/30 p-8 rounded-xl border border-${accentColor}-500/30 text-center space-y-4 h-full flex flex-col justify-center`}>
          <div className={`w-12 h-12 rounded-full bg-${accentColor}-500/20 flex items-center justify-center mx-auto`}>
            <Zap className={`w-6 h-6 text-${accentColor}-400`} />
          </div>
          <p className={`text-${accentColor}-300 font-bold font-mono tracking-widest text-sm animate-pulse`}>
            ĐÃ CHỐT ĐÁP ÁN!
          </p>
          <p className="text-[10px] text-zinc-500">Chờ đối thủ...</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 h-full">
        {currentQuestion.options.map((option, idx) => {
          let optStyle = `border-zinc-800 hover:border-${accentColor}-500/50 hover:bg-${accentColor}-950/30 bg-zinc-950/60 text-stone-300`;
          
          if (showAnswerFeedback) {
            if (idx === currentQuestion.correctIndex) {
              optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] z-10";
            } else if (idx === selection) {
              optStyle = "border-rose-500 bg-rose-500/10 text-rose-400 line-through opacity-60";
            } else {
              optStyle = "border-zinc-850 bg-zinc-950/20 text-zinc-600 opacity-40";
            }
          }

          return (
            <motion.button
              whileHover={!showAnswerFeedback && selection === null ? { scale: 1.02 } : {}}
              whileTap={!showAnswerFeedback && selection === null ? { scale: 0.95 } : {}}
              key={idx}
              disabled={showAnswerFeedback || selection !== null}
              onClick={() => handleAnswerSelection(team, idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-colors flex items-center gap-3 relative overflow-hidden ${optStyle}`}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 z-10">
                <span className="w-7 h-7 rounded-lg bg-black flex items-center justify-center font-mono text-xs font-black border border-white/10 shadow-inner">
                  {String.fromCharCode(65 + idx)}
                </span>
                {!showAnswerFeedback && selection === null && (
                  <span className={`text-[8px] font-mono text-${accentColor}-400/70 bg-${accentColor}-950/50 px-1 rounded`}>
                    Phím {hotkeys[idx]}
                  </span>
                )}
              </div>
              <span className="z-10 font-medium leading-tight">{option}</span>
              
              {showAnswerFeedback && idx === selection && idx === currentQuestion.correctIndex && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 text-emerald-400 font-black text-lg drop-shadow-md z-10"
                >
                  ✓ TỐC ĐỘ: {(isBlue ? blueTime : redTime).toFixed(1)}s
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderSkills = (team: "RED" | "BLUE") => {
    const tState = team === "RED" ? teamRed : teamBlue;
    const accent = team === "RED" ? "rose" : "blue";
    
    return (
      <div className={`bg-zinc-900 border border-${accent}-950/60 p-4 rounded-2xl`}>
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className={`text-[10px] font-mono tracking-widest text-${accent}-400 uppercase font-black`}>KỸ NĂNG {team === "RED" ? "ĐỎ" : "XANH"}</span>
            <h4 className="text-sm font-bold text-white">{tState.name}</h4>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-mono text-${accent}-400 block`}>NĂNG LƯỢNG</span>
            <span className="text-lg font-black">{tState.skillsGauge}%</span>
          </div>
        </div>
        
        <div className={`w-full bg-${accent}-950/40 h-2 rounded-full mb-4 p-[1px]`}>
          <motion.div 
            className={`bg-${accent}-500 h-full rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${tState.skillsGauge}%` }}
            transition={{ type: "spring", bounce: 0 }}
          />
        </div>

        <div className="flex gap-2">
          <button
            disabled={tState.skillsGauge < 60 || tState.skillsUsed.knowledgeShield || showAnswerFeedback}
            onClick={() => triggerSkill(team, "knowledgeShield")}
            className={`flex-1 py-2 px-2 rounded-xl text-[10px] sm:text-xs flex flex-col items-center gap-1 transition-all border ${
              tState.skillsUsed.knowledgeShield ? "bg-slate-800/50 border-slate-700 text-slate-500" :
              tState.skillsGauge >= 60 && !showAnswerFeedback ? `bg-${accent}-950/40 border-${accent}-500/50 text-${accent}-300 hover:bg-${accent}-900/30` :
              "bg-zinc-950/60 border-transparent text-zinc-600"
            }`}
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Lá chắn (60%)</span>
          </button>
          <button
            disabled={tState.skillsGauge < 80 || tState.skillsUsed.collectiveForce || showAnswerFeedback}
            onClick={() => triggerSkill(team, "collectiveForce")}
            className={`flex-1 py-2 px-2 rounded-xl text-[10px] sm:text-xs flex flex-col items-center gap-1 transition-all border ${
              tState.skillsUsed.collectiveForce ? "bg-slate-800/50 border-slate-700 text-slate-500" :
              tState.skillsGauge >= 80 && !showAnswerFeedback ? "bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-900/30" :
              "bg-zinc-950/60 border-transparent text-zinc-600"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>X2 Lực (80%)</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header: Question & Timer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-blue-500 rounded-b-full shadow-[0_0_30px_rgba(245,158,11,0.5)]"></div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-4 w-full justify-between">
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border bg-zinc-950/50 ${difficultyDisplay.color}`}>
              Cấp độ: {difficultyDisplay.title} (+{currentQuestion.points} N)
            </span>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 border border-zinc-800 rounded-full">
              <Hourglass className={`w-4 h-4 ${timer < 8 ? "text-rose-500 animate-spin" : "text-amber-500"}`} />
              <span className={`font-mono font-black text-lg ${timer < 8 ? "text-rose-400 animate-pulse" : "text-white"}`}>
                {timer}s
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold border border-zinc-700 bg-zinc-950/50 text-zinc-400">
              Câu {currentQuestionIndex + 1}/8
            </span>
          </div>

          <h3 className="text-lg md:text-2xl font-sans text-stone-100 font-medium leading-relaxed max-w-4xl py-4">
            {currentQuestion.text}
          </h3>
        </div>
      </div>

      {/* Split Screen Battle Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* VS Badge in Center */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-full border-4 border-zinc-900 items-center justify-center z-20 shadow-2xl">
          <span className="font-black italic text-zinc-500">VS</span>
        </div>

        {/* Left Side: RED */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-rose-500 rounded-sm rotate-45"></div>
            <h2 className="font-black uppercase tracking-wider text-rose-400 text-lg">Đội Đỏ</h2>
          </div>
          <div className="flex-1 bg-zinc-900/50 p-4 rounded-3xl border border-rose-900/30">
            {renderOptions("RED")}
          </div>
          {renderSkills("RED")}
        </div>

        {/* Right Side: BLUE */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 justify-end">
            <h2 className="font-black uppercase tracking-wider text-blue-400 text-lg">Đội Xanh</h2>
            <div className="w-4 h-4 bg-blue-500 rounded-sm rotate-45"></div>
          </div>
          <div className="flex-1 bg-zinc-900/50 p-4 rounded-3xl border border-blue-900/30">
            {renderOptions("BLUE")}
          </div>
          {renderSkills("BLUE")}
        </div>

      </div>

      {/* Result Footer */}
      <AnimatePresence>
        {showAnswerFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-3xl shadow-xl space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <BrainCircuit className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-amber-500 font-black uppercase text-sm mb-1 tracking-wider">Phân tích Sư phạm</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-mono text-sm font-black tracking-widest hover:bg-zinc-200 flex items-center justify-center gap-2 mt-4 transition-transform active:scale-95 shadow-lg"
            >
              TIẾP TỤC TRẬN ĐẤU <ArrowRight className="w-5 h-5 text-black" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
