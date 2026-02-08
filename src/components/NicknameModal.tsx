import React, { useState } from 'react';
import { ZavzLogo } from './Icons';

interface NicknameModalProps {
  onConfirm: (nickname: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ onConfirm }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onConfirm(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-500)] opacity-[0.07] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative flex flex-col items-center gap-8 w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="transform transition-transform hover:rotate-12 duration-300">
            <ZavzLogo />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-4xl tracking-tighter text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>ZAVZ</span>
            <div className="bg-[var(--accent-600)] px-3 py-0.5 rounded-md shadow-lg shadow-[var(--accent-shadow)] -mt-1">
              <span className="font-black text-xs text-white block tracking-[0.2em] uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>INJECTOR</span>
            </div>
          </div>
        </div>

        {/* Nickname input */}
        <div className="w-full space-y-3">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block text-center">
            Enter your Minecraft nickname
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nickname"
            autoFocus
            maxLength={16}
            className="w-full bg-[#121214] border border-white/10 rounded-xl px-5 py-4 text-base text-white text-center focus:outline-none focus:border-[var(--accent-500)] focus:ring-1 focus:ring-[var(--accent-500-30)] transition-all placeholder:text-gray-600"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          />
        </div>

        {/* Continue button */}
        <button
          onClick={handleSubmit}
          disabled={value.trim().length === 0}
          className="w-full py-3.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-[0_4px_20px_var(--accent-shadow)] hover:shadow-[0_6px_24px_var(--accent-shadow)] transition-all transform active:scale-[0.98] uppercase tracking-wider"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Continue
        </button>

        {/* Version tag */}
        <span className="text-gray-600 text-xs font-medium">Injector</span>
      </div>
    </div>
  );
};
