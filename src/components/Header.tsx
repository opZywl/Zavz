import { Settings, X, ZavzLogo, Minus } from './Icons';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface HeaderProps {
  nickname: string;
  onOpenSettings?: () => void;
  onDrag?: (e: React.MouseEvent) => void;
}

export const Header: React.FC<HeaderProps> = ({ nickname, onOpenSettings, onDrag }) => {
  const handleClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch {}
  };
  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch {}
  };

  const role = nickname === 'Zywl' ? 'Administrator' : 'User';

  return (
    <div
      className="flex items-center justify-between px-8 py-5 w-full select-none z-20 relative shrink-0"
      onMouseDown={onDrag}
    >
      {/* Left: Logo - LiquidBounce style */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="transform transition-transform group-hover:rotate-12 duration-300">
          <ZavzLogo />
        </div>
        <div className="flex flex-col">
          <span
            className="font-extrabold text-2xl tracking-tighter text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            ZAVZ
          </span>
          <div className="bg-[var(--accent-600)] px-2 py-0.5 rounded shadow-lg shadow-[var(--accent-shadow)] w-fit -mt-0.5">
            <span
              className="font-black text-[10px] text-white block tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              INJECTOR
            </span>
          </div>
        </div>
      </div>

      {/* Center: Welcome Message */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="bg-[#141417] w-[380px] h-11 rounded-xl flex flex-col items-center justify-center relative border border-white/[0.06]">
          <span className="text-gray-300 font-medium text-sm">Welcome back, {nickname}.</span>
          <div className="absolute bottom-0 w-16 h-[2.5px] bg-[var(--accent-500)] rounded-t-full shadow-[0_0_12px_var(--accent-500)]"></div>
        </div>
      </div>

      {/* Right: User & Controls */}
      <div className="flex items-center gap-3" onMouseDown={(e) => e.stopPropagation()}>
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-3 bg-[#141417] p-2 pr-4 rounded-xl min-w-[150px] border border-white/[0.06] hover:border-[var(--accent-500-30)] transition-colors cursor-pointer group"
        >
          <div className="w-9 h-9 bg-[#3e2723] rounded-lg overflow-hidden border-2 border-[#141417] shadow-sm group-hover:border-[var(--accent-600)] transition-colors">
            <img
              src={`https://mc-heads.net/avatar/${nickname}/64`}
              alt="Skin"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/64';
              }}
            />
          </div>
          <div className="flex flex-col leading-tight flex-1">
            <span className="font-bold text-sm text-gray-100 group-hover:text-[var(--accent-400)] transition-colors">
              {nickname}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">{role}</span>
          </div>
          <Settings
            size={16}
            className="text-gray-500 group-hover:text-[var(--accent-500)] group-hover:rotate-90 transition-all duration-500"
          />
        </div>

        <button
          onClick={handleMinimize}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-[#141417] border border-white/[0.06] hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-[#141417] border border-white/[0.06] hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
