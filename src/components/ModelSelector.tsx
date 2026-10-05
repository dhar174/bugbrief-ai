import React, { useState, useRef, useEffect } from 'react';
import { FLASH_MODELS, FlashModelOption } from '../types';
import { Cpu, ChevronDown, Check, Zap } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeModel =
    FLASH_MODELS.find((m) => m.id === selectedModel) || FLASH_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-400'
            : isOpen
            ? 'bg-zinc-800 border-sky-500/50 text-white ring-1 ring-sky-500/30'
            : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-200'
        }`}
        title="Select Gemini Flash model for triage"
      >
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-mono text-xs">{activeModel.name}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
          {activeModel.tag}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl z-50 py-1.5 divide-y divide-zinc-800/80 animate-fadeIn">
          <div className="px-3 py-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
              <span>Choose Gemini Flash Model</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Flash Tier
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Select which Gemini Flash model runs the engineering triage logic.
            </p>
          </div>

          <div className="py-1">
            {FLASH_MODELS.map((model) => {
              const isSelected = model.id === activeModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-zinc-800/80 transition-colors flex items-start justify-between gap-2.5 ${
                    isSelected ? 'bg-sky-500/10' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-sky-300' : 'text-zinc-200'
                        }`}
                      >
                        {model.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          model.tag === 'Recommended'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {model.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {model.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
