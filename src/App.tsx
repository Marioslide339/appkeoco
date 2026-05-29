/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MatchState, MatchPhase, GameTheme, GameMode, Difficulty, Question, TeamState } from "./types.ts";
import { PRELOADED_QUIZZES } from "./preloadedQuizzes.ts";
import { SetupScreen } from "./components/SetupScreen.tsx";
import { ActiveBattle } from "./components/ActiveBattle.tsx";
import { TugOfWarPhysics } from "./components/TugOfWarPhysics.tsx";
import { PedagogicalDashboard } from "./components/PedagogicalDashboard.tsx";
import { SettingsModal } from "./components/SettingsModal.tsx";
import { Swords, Info, RotateCcw, Volume2, Sparkles, Key } from "lucide-react";

export default function App() {
  // Global Match state
  const [matchState, setMatchState] = useState<MatchState>({
    ropePosition: 0,
    ropeTension: 15,
    ropeVibration: 0,
    phase: MatchPhase.SETUP,
    playersCount: 1,
    currentQuestionIndex: 0,
    questions: [],
    teamRed: {
      name: "Bách Việt Hùng Quân",
      score: 0,
      consecutiveCorrect: 0,
      skillsGauge: 20,
      skillsUsed: { knowledgeShield: false, collectiveForce: false },
      history: [],
      reflexHistory: []
    },
    teamBlue: {
      name: "Trọng Lực Đế Quốc",
      score: 0,
      consecutiveCorrect: 0,
      skillsGauge: 20,
      skillsUsed: { knowledgeShield: false, collectiveForce: false },
      history: [],
      reflexHistory: []
    },
    timer: 25,
    maxTimer: 25,
    theme: GameTheme.HISTORIC,
    mode: GameMode.VS_AI,
    quizTopic: "",
    isCustomTopic: false,
    isAiAdaptive: true
  });

  const [isGeneratingQuiz, setGeneratingQuiz] = useState<boolean>(false);
  const [showPullEffect, setShowPullEffect] = useState<"RED" | "BLUE" | null>(null);
  const [soundLog, setSoundLog] = useState<string | null>(null);

  // API Config State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("app_gemini_key") || "");
  const [aiModel, setAiModel] = useState(() => localStorage.getItem("app_gemini_model") || "");
  const [showApiModal, setShowApiModal] = useState(!apiKey);

  const handleSaveApiSettings = (key: string, model: string) => {
    setApiKey(key);
    setAiModel(model);
    localStorage.setItem("app_gemini_key", key);
    localStorage.setItem("app_gemini_model", model);
    setShowApiModal(false);
  };

  // Sound log trigger to display virtual audio events (war horn, drum rumbles, cyber warnings)
  const triggerAudioSign = (message: string) => {
    setSoundLog(message);
    setTimeout(() => {
      setSoundLog(null);
    }, 4500);
  };

  // Decay rope tension and vibration slightly on background frames for realistic physical dissipation
  useEffect(() => {
    if (matchState.phase !== MatchPhase.BATTLE) return;

    const interval = setInterval(() => {
      setMatchState((prev) => {
        const decayedTension = Math.max(10, prev.ropeTension - 1.2);
        const decayedVibration = Math.max(0, prev.ropeVibration - 0.4);
        return {
          ...prev,
          ropeTension: decayedTension,
          ropeVibration: decayedVibration
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [matchState.phase]);

  // Handler for setting up and initiating a match
  const handleStartMatch = (config: {
    selectedQuiz: typeof PRELOADED_QUIZZES[0];
    theme: GameTheme;
    mode: GameMode;
    isAiAdaptive: boolean;
    teamRedName: string;
    teamBlueName: string;
    isCustomTopic: boolean;
    customTopic: string;
  }) => {
    triggerAudioSign("🎺 Tiếng kèn lệnh khởi thủy vang dội! Đấu trường Kéo co đã nạp thành công.");
    
    setMatchState({
      ropePosition: 0,
      ropeTension: 20,
      ropeVibration: 2,
      phase: MatchPhase.BATTLE,
      playersCount: config.mode === GameMode.MULTIPLAYER ? 2 : 1,
      currentQuestionIndex: 0,
      questions: config.selectedQuiz.questions,
      teamRed: {
        name: config.teamRedName,
        score: 0,
        consecutiveCorrect: 0,
        skillsGauge: 10,
        skillsUsed: { knowledgeShield: false, collectiveForce: false },
        history: [],
        reflexHistory: []
      },
      teamBlue: {
        name: config.teamBlueName,
        score: 0,
        consecutiveCorrect: 0,
        skillsGauge: 10,
        skillsUsed: { knowledgeShield: false, collectiveForce: false },
        history: [],
        reflexHistory: []
      },
      timer: 25,
      maxTimer: 25,
      theme: config.theme,
      mode: config.mode,
      quizTopic: config.isCustomTopic ? config.customTopic : config.selectedQuiz.name,
      isCustomTopic: config.isCustomTopic,
      isAiAdaptive: config.isAiAdaptive
    });
  };

  // Central Physics engine force processor for simultaneous pulls
  const handleRoundResult = (
    redResult: { isCorrect: boolean, timeUsed: number, timeout: boolean },
    blueResult: { isCorrect: boolean, timeUsed: number, timeout: boolean },
    question: Question
  ) => {
    let updatedRed = { ...matchState.teamRed };
    let updatedBlue = { ...matchState.teamBlue };
    let newPosition = matchState.ropePosition;
    let newTension = matchState.ropeTension;
    let newVibration = matchState.ropeVibration;

    const baseForce = question.points;

    // Helper to calculate force and handle skills
    const calcForceAndSkills = (
      team: "RED" | "BLUE",
      result: typeof redResult,
      myState: typeof updatedRed,
      oppState: typeof updatedRed
    ) => {
      let finalForce = 0;
      let slipForce = 0;

      if (result.timeout || !result.isCorrect) {
        myState.consecutiveCorrect = 0;
        slipForce = baseForce * 0.4; // They slipped
      } else {
        myState.consecutiveCorrect += 1;
        myState.score += question.points;

        const normalizedTime = Math.min(25, result.timeUsed);
        let multiplier = 1.5 - (normalizedTime / 25);

        if (myState.skillsUsed.collectiveForce) {
          multiplier *= 2.2;
          myState.skillsUsed.collectiveForce = false;
        }

        finalForce = baseForce * multiplier;

        if (oppState.skillsUsed.knowledgeShield) {
          finalForce = 0;
          oppState.skillsUsed.knowledgeShield = false;
        }

        // Energy gauge gain
        const gaugeGain = Math.round(15 + (multiplier * 10)); 
        myState.skillsGauge = Math.min(100, myState.skillsGauge + gaugeGain);
      }

      myState.history.push({
        questionId: question.id,
        questionText: question.text,
        correct: result.isCorrect,
        responseTime: Math.min(25, result.timeUsed),
        difficulty: question.difficulty
      });
      myState.reflexHistory.push(result.timeUsed);

      return { finalForce, slipForce };
    };

    const redCalc = calcForceAndSkills("RED", redResult, updatedRed, updatedBlue);
    const blueCalc = calcForceAndSkills("BLUE", blueResult, updatedBlue, updatedRed);

    // Calculate net movement.
    // Red pulls left (negative position), Blue pulls right (positive position).
    // If Red pulls correctly, position decreases by (redCalc.finalForce).
    // If Red slips, they are pulled right by their slip force (position increases).
    // If Blue pulls correctly, position increases by (blueCalc.finalForce).
    // If Blue slips, they are pulled left by their slip force (position decreases).

    let positionDelta = 0;

    // Red's effect
    if (redCalc.finalForce > 0) positionDelta -= redCalc.finalForce * 0.7;
    if (redCalc.slipForce > 0) positionDelta += redCalc.slipForce * 0.7;

    // Blue's effect
    if (blueCalc.finalForce > 0) positionDelta += blueCalc.finalForce * 0.7;
    if (blueCalc.slipForce > 0) positionDelta -= blueCalc.slipForce * 0.7;

    newPosition = Math.max(-100, Math.min(100, newPosition + positionDelta));

    // Tension and vibration
    if (redCalc.finalForce > 0 || blueCalc.finalForce > 0) {
      newTension = Math.min(100, newTension + 18);
      newVibration = Math.min(10, newVibration + 2.5);
      if (redCalc.finalForce > blueCalc.finalForce) {
        setShowPullEffect("RED");
      } else if (blueCalc.finalForce > redCalc.finalForce) {
        setShowPullEffect("BLUE");
      } else {
        setShowPullEffect("RED"); // Tie, show one or both
        setTimeout(() => setShowPullEffect("BLUE"), 300);
      }
      setTimeout(() => setShowPullEffect(null), 1000);
      
      triggerAudioSign(`LỰC TỔNG HỢP: Sợi dây dịch chuyển ${Math.abs(positionDelta).toFixed(1)} N!`);
    } else {
      newTension = Math.max(5, newTension - 10);
      newVibration = Math.min(10, newVibration + 1.55);
      triggerAudioSign(`TRƯỢT CHÂN ĐỒNG LOẠT: Cả hai đội đều hụt nhịp!`);
    }

    setMatchState((prev) => {
      const redKOWin = newPosition <= -100;
      const blueKOWin = newPosition >= 100;

      let nextPhase = prev.phase;
      if (redKOWin || blueKOWin) {
        nextPhase = MatchPhase.RESULT;
        triggerAudioSign("🎉 ĐỨT DÂY / KO CHẠM VẠCH ĐỐI KHÁNG! Trận đấu kéo co đã phân định thắng bại dứt điểm.");
      }

      return {
        ...prev,
        ropePosition: newPosition,
        ropeTension: newTension,
        ropeVibration: newVibration,
        phase: nextPhase,
        teamRed: updatedRed,
        teamBlue: updatedBlue
      };
    });
  };

  // Complete Match triggered manually or upon 8 questions consumed
  const handleCompleteMatch = () => {
    triggerAudioSign("🏁 TIẾN TRÌNH THI PHỔ KẾT THÚC: Hệ thống đang tải trung tâm dữ liệu Sư phạm.");
    setMatchState(prev => ({
      ...prev,
      phase: MatchPhase.RESULT
    }));
  };

  // Reset Match back to setup configurations
  const handleResetMatch = () => {
    setMatchState(prev => ({
      ...prev,
      phase: MatchPhase.SETUP,
      currentQuestionIndex: 0,
      ropePosition: 0
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500/30">
      
      {/* Top Navigation banner */}
      <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-red-500 to-blue-500 p-1.5 rounded-lg shadow-inner">
              <Swords className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-black tracking-wider text-sm bg-gradient-to-r from-red-400 via-amber-300 to-blue-400 bg-clip-text text-transparent uppercase">
                DIGITAL TUG-OF-WAR
              </span>
              <p className="text-[9px] text-zinc-500 font-mono tracking-widest leading-none mt-0.5">EDTECH PLATFORM v2.4</p>
            </div>
          </div>

          {/* Quick Info details */}
          <div className="flex items-center gap-3">
            {!apiKey && (
              <span className="text-[10px] text-rose-500 font-bold uppercase animate-pulse">Lấy API key để sử dụng app</span>
            )}
            <button 
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 hover:text-white px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" /> Settings (API Key)
            </button>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg">
              <Info className="w-3.5 h-3.5 text-cyan-400" /> Lead EdTech strategic workspace
            </span>
          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* Global Virtual Audio Broadcast HUD */}
        {soundLog && (
          <div className="fixed bottom-6 right-6 z-50 p-4 bg-zinc-900 border border-amber-500/20 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn max-w-sm">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <Volume2 className="w-4 h-4 animate-ping" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold leading-none mb-1">ÂM THANH MÔ PHỎNG</span>
              <p className="text-zinc-200 leading-snug">{soundLog}</p>
            </div>
          </div>
        )}

        {/* SETUP SCREEN PHASE */}
        {matchState.phase === MatchPhase.SETUP && (
          <SetupScreen
            onStartMatch={handleStartMatch}
            isGeneratingQuiz={isGeneratingQuiz}
            setGeneratingQuiz={setGeneratingQuiz}
            apiKey={apiKey}
            aiModel={aiModel}
            onOpenSettings={() => setShowApiModal(true)}
          />
        )}

        {/* BATTLE SCREEN PHASE */}
        {matchState.phase === MatchPhase.BATTLE && (
          <div className="space-y-6">
            
            {/* Real-time constant Physics simulator representation */}
            <TugOfWarPhysics
              ropePosition={matchState.ropePosition}
              ropeTension={matchState.ropeTension}
              ropeVibration={matchState.ropeVibration}
              theme={matchState.theme}
              teamRed={matchState.teamRed}
              teamBlue={matchState.teamBlue}
              showPullEffect={showPullEffect}
            />

            {/* Response interactive module */}
            <ActiveBattle
              matchState={matchState}
              onUpdateState={setMatchState}
              onRoundResult={handleRoundResult}
              onCompleteMatch={handleCompleteMatch}
            />

          </div>
        )}

        {/* RESULTS SCREEN / DASHBOARD REPORT PHASE */}
        {matchState.phase === MatchPhase.RESULT && (
          <div className="space-y-6">
            <PedagogicalDashboard
              matchState={matchState}
              onResetMatch={handleResetMatch}
              apiKey={apiKey}
              aiModel={aiModel}
            />
          </div>
        )}

      </main>

      {/* Humble Footer containing licensing and tech indicators */}
      <footer className="border-t border-zinc-900 bg-black/40 py-6 text-center text-xs text-zinc-600 font-mono space-y-1">
        <p>© 2026 Digital Tug of War. Mapped to Bloom's Cognitive Framework.</p>
        <p className="text-[9px] text-zinc-700">Powered by Gemini 3.5 & physics-directed adaptive flows.</p>
      </footer>

      {/* Global API Settings Modal */}
      <SettingsModal
        isOpen={showApiModal}
        onClose={() => apiKey ? setShowApiModal(false) : null}
        currentKey={apiKey}
        currentModel={aiModel}
        onSave={handleSaveApiSettings}
      />
    </div>
  );
}
