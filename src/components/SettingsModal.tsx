/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Key, Cpu, ExternalLink, CheckCircle2 } from "lucide-react";
import { AI_MODELS } from "../utils/aiClient";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  currentModel: string;
  onSave: (key: string, model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  currentModel,
  onSave
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [selectedModel, setSelectedModel] = useState(currentModel || AI_MODELS[0].id);

  useEffect(() => {
    setApiKey(currentKey);
    setSelectedModel(currentModel || AI_MODELS[0].id);
  }, [isOpen, currentKey, currentModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey.trim(), selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-slideIn">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" /> Cấu hình API & AI
          </h2>
          {currentKey && (
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* API Key */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              Gemini API Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[11px] text-zinc-500">
              Chưa có key?{" "}
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 underline underline-offset-2"
              >
                Lấy API key tại Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Lựa chọn AI Model (Primary)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                    selectedModel === model.id
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="font-mono">{model.label}</span>
                  {selectedModel === model.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-amber-500/80 italic mt-2">
              Hệ thống sẽ tự động fallback sang các model khác nếu model chính gặp lỗi (quá tải, hết hạn mức...).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-900/30 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold font-mono text-sm rounded-xl transition-colors shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
          >
            LƯU CẤU HÌNH
          </button>
        </div>

      </div>
    </div>
  );
};
