import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SchoolMap from '../components/SchoolMap';
import BottomNavbar from '../components/BottomNavbar';
import AppHeader from '../components/AppHeader';
import HamburgerMenu from '../components/HamburgerMenu';

const SEVERITY_COLOR = { verde: 'bg-green-500', naranja: 'bg-orange-500', rojo: 'bg-red-500' };

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (!isAuth) { base44.auth.redirectToLogin('/'); return; }
      const u = await base44.auth.me();
      setUser(u);
      base44.entities.Report.list('-created_date', 100).then(setReports);
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="w-full max-w-sm mx-auto min-h-screen flex flex-col">
        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} subtitle="Mapa del Colegio" />

        <div
          className="flex-1 px-4 py-4"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
        >
          <div className="relative">
            <SchoolMap readOnly />
            {reports.filter(r => r.map_x && r.map_y).map((r) => (
              <div
                key={r.id}
                className="absolute pointer-events-none z-10"
                style={{ left: `${r.map_x}%`, top: `${r.map_y}%`, transform: 'translate(-50%, -100%)' }}
              >
                <div className={`w-4 h-4 rounded-full ${SEVERITY_COLOR[r.severity] || 'bg-green-500'} border-2 border-white shadow-lg`} />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-4 justify-center">
            {Object.entries(SEVERITY_COLOR).map(([key, color]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-zinc-400 text-xs capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />

        <BottomNavbar />
      </div>
    </div>
  );
}