import React, { useState, useRef } from 'react';
import { X, Folder, Check, ExternalLink } from './Icons';
import { Download, File } from 'lucide-react';
import { openExternal } from '../utils/openExternal';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdpPath: string;
  setFdpPath: (path: string) => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose, fdpPath, setFdpPath }) => {
  const [filePath, setFilePath] = useState(fdpPath || 'release.jar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const path = (file as any).path || file.name;
          setFilePath(path);
          setFdpPath(path);
      }
  };

  const openFileBrowser = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="bg-[#18181b]/70 backdrop-blur-2xl w-[520px] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans text-white border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0">
            <div className="flex items-center gap-3">
                <img src="/img/icon/social/icon-version-mc.png" alt="Minecraft" className="w-8 h-8 object-contain" />
                <div>
                    <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Client Configuration</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Select your target jar file</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
                <X size={20} />
            </button>
        </div>

        <div className="h-[1px] bg-white/[0.06] mx-7"></div>

        {/* Content */}
        <div className="px-7 py-5 space-y-5">

            {/* Download Banner */}
            <div
                onClick={() => openExternal('https://fdpinfo.github.io/download')}
                className="p-4 rounded-xl bg-black/20 border border-white/[0.06] hover:border-[var(--accent-500)]/30 cursor-pointer group transition-all flex items-center gap-4"
            >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-500)]/15 flex items-center justify-center text-[var(--accent-500)] group-hover:scale-110 transition-transform">
                    <Download size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm group-hover:text-[var(--accent-400)] transition-colors">Download Latest Client</h3>
                    <p className="text-gray-500 text-[11px] mt-0.5">Missing the jar? Get the latest version here.</p>
                </div>
                <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>

            {/* Custom Jar Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <File size={14} className="text-[var(--accent-500)]" />
                    Target Jar File
                </label>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={filePath}
                        onChange={(e) => { setFilePath(e.target.value); }}
                        placeholder="C:\Users\...\release.jar"
                        className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-[var(--accent-500)]/50 transition-colors placeholder:text-gray-600 font-mono"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jar"
                    />
                    <button
                        onClick={openFileBrowser}
                        className="bg-black/20 hover:bg-black/30 border border-white/[0.08] hover:border-[var(--accent-500)]/30 text-gray-400 hover:text-white px-4 rounded-xl transition-all flex items-center justify-center active:scale-95"
                    >
                        <Folder size={18} />
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-[var(--accent-500)]/5 border border-[var(--accent-500)]/10">
                <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-400)] shadow-[0_0_8px_var(--accent-500)] animate-pulse"></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-200">System Ready</h4>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            The injector will automatically detect the selected jar process. Ensure the file path is correct before proceeding.
                        </p>
                    </div>
                </div>
            </div>

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
                onClick={() => { setFdpPath(filePath); onClose(); }}
                className="px-6 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold rounded-xl transition-all active:scale-[0.97] flex items-center gap-2"
            >
                <Check size={14} />
                Save Configuration
            </button>
        </div>

      </div>
    </div>
  );
};
