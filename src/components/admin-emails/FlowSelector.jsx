import { Mail, KeyRound, Send } from "lucide-react";

const FLOWS = [
  { id: "registro_otp", label: "Registro OTP", icon: Mail, description: "Correo de verificación de registro" },
  { id: "restablecer_contrasena", label: "Restablecer Contraseña", icon: KeyRound, description: "Correo de restablecimiento de contraseña" },
];

export default function FlowSelector({ selectedFlow, onSelectFlow, onSendTest, isMobile }) {
  if (isMobile) {
    return (
      <div className="flex gap-2">
        {FLOWS.map((flow) => {
          const Icon = flow.icon;
          const active = selectedFlow === flow.id;
          return (
            <button
              key={flow.id}
              onClick={() => onSelectFlow(flow.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium font-inter">{flow.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-outfit text-lg font-semibold text-slate-900">Flujos de correo</h2>
        <p className="text-slate-500 text-xs mt-1 font-inter">Selecciona un flujo para gestionar</p>
      </div>
      <div className="flex-1 px-3 space-y-2">
        {FLOWS.map((flow) => {
          const Icon = flow.icon;
          const active = selectedFlow === flow.id;
          return (
            <button
              key={flow.id}
              onClick={() => onSelectFlow(flow.id)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                active ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-indigo-600" : "bg-slate-100"}`}>
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${active ? "text-indigo-900" : "text-slate-700"}`}>{flow.label}</p>
                <p className="text-slate-400 text-xs mt-0.5 font-inter">{flow.description}</p>
              </div>
              {active && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />}
            </button>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={onSendTest}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" /> Envío rápido de prueba
        </button>
      </div>
    </div>
  );
}