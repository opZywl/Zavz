import React from 'react';
import { SectionCard } from './ui';
import { Cpu, Layers, Coffee } from 'lucide-react';

const AboutTab: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[fade-in-up_0.3s_ease-out]">
         <SectionCard title="About YZY Inject" subtitle="System Info">
            <div className="space-y-6 text-zinc-300">
                <div className="flex items-start gap-4 p-4 bg-[#121215] rounded-xl border border-zinc-800">
                    <div className="p-3 bg-[var(--theme-primary)]/10 rounded-lg border border-[var(--theme-primary)]/20">
                        <Cpu className="text-[var(--theme-primary)]" size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Advanced Process Manipulation</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            YZY Inject is an advanced process manipulation tool inspired by <strong>Process Hacker 2</strong>, engineered with robust resources for memory editing, dynamic DLL injection, and sophisticated thread management.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#121215] rounded-xl border border-zinc-800 hover:border-[var(--theme-primary)]/30 transition-colors">
                        <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Layers size={14} className="text-[var(--theme-primary)]"/> Kernel Access
                        </h5>
                        <p className="text-xs text-zinc-500">
                            Uses a signed kernel driver to perform Ring0 memory operations, bypassing user-mode anti-cheat hooks.
                        </p>
                    </div>
                    <div className="p-4 bg-[#121215] rounded-xl border border-zinc-800 hover:border-[var(--theme-primary)]/30 transition-colors">
                        <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Coffee size={14} className="text-[var(--theme-primary)]"/> Java Structures
                        </h5>
                        <p className="text-xs text-zinc-500">
                            Native support for JVM manipulation, allowing direct class loading and field modification.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pt-4 border-t border-zinc-800/50">
                    <p className="text-[10px] text-zinc-600 font-mono">
                        COPYRIGHT © FDP. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
         </SectionCard>
    </div>
  );
};

export default AboutTab;