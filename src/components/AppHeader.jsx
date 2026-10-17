import { Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function AppHeader({ onMenuClick, isAdmin, subtitle }) {
  return (
    <div
      className="flex items-center justify-between px-4 pb-3 bg-zinc-900/70 backdrop-blur-lg border-b border-white/5 sticky top-0 z-30"
      style={{ paddingTop: 'calc(2.5rem + env(safe-area-inset-top))' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-white font-bold text-base leading-tight">InfraMap</h1>
          {subtitle && <span className="text-zinc-500 text-xs leading-tight">{subtitle}</span>}
        </div>
      </div>
      <NotificationBell isAdmin={isAdmin} />
    </div>
  );
}