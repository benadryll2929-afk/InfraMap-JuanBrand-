import { useState, useEffect } from "react";
import { LogOut, Shield, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BottomNavbar from "../components/BottomNavbar";
import ProfileEditor from "../components/ProfileEditor";
import AppHeader from "../components/AppHeader";
import HamburgerMenu from "../components/HamburgerMenu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LOGO = "https://media.base44.com/images/public/user_6a10f82f7fa62cce17ef491b/c6a508c6d_image.png";

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) { base44.auth.redirectToLogin('/'); return; }
      base44.auth.me().then(setUser);
    });
  }, []);

  const isAdmin = user?.role === "admin";
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDeleteAccount = () => {
    base44.auth.logout("/");
  };

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} subtitle="Configuración" />

        <div className="px-4 py-6 space-y-5" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
          {/* Profile card */}
          <ProfileEditor user={user} onUpdated={(u) => setUser(u)} />
          {isAdmin && (
            <div className="flex justify-center -mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/30 border border-amber-700/40 rounded-full">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Administrador</span>
              </div>
            </div>
          )}

          {/* App info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <img src={LOGO} alt="InfraMap" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-white font-bold">InfraMap</p>
              <p className="text-zinc-500 text-xs">Reportes de infraestructura escolar</p>
              <p className="text-zinc-600 text-xs mt-0.5">IETI Rafael Navia Varón v1.0</p>
            </div>
          </div>

          {/* Access info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Acceso permitido</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-zinc-300 text-xs">@ietirafaelnaviavaron.edu.co</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <p className="text-zinc-300 text-xs">admininframap@gmail.com</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold py-3.5 rounded-2xl hover:bg-zinc-800 hover:border-red-800/50 hover:text-red-400 transition-all active:scale-95 select-none"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>

          {/* Delete Account */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 bg-red-950/30 border border-red-800/50 text-red-400 font-semibold py-3.5 rounded-2xl hover:bg-red-900/40 transition-all active:scale-95 select-none">
                <Trash2 className="w-4 h-4" />
                Eliminar cuenta
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-700 mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">¿Eliminar tu cuenta?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Esta acción cerrará tu sesión. Para eliminar tu cuenta completamente, contacta al administrador de la institución.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-500 text-white">
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />

        <BottomNavbar />
      </div>
    </div>
  );
}