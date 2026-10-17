import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Clock, AlertOctagon } from "lucide-react";

export default function StatsBar({ reports }) {
  const [open, setOpen] = useState(false);

  const total = reports.length;
  const resueltos = reports.filter((r) => r.status === "resuelto").length;
  const pendientes = total - resueltos;
  const urgentes = reports.filter((r) => r.severity === "rojo" && r.status === "pendiente").length;
  const pct = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  const circumference = 2 * Math.PI * 20;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="mx-4 mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-zinc-900/70 backdrop-blur-lg border border-white/5 rounded-2xl px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">📊 Estadísticas</span>
          <span className="text-xs text-zinc-500">{pct}% resuelto</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 grid grid-cols-3 gap-2">
              {/* Donut */}
              <div className="col-span-1 bg-zinc-900/70 backdrop-blur-lg border border-white/5 rounded-2xl flex flex-col items-center justify-center py-4 gap-1">
                <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r="20" fill="none" stroke="#27272a" strokeWidth="6" />
                  <circle
                    cx="28" cy="28" r="20" fill="none"
                    stroke="#10b981" strokeWidth="6"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-white font-bold text-sm -mt-1">{pct}%</span>
                <span className="text-zinc-500 text-xs">Resuelto</span>
              </div>

              {/* Cards */}
              <div className="col-span-2 grid grid-rows-3 gap-2">
                <div className="bg-zinc-900/70 backdrop-blur-lg border border-emerald-800/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{resueltos}</p>
                    <p className="text-zinc-500 text-xs">Resueltos</p>
                  </div>
                </div>
                <div className="bg-zinc-900/70 backdrop-blur-lg border border-yellow-800/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{pendientes}</p>
                    <p className="text-zinc-500 text-xs">Pendientes</p>
                  </div>
                </div>
                <div className="bg-zinc-900/70 backdrop-blur-lg border border-red-800/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{urgentes}</p>
                    <p className="text-zinc-500 text-xs">Urgentes activos</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}