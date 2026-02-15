import React from 'react';
import { ZavzLogo } from './Icons';
import { openExternal } from '../utils/openExternal';
import { URLRegistry } from '../utils/urlRegistry';

interface UpdateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

export const UpdateAlertModal: React.FC<UpdateAlertModalProps> = ({ isOpen, onClose, version }) => {
  if (!isOpen) return null;

  const handleUpdate = () => {
    openExternal(URLRegistry.GITHUB);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-[#121214]/95 w-[420px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent-500)] opacity-10 blur-[60px] pointer-events-none"></div>

        {/* Content */}
        <div className="relative p-8 flex flex-col items-center gap-5">
          <ZavzLogo />

          <div className="text-center space-y-2">
            <h2
              className="text-white font-bold text-xl"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              New Update Available
            </h2>
            <p className="text-gray-400 text-sm">
              Version <span className="text-[var(--accent-400)] font-bold">{version}</span> is now
              available.
            </p>
            <p className="text-gray-500 text-xs">
              Update to get the latest features and bug fixes.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-[var(--accent-600)] hover:bg-[var(--accent-500)] rounded-xl shadow-[0_4px_20px_var(--accent-shadow)] transition-all active:scale-95"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
