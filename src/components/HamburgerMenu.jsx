import { useState } from "react";
import { X, Clock, CheckCircle2, Leaf, AlertTriangle, AlertOctagon, User, Settings, LayoutDashboard, Info, ChevronDown, School, Target, Code, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Todos", icon: LayoutDashboard, path: "/", filter: null },
  { label: "Pendiente", icon: Clock, path: "/?filter=pendiente", filter: "pendiente", color: "text-yellow-400" },
  { label: "Resuelto", icon: CheckCircle2, path: "/?filter=resuelto", filter: "resuelto", color: "text-emerald-400" },
  { label: "Verde", icon: Leaf, path: "/?filter=verde", filter: "verde", color: "text-green-400" },
  { label: "Naranja", icon: AlertTriangle, path: "/?filter=naranja", filter: "naranja", color: "text-orange-400" },
  { label: "Rojo", icon: AlertOctagon, path: "/?filter=rojo", filter: "rojo", color: "text-red-400" },
  { label: "Mis Reportes", icon: User, path: "/?filter=mis-reportes", filter: "mis-reportes", color: "text-blue-400" },
  { label: "Configuración", icon: Settings, path: "/settings", filter: null, color: "text-zinc-400" },
];

const LOGO = "https://media.base44.com/images/public/user_6a10f82f7fa62cce17ef491b/c6a508c6d_image.png";

export default function HamburgerMenu({ isOpen, onClose, user }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="InfraMap" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-white font-bold text-base">InfraMap</p>
              <p className="text-zinc-500 text-xs">IETI Rafael Navia Varón</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium truncate max-w-[160px]">{user.full_name || "Usuario"}</p>
                <p className="text-zinc-500 text-xs truncate max-w-[160px]">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800 transition-colors group"
              >
                <Icon className={`w-5 h-5 ${item.color || "text-zinc-400"} group-hover:scale-110 transition-transform`} />
                <span className="text-zinc-200 text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Acerca de */}
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800 transition-colors"
          >
            <Info className="w-5 h-5 text-sky-400" />
            <span className="text-zinc-200 text-sm font-medium flex-1 text-left">Acerca de</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showAbout ? "rotate-180" : ""}`} />
          </button>

          {showAbout && (
            <div className="px-5 pb-4 space-y-4 bg-zinc-950/50">
              <div className="flex gap-3 pt-3">
                <Code className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">¿Quién lo hizo?</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    Desarrollado por el equipo de InfraMap, una iniciativa estudiantil de análisis y desarrollo de software del IETI Rafael Navia Varón.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <School className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">Institución</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    IETI Rafael Navia Varón — Institución Educativa Técnica Industrial, Cartago, Valle del Cauca.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Target className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">¿Para qué se hizo?</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    Para que estudiantes, docentes y personal reporten daños en la infraestructura del colegio de forma rápida y visual, permitiendo a los administradores priorizar y dar seguimiento a las reparaciones por gravedad y ubicación.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Términos y Condiciones */}
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-zinc-200 text-sm font-medium flex-1 text-left">Términos y Condiciones</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showTerms ? "rotate-180" : ""}`} />
          </button>

          {showTerms && (
            <div className="px-5 pb-4 bg-zinc-950/50 max-h-64 overflow-y-auto">
              <div className="pt-3 space-y-3">
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">1. Derechos de autor</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    InfraMap es un proyecto de grado desarrollado por Juan Brand (2026) en el IETI Rafael Navia Varón. Todos los derechos sobre la aplicación, su código, diseño y contenido pertenecen al autor. Está prohibida la copia, reproducción, distribución o modificación total o parcial sin autorización expresa del titular.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">2. Uso permitido</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    El uso de InfraMap está destinado exclusivamente a la comunidad educativa del IETI Rafael Navia Varón (estudiantes, docentes y personal administrativo) para el reporte y seguimiento de daños en la infraestructura escolar.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">3. Responsabilidad del contenido</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    Los usuarios son responsables de la veracidad de los reportes que realicen. Está prohibido reportar información falsa, difamatoria o que vulnere la intimidad de terceros. El mal uso puede derivar en sanciones disciplinarias.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">4. Protección de datos</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    Los datos personales (nombre, correo) se utilizan únicamente para la gestión de reportes y notificaciones dentro de la app, conforme a la Ley 1581 de 2012 (Habeas Data). No se comparten con terceros.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">5. Limitación de responsabilidad</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    InfraMap no garantiza que los reportes sean atendidos en un tiempo determinado. La app es una herramienta de comunicación; la ejecución de reparaciones depende de la administración de la institución.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-300 text-xs font-semibold">6. Aceptación</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                    El uso de la aplicación implica la aceptación total de estos términos. Si no está de acuerdo, debe dejar de utilizar la app.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800">
          <p className="text-zinc-400 text-xs text-center font-semibold">Juan Brand 2026 — Proyecto de Grado</p>
          <p className="text-zinc-600 text-xs text-center mt-1">IETI Rafael Navia Varón © 2024</p>
        </div>
      </div>
    </>
  );
}