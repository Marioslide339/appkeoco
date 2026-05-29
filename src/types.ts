/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// standard enum declarations
export enum Difficulty {
  KNOWLEDGE = "KNOWLEDGE",
  COMPREHENSION = "COMPREHENSION",
  APPLICATION = "APPLICATION",
  HIGH_APPLICATION = "HIGH_APPLICATION"
}

export enum GameTheme {
  MYTHOLOGY = "MYTHOLOGY",
  CYBER = "CYBER",
  HISTORIC = "HISTORIC"
}

export enum GameMode {
  VS_AI = "VS_AI",
  MULTIPLAYER = "MULTIPLAYER",
  AI_VS_AI = "AI_VS_AI"
}

export enum MatchPhase {
  SETUP = "SETUP",
  BATTLE = "BATTLE",
  RESULT = "RESULT"
}

export enum QuizSource {
  PRELOADED = "PRELOADED",
  AI_GENERATED = "AI_GENERATED"
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: Difficulty;
  explanation: string;
  points: number;
}

export interface MatchHistoryItem {
  questionId: string;
  questionText: string;
  correct: boolean;
  responseTime: number; // in seconds
  difficulty: Difficulty;
}

export interface TeamState {
  name: string;
  score: number;
  consecutiveCorrect: number;
  skillsGauge: number; // 0 to 100
  skillsUsed: {
    knowledgeShield: boolean;
    collectiveForce: boolean;
  };
  history: MatchHistoryItem[];
  reflexHistory: number[]; // response times
}

export interface MatchState {
  ropePosition: number; // -100 to +100 (Negative: Team Red / Blue's pull; Positive: Team Blue / Red's pull)
  // Let Red be Player/West (ropePosition < 0 means Red is winning)
  // Let Blue be AI/East (ropePosition > 0 means Blue is winning)
  ropeTension: number; // 0 to 100
  ropeVibration: number; // 0 to 10
  phase: MatchPhase;
  playersCount: number;
  currentQuestionIndex: number;
  questions: Question[];
  teamRed: TeamState;
  teamBlue: TeamState;
  timer: number; // current question timer in seconds
  maxTimer: number; // default round time
  theme: GameTheme;
  mode: GameMode;
  quizTopic: string;
  isCustomTopic: boolean;
  isAiAdaptive: boolean;
}

export interface PedagogicalFeedback {
  recommendation: string;
  focusArea: string;
  reflexAnalysis: string;
  cognitiveProfile: string;
}
