import React from 'react';
import { X, Save } from 'lucide-react';

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="bg-[#121214]/80 backdrop-blur-2xl w-[500px] rounded-2xl border border-white/10 shadow-2xl flex flex-col font-sans relative overflow-hidden ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Background Gradient Spot */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-10 blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10">
            <div>
                <h2 className="text-white font-bold text-xl tracking-tight">Select Client</h2>
                <p className="text-gray-500 text-xs mt-1">Choose target clients for injection</p>
            </div>
            <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
                <X size={18} />
            </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4 relative z-10 max-h-[420px] overflow-y-auto">

            {/* Lunar Client - Always Active, Locked */}
            <div className="p-4 rounded-xl bg-[#18181b]/60 border border-[var(--accent-500)]/30 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-500)]/20 flex items-center justify-center overflow-hidden">
                        <img src="/img/icon/social/lunar-client_logo.png" alt="Lunar Client" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Lunar Client</h3>
                        <p className="text-xs text-[var(--accent-400)]">Detected & Ready</p>
                    </div>
                </div>
                {/* Locked Toggle Switch (On) */}
                <div className="relative w-11 h-6 bg-[var(--accent-600)] rounded-full opacity-100 cursor-not-allowed">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
            </div>

            {/* Badlion Client - Always Inactive, Locked */}
            <div className="p-4 rounded-xl bg-[#18181b]/30 border border-white/5 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="/img/icon/social/badlion-logo.png" alt="Badlion Client" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-gray-300 font-bold text-sm">Badlion Client</h3>
                        <p className="text-xs text-gray-500">Release coming soon</p>
                    </div>
                </div>
                {/* Locked Toggle Switch (Off) */}
                <div className="relative w-11 h-6 bg-gray-700 rounded-full cursor-not-allowed">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full shadow-md"></div>
                </div>
            </div>

            {/* Forge - Always Inactive, Locked */}
            <div className="p-4 rounded-xl bg-[#18181b]/30 border border-white/5 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="/img/icon/social/forge_logo.png" alt="Minecraft Forge" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-gray-300 font-bold text-sm">Minecraft Forge</h3>
                        <p className="text-xs text-gray-500">Release coming soon</p>
                    </div>
                </div>
                {/* Locked Toggle Switch (Off) */}
                <div className="relative w-11 h-6 bg-gray-700 rounded-full cursor-not-allowed">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full shadow-md"></div>
                </div>
            </div>

            {/* CheatBreaker - Always Inactive, Locked */}
            <div className="p-4 rounded-xl bg-[#18181b]/30 border border-white/5 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="/img/icon/social/cheatbreaker_logo.png" alt="CheatBreaker" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-gray-300 font-bold text-sm">CheatBreaker</h3>
                        <p className="text-xs text-gray-500">Release coming soon</p>
                    </div>
                </div>
                {/* Locked Toggle Switch (Off) */}
                <div className="relative w-11 h-6 bg-gray-700 rounded-full cursor-not-allowed">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full shadow-md"></div>
                </div>
            </div>

            {/* Vanilla - Always Inactive, Locked */}
            <div className="p-4 rounded-xl bg-[#18181b]/30 border border-white/5 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="/img/icon/social/icon-version-mc.png" alt="Vanilla" className="w-7 h-7 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-gray-300 font-bold text-sm">Vanilla</h3>
                        <p className="text-xs text-gray-500">Release coming soon</p>
                    </div>
                </div>
                {/* Locked Toggle Switch (Off) */}
                <div className="relative w-11 h-6 bg-gray-700 rounded-full cursor-not-allowed">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full shadow-md"></div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#0a0a0c]/40 border-t border-white/5 flex items-center justify-end gap-3 backdrop-blur-sm">
             <button
                 onClick={onClose}
                 className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wide"
             >
                 Close
             </button>
             <button
                 onClick={onClose}
                 className="px-8 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold rounded-lg shadow-[0_4px_20px_var(--accent-shadow)] hover:shadow-[0_6px_24px_var(--accent-shadow)] transition-all transform active:scale-[0.98] uppercase tracking-wide flex items-center gap-2"
             >
                 <Save size={14} />
                 Confirm Selection
             </button>
        </div>

      </div>
    </div>
  );
};
