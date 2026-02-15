import React from 'react';
import { X, Check } from './Icons';

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const clients = [
  {
    id: 'lunar',
    name: 'Lunar Client',
    logo: '/img/icon/social/lunar-client_logo.png',
    status: 'active',
    statusText: 'Detected & Ready',
  },
  {
    id: 'badlion',
    name: 'Badlion Client',
    logo: '/img/icon/social/badlion-logo.png',
    status: 'locked',
    statusText: 'Coming soon',
  },
  {
    id: 'forge',
    name: 'Minecraft Forge',
    logo: '/img/icon/social/forge_logo.png',
    status: 'locked',
    statusText: 'Coming soon',
  },
  {
    id: 'cheatbreaker',
    name: 'CheatBreaker',
    logo: '/img/icon/social/cheatbreaker_logo.png',
    status: 'locked',
    statusText: 'Coming soon',
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    logo: '/img/icon/social/icon-version-mc.png',
    status: 'locked',
    statusText: 'Coming soon',
  },
];

export const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="bg-[#18181b]/70 backdrop-blur-2xl w-[500px] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-white border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0">
          <div>
            <h2
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Select Client
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose target client for injection</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-[1px] bg-white/[0.06] mx-7"></div>

        {/* Client List */}
        <div className="px-7 py-5 space-y-2 max-h-[400px] overflow-y-auto">
          {clients.map((client) => {
            const isActive = client.status === 'active';
            const isLocked = client.status === 'locked';

            return (
              <div
                key={client.id}
                className={`p-3.5 rounded-xl flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-[var(--accent-500)]/10 border border-[var(--accent-500)]/20'
                    : isLocked
                      ? 'bg-black/10 border border-white/[0.04] opacity-45'
                      : 'bg-black/20 border border-white/[0.06] hover:bg-black/30 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
                      isActive ? 'bg-[var(--accent-500)]/15' : 'bg-white/5'
                    }`}
                  >
                    <img
                      src={client.logo}
                      alt={client.name}
                      className={`w-7 h-7 object-contain ${isLocked ? 'grayscale' : ''}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}
                    >
                      {client.name}
                    </h3>
                    <p
                      className={`text-[10px] mt-0.5 ${isActive ? 'text-[var(--accent-400)]' : 'text-gray-600'}`}
                    >
                      {client.statusText}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                    isActive ? 'bg-[var(--accent-500)]' : 'bg-white/10'
                  } ${isLocked ? 'cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full shadow-sm transition-all duration-300 ${
                      isActive ? 'right-1 bg-white' : 'left-1 bg-gray-500'
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 shrink-0 border-t border-white/[0.06] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold rounded-xl transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <Check size={14} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
