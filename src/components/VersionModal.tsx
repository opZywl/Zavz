import React, { useState, useRef } from 'react';
import { X, File, Folder, Save, Download, ExternalLink } from 'lucide-react';

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-[#121214]/80 backdrop-blur-2xl w-[500px] rounded-2xl border border-white/10 shadow-2xl flex flex-col font-sans relative overflow-hidden ring-1 ring-white/5" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Background Gradient Spot */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-500)] opacity-10 blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10">
            <div>
                <h2 className="text-white font-bold text-xl tracking-tight">Client Configuration</h2>
                <p className="text-gray-500 text-xs mt-1">Select your target jar file for injection</p>
            </div>
            <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
                <X size={18} />
            </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 relative z-10">
            
            {/* Download Banner - NEW */}
            <div 
                onClick={() => window.open('https://fdpinfo.github.io/download', '_blank')}
                className="p-4 rounded-xl bg-[#18181b] border border-white/10 hover:border-[var(--accent-500)] cursor-pointer group transition-all flex items-center gap-4 shadow-lg"
            >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-500-20)] flex items-center justify-center text-[var(--accent-500)] group-hover:scale-110 transition-transform">
                    <Download size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-sm group-hover:text-[var(--accent-400)] transition-colors">Download Latest Client</h3>
                    <p className="text-gray-400 text-xs">Missing the jar? Get the latest version here.</p>
                </div>
                <ExternalLink size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>

            {/* Custom Jar Input */}
            <div className="space-y-3">
                <label className="text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <File size={14} className="text-[var(--accent-500)]" />
                    Target Jar File
                </label>
                
                <div className="flex gap-3">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={filePath}
                            onChange={(e) => { setFilePath(e.target.value); }}
                            placeholder="C:\Users\Zywl\AppData\Roaming\.minecraft\..."
                            className="w-full bg-[#0a0a0c]/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-200 focus:outline-none focus:border-[var(--accent-500)] focus:ring-1 focus:ring-[var(--accent-500-30)] transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".jar"
                    />
                    <button 
                        onClick={openFileBrowser}
                        className="bg-[#18181b] hover:bg-[#27272a] border border-white/10 hover:border-white/20 text-white px-4 rounded-xl transition-all flex items-center justify-center shadow-lg active:scale-95"
                    >
                        <Folder size={20} className="text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-500-20)] to-transparent border border-[var(--accent-500-20)]">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-400)] shadow-[0_0_10px_var(--accent-500)] animate-pulse"></div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">System Ready</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            The injector will automatically detect the selected jar process. Ensure the file path is correct before proceeding.
                        </p>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#0a0a0c]/40 border-t border-white/5 flex items-center justify-end gap-3 backdrop-blur-sm mt-auto">
             <button 
                 onClick={onClose}
                 className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-wide"
             >
                 Cancel
             </button>
             <button
                 onClick={() => { setFdpPath(filePath); onClose(); }}
                 className="px-8 py-2.5 bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-xs font-bold rounded-lg shadow-[0_4px_20px_var(--accent-shadow)] hover:shadow-[0_6px_24px_var(--accent-shadow)] transition-all transform active:scale-[0.98] uppercase tracking-wide flex items-center gap-2"
             >
                 <Save size={14} />
                 Save Settings
             </button>
        </div>

      </div>
    </div>
  );
};