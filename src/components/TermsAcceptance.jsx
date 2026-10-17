import { useState, useRef } from "react";
import { ShieldCheck, Check, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TERMS = [
  {
    title: "1. Derechos de autor",
    text: "InfraMap es un proyecto de grado desarrollado por Juan Brand (2026) en el IETI Rafael Navia Varón. Todos los derechos sobre la aplicación, su código, diseño y contenido pertenecen al autor. Está prohibida la copia, reproducción, distribución o modificación total o parcial sin autorización expresa del titular.",
  },
  {
    title: "2. Uso permitido",
    text: "El uso de InfraMap está destinado exclusivamente a la comunidad educativa del IETI Rafael Navia Varón (estudiantes, docentes y personal administrativo) para el reporte y seguimiento de daños en la infraestructura escolar.",
  },
  {
    title: "3. Responsabilidad del contenido",
    text: "Los usuarios son responsables de la veracidad de los reportes que realicen. Está prohibido reportar información falsa, difamatoria o que vulnere la intimidad de terceros. El mal uso puede derivar en sanciones disciplinarias.",
  },
  {
    title: "4. Protección de datos",
    text: "Los datos personales (nombre, correo) se utilizan únicamente para la gestión de reportes y notificaciones dentro de la app, conforme a la Ley 1581 de 2012 (Habeas Data). No se comparten con terceros.",
  },
  {
    title: "5. Limitación de responsabilidad",
    text: "InfraMap no garantiza que los reportes sean atendidos en un tiempo determinado. La app es una herramienta de comunicación; la ejecución de reparaciones depende de la administración de la institución.",
  },
  {
    title: "6. Aceptación",
    text: "El uso de la aplicación implica la aceptación total de estos términos. Si no está de acuerdo, debe dejar de utilizar la app.",
  },
];

export default function TermsAcceptance({ onAccepted, onDeclined }) {
  const [scrolled, setScrolled] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) setScrolled(true);
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError("");
    try {
      await base44.auth.updateMe({ tyc_accepted: true });
      onAccepted();
    } catch (acceptError) {
      console.error("No se pudo guardar la aceptación de términos:", acceptError);
      setError(acceptError.message || "No se pudo guardar la aceptación. Inténtalo de nuevo.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pb-4 border-b border-zinc-800"
        style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top))' }}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Términos y Condiciones</h2>
          <p className="text-zinc-500 text-xs">Obligatorio para usar InfraMap</p>
        </div>
      </div>

      {/* Intro */}
      <div className="px-5 pt-4">
        <p className="text-zinc-400 text-sm leading-relaxed">
          Antes de continuar, debes leer y aceptar los siguientes términos. Desliza hasta el final para habilitar el botón de aceptación.
        </p>
      </div>

      {/* Scrollable terms */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
      >
        {TERMS.map((term) => (
          <div key={term.title}>
            <p className="text-zinc-200 text-sm font-semibold">{term.title}</p>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{term.text}</p>
          </div>
        ))}
        <div className="h-2" />
      </div>

      {/* Scroll hint */}
      {!scrolled && (
        <div className="flex flex-col items-center gap-1 pb-2 text-zinc-600">
          <span className="text-xs">Desliza para leer todo</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      )}

      {/* Buttons */}
      <div
        className="px-5 py-4 border-t border-zinc-800 space-y-2.5"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {error && <p role="alert" className="text-center text-xs text-red-400">{error}</p>}
        <button
          onClick={handleAccept}
          disabled={!scrolled || accepting}
          className="w-full bg-white text-zinc-900 font-semibold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity"
        >
          <Check className="w-4 h-4" /> Aceptar y continuar
        </button>
        <button
          onClick={onDeclined}
          disabled={accepting}
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-400 font-medium text-sm py-3.5 rounded-2xl"
        >
          No aceptar
        </button>
      </div>
    </div>
  );
}