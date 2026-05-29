/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { GameTheme, TeamState } from "../types.ts";
import { Sparkles, Shield, Flame, Activity } from "lucide-react";

interface TugOfWarPhysicsProps {
  ropePosition: number; // -100 to +100
  ropeTension: number; // 0 to 100
  ropeVibration: number; // 0 to 10
  theme: GameTheme;
  teamRed: TeamState;
  teamBlue: TeamState;
  showPullEffect: "RED" | "BLUE" | null;
}

export const TugOfWarPhysics: React.FC<TugOfWarPhysicsProps> = ({
  ropePosition,
  ropeTension,
  ropeVibration,
  theme,
  teamRed,
  teamBlue,
  showPullEffect
}) => {
  // Translate [-100, 100] to percentage offset for the rope midpoint indicator
  // -100 is fully Left (Red wins), +100 is fully Right (Blue wins)
  const shiftPercent = useMemo(() => {
    // scale to -40% to +40% layout boundary to keep avatars on screen
    return (ropePosition / 100) * 40;
  }, [ropePosition]);

  // Generate a random vibration offset if vibrating
  const shakeX = useMemo(() => {
    if (ropeVibration === 0) return 0;
    return (Math.random() - 0.5) * ropeVibration * 1.5;
  }, [ropeVibration]);

  const shakeY = useMemo(() => {
    if (ropeVibration === 0) return 0;
    return (Math.random() - 0.5) * ropeVibration * 1.5;
  }, [ropeVibration]);

  // Environmental styles and icons depending on theme
  const themeConfig = useMemo(() => {
    switch (theme) {
      case GameTheme.MYTHOLOGY:
        return {
          bg: "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30",
          particleColor: "bg-indigo-400",
          atmosphere: "☁️ Thần Thoại Olympus: Sấm sét gầm vang khi lực kéo vượt ngưỡng",
          groundStyle: "border-indigo-800/40 bg-indigo-950/20",
          ropeColor: "from-yellow-400 via-amber-300 to-yellow-400 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]",
          flagColor: "bg-yellow-500",
          ambientEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-5 left-1/4 w-0.5 h-12 bg-white blur-[1px] animate-pulse"></div>
              <div className="absolute top-20 right-1/3 w-1 h-32 bg-blue-300 blur-[2px] animate-bounce"></div>
              <div className="absolute bottom-5 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
          )
        };
      case GameTheme.CYBER:
        return {
          bg: "bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950 border-cyan-500/30",
          particleColor: "bg-cyan-400",
          atmosphere: "⚡ Cyber Future Grid: Lò phản ứng hạt nhân rung lắc mạnh mẽ",
          groundStyle: "border-cyan-800/40 bg-cyan-950/20",
          ropeColor: "from-cyan-400 via-emerald-300 to-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]",
          flagColor: "bg-cyan-500",
          ambientEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,180,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,180,229,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cyan-950/10 to-transparent"></div>
            </div>
          )
        };
      case GameTheme.HISTORIC:
        default:
        return {
          bg: "bg-gradient-to-b from-stone-900 via-amber-950/40 to-stone-900 border-amber-900/30",
          particleColor: "bg-amber-500",
          atmosphere: "🛡️ Hùng Ca Sử Việt: Tiếng Trống đồng vang vọng hào khí sông núi",
          groundStyle: "border-amber-800/30 bg-amber-950/10",
          ropeColor: "from-amber-600 via-orange-500 to-amber-700 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
          flagColor: "bg-red-600",
          ambientEffect: (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
              <div className="absolute bottom-4 left-10 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl"></div>
            </div>
          )
        };
    }
  }, [theme]);

  return (
    <div className={`relative px-4 py-6 rounded-2xl border ${themeConfig.bg} shadow-2xl transition-all duration-500 overflow-hidden`}>
      {/* Background ambient visuals */}
      {themeConfig.ambientEffect}

      {/* Tension / Physics HUD */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase">
            PHYSICS ECOSYSTEM
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/70 font-medium">
            {themeConfig.atmosphere}
          </p>
        </div>
      </div>

      {/* Tug-of-war Battle Field Canvas */}
      <div className="relative h-64 w-full flex items-center justify-center rounded-xl bg-black/40 overflow-hidden border border-white/5">
        
        {/* Force & Tension overlay */}
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[10px] font-mono text-white/40 pointer-events-none">
          <div>LỰC CĂNG: <span className="text-rose-400 font-bold">{ropeTension.toFixed(0)} N</span></div>
          <div>VIB: <span className="text-amber-400 font-bold">{ropeVibration.toFixed(1)}Hz</span></div>
          <div>LỆCH TÂM: <span className="text-cyan-400 font-bold">{ropePosition.toFixed(1)}%</span></div>
        </div>

        {/* Midline marker (0v) */}
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-red-500/20 border-dashed border-l pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-red-500/40 bg-zinc-950 px-1 py-0.5 rounded -rotate-90 pointer-events-none transform -translate-x-1.5 font-bold">VẠCH ĐỐI KHÁNG</span>
        </div>

        {/* Dynamic environmental danger zones if rope moves far */}
        <div 
          className={`absolute top-0 bottom-0 w-[30%] pointer-events-none transition-opacity duration-700 ${ropePosition > 30 ? "opacity-100" : "opacity-0"} right-0 bg-gradient-to-l from-blue-600/30 to-transparent`}
        >
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay animate-pulse"></div>
          {ropePosition > 50 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-blue-400 uppercase font-black tracking-wider bg-black/80 px-2 py-1 rounded leading-none animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.8)] border border-blue-500/50">
              ĐỘI XANH ÁP ĐẢO!
            </div>
          )}
        </div>

        <div 
          className={`absolute top-0 bottom-0 w-[30%] pointer-events-none transition-opacity duration-700 ${ropePosition < -30 ? "opacity-100" : "opacity-0"} left-0 bg-gradient-to-r from-rose-600/30 to-transparent`}
        >
          <div className="absolute inset-0 bg-rose-500/10 mix-blend-overlay animate-pulse"></div>
          {ropePosition < -50 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-rose-400 uppercase font-black tracking-wider bg-black/80 px-2 py-1 rounded leading-none animate-bounce shadow-[0_0_15px_rgba(244,63,94,0.8)] border border-rose-500/50">
              ĐỘI ĐỎ ÁP ĐẢO!
            </div>
          )}
        </div>

        {/* Pulling force visualizer pulses */}
        {showPullEffect === "RED" && (
          <div className="absolute left-[10%] right-1/2 top-1/2 -translate-y-1/2 h-32 bg-gradient-to-r from-rose-500/40 to-transparent rounded-full filter blur-2xl animate-ping opacity-90 pointer-events-none"></div>
        )}
        {showPullEffect === "BLUE" && (
          <div className="absolute right-[10%] left-1/2 top-1/2 -translate-y-1/2 h-32 bg-gradient-to-l from-blue-500/40 to-transparent rounded-full filter blur-2xl animate-ping opacity-90 pointer-events-none"></div>
        )}

        {/* Physics-responsive ROPE structure */}
        <div 
          className="absolute left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r transition-all duration-100 ease-out flex items-center pointer-events-none"
          style={{
            transform: `translate(${shakeX}px, ${shakeY}px)`,
            background: `linear-gradient(90deg, #3b82f6 0%, #a855f7 ${50 + shiftPercent}%, #3b82f6 100%)`
          }}
        >
          {/* Main Rope Body line with tension effect */}
          <div 
            className={`w-full h-full bg-gradient-to-r ${themeConfig.ropeColor} rounded-full transition-all duration-300`}
            style={{
              height: `${1.5 + (ropeTension / 30)}px`,
              filter: `drop-shadow(0 0 ${2 + (ropeTension / 20)}px currentColor)`
            }}
          />

          {/* Rope Central Indicator (the Red Flag tying the rope) */}
          <div 
            className="absolute h-9 w-9 flex flex-col items-center justify-center transition-all duration-100 ease-out"
            style={{
              left: `calc(${50 + shiftPercent}% - 18px)`
            }}
          >
            {/* The actual ribbon hanging */}
            <div className={`w-1 bg-white h-4 shadow-lg ${themeConfig.flagColor} rounded-b`} />
            <div className={`w-3 h-3 rotate-45 border border-white/50 shadow-md ${themeConfig.flagColor}`} />
            
            {/* Pulsing halo around flag proportional to tension */}
            <div 
              className="absolute w-8 h-8 rounded-full border border-red-500/30 animate-ping opacity-40 shadow-xs"
              style={{ animationDuration: `${Math.max(0.3, 1.5 - (ropeTension / 70))}s` }}
            />
          </div>
        </div>

        {/* --- WEST (RED) TEAM (Left Side) --- */}
        <div className="absolute left-[8%] inset-y-0 flex flex-col justify-center items-center gap-1">
          {/* Avatar Pullers */}
          <div 
            className="flex items-center -space-x-2 transition-all duration-200"
            style={{
              transform: `translateX(${showPullEffect === "RED" ? -6 : 0}px) scale(${showPullEffect === "RED" ? 1.05 : 1})`
            }}
          >
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              {/* Skill Indicators */}
              <div className="flex gap-1 mb-1 h-3">
                {teamRed.skillsUsed.knowledgeShield && (
                  <Shield className="w-3 h-3 text-cyan-400 animate-bounce" />
                )}
                {teamRed.skillsUsed.collectiveForce && (
                  <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                )}
              </div>
              
              {/* Human figure */}
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showPullEffect === "RED" ? "bg-rose-500 text-white" : "bg-rose-950/70 text-rose-300 border border-rose-500/40"} font-bold text-xs shadow-md`}>
                  Đỏ
                </div>
                {/* Visual Lean back */}
                <div 
                  className="w-1.5 h-10 bg-rose-500/80 rounded mt-0.5 origin-bottom transition-transform duration-150"
                  style={{ transform: `rotate(${-15 - (ropePosition < 0 ? 10 : 0)}deg)` }}
                />
                <div className="flex gap-2">
                  <div className="w-1 h-6 bg-rose-500/50 rounded -rotate-12" />
                  <div className="w-1 h-6 bg-rose-500/50 rounded rotate-12" />
                </div>
              </div>
            </div>

            {/* Helper puller 2 */}
            <div className="opacity-80 flex flex-col items-center pt-4 scale-90 hidden sm:flex">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px]">
                  2
                </div>
                <div 
                  className="w-1 h-8 bg-rose-500/60 rounded mt-0.5 origin-bottom"
                  style={{ transform: `rotate(${-20 - (ropePosition < 0 ? 5 : 0)}deg)` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <h4 className="text-xs uppercase font-mono font-bold text-rose-400">
              {teamRed.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 justify-center">
              <span className="text-[10px] font-mono bg-rose-950/60 text-rose-300 px-1.5 py-0.5 rounded">
                Score: {teamRed.score}
              </span>
              {teamRed.consecutiveCorrect >= 2 && (
                <span className="text-[9px] bg-amber-500 text-black px-1 rounded font-bold animate-pulse flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Combo {teamRed.consecutiveCorrect}🔥
                </span>
              )}
            </div>
            {/* Skills Gauge */}
            <div className="w-24 bg-rose-950/50 h-1.5 rounded-full mt-2 p-[1px] border border-rose-500/20 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${teamRed.skillsGauge}%` }}
              />
            </div>
            <span className="text-[8px] font-mono text-rose-400/70">Năng Lượng Kỹ Năng: {teamRed.skillsGauge}%</span>
          </div>
        </div>

        {/* --- EAST (BLUE) TEAM (Right Side) --- */}
        <div className="absolute right-[8%] inset-y-0 flex flex-col justify-center items-center gap-1">
          {/* Avatar Pullers */}
          <div 
            className="flex items-center -space-x-2 transition-all duration-200"
            style={{
              transform: `translateX(${showPullEffect === "BLUE" ? 6 : 0}px) scale(${showPullEffect === "BLUE" ? 1.05 : 1})`
            }}
          >
            {/* Helper 2 (shown on sm screen) */}
            <div className="opacity-80 flex flex-col items-center pt-4 scale-90 hidden sm:flex">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-blue-950/40 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px]">
                  2
                </div>
                <div 
                  className="w-1 h-8 bg-blue-500/60 rounded mt-0.5 origin-bottom"
                  style={{ transform: `rotate(${20 + (ropePosition > 0 ? 5 : 0)}deg)` }}
                />
              </div>
            </div>

            {/* Main AI Player */}
            <div className="flex flex-col items-center">
              {/* Skill Indicators */}
              <div className="flex gap-1 mb-1 h-3">
                {teamBlue.skillsUsed.knowledgeShield && (
                  <Shield className="w-3 h-3 text-cyan-400 animate-bounce" />
                )}
                {teamBlue.skillsUsed.collectiveForce && (
                  <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                )}
              </div>

              {/* Human figure */}
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showPullEffect === "BLUE" ? "bg-blue-500 text-white" : "bg-blue-950/70 text-blue-300 border border-blue-500/40"} font-bold text-xs shadow-md`}>
                  Xanh
                </div>
                <div 
                  className="w-1.5 h-10 bg-blue-500/80 rounded mt-0.5 origin-bottom transition-transform duration-150"
                  style={{ transform: `rotate(${15 + (ropePosition > 0 ? 10 : 0)}deg)` }}
                />
                <div className="flex gap-2">
                  <div className="w-1 h-6 bg-blue-500/50 rounded -rotate-12" />
                  <div className="w-1 h-6 bg-blue-500/50 rounded rotate-12" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <h4 className="text-xs uppercase font-mono font-bold text-blue-400">
              {teamBlue.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 justify-center">
              <span className="text-[10px] font-mono bg-blue-950/60 text-blue-300 px-1.5 py-0.5 rounded">
                Score: {teamBlue.score}
              </span>
              {teamBlue.consecutiveCorrect >= 2 && (
                <span className="text-[9px] bg-amber-500 text-black px-1 rounded font-bold animate-pulse flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Combo {teamBlue.consecutiveCorrect}🔥
                </span>
              )}
            </div>
            {/* Skills Gauge */}
            <div className="w-24 bg-blue-950/50 h-1.5 rounded-full mt-2 p-[1px] border border-blue-500/20 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${teamBlue.skillsGauge}%` }}
              />
            </div>
            <span className="text-[8px] font-mono text-blue-400/70">Năng Lượng Kỹ Năng: {teamBlue.skillsGauge}%</span>
          </div>
        </div>

      </div>

      {/* Physics State / Dynamic Legend info */}
      <div className="mt-4 flex flex-wrap gap-3 items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping opacity-60"></div>
          <span>Trạng thái: <strong>{ropePosition === 0 ? "Vạch trung lộ cân bằng" : ropePosition < 0 ? `${teamRed.name} đang áp đảo` : `${teamBlue.name} đang lấn lướt`}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-400" /> Lá chắn bảo vệ</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500 animate-pulse" /> Giật dây gia tốc lực</span>
        </div>
      </div>
    </div>
  );
};
