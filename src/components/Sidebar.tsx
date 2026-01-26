import React from 'react';
import { LayoutDashboard, Settings, Info, RefreshCw, ChevronUp, Download, Bug, User, Github } from 'lucide-react';
import { Tab } from './ui';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  updateMenuOpen: boolean;
  setUpdateMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, updateMenuOpen, setUpdateMenuOpen }) => {
  return (
    <div className="w-64 bg-[#08080b] border-r border-[#1F1F2E] flex flex-col z-10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 mt-2">Main Menu</p>
            
            {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'settings', icon: Settings, label: 'Settings' },
                { id: 'about', icon: Info, label: 'About' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative border-0 ${
                        activeTab === item.id 
                        ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' 
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121215]'
                    }`}
                >
                    <item.icon size={18} className={`transition-colors ${activeTab === item.id ? "text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-glow)]" : "group-hover:text-zinc-300"}`} />
                    {item.label}
                    {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[var(--theme-primary)] rounded-r shadow-[0_0_10px_var(--theme-glow)]"></div>}
                </button>
            ))}
        </div>

        {/* Bottom Update Section */}
        <div className="mt-auto p-4 border-t border-[#1F1F2E] bg-[#050508]/50">
            <div className="relative">
                <button 
                    onClick={() => setUpdateMenuOpen(!updateMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-[#0f0f12] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all ${updateMenuOpen ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <RefreshCw size={16} className={updateMenuOpen ? "animate-spin" : ""} />
                        <span className="text-xs font-bold uppercase tracking-wider">Update</span>
                    </div>
                    <ChevronUp size={14} className={`transition-transform duration-300 ${updateMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Expandable Menu */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${updateMenuOpen ? 'max-h-40 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-[#0f0f12] border border-zinc-800 rounded-xl p-1 space-y-1">
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors">
                            <Download size={12} /> Check Update
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors">
                            <Bug size={12} /> Report Issue
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors">
                            <User size={12} /> Creator
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors">
                            <Github size={12} /> GitHub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;