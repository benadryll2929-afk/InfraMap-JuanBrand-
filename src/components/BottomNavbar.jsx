import { Home, Map, Settings, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Inicio', icon: Home, path: '/' },
  { label: 'Mapa', icon: Map, path: '/map' },
  { label: 'Mis reportes', icon: ClipboardList, path: '/my-reports' },
  { label: 'Config', icon: Settings, path: '/settings' },
];

export default function BottomNavbar() {
  const location = useLocation();
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/70 backdrop-blur-lg border-t border-white/5 flex select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5"
          >
            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-zinc-500'}`} />
            <span className={`text-xs font-medium transition-colors ${active ? 'text-white' : 'text-zinc-500'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}