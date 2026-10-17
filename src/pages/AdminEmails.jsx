import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import FlowSelector from "@/components/admin-emails/FlowSelector";
import EmailPreview from "@/components/admin-emails/EmailPreview";
import ActivityLog from "@/components/admin-emails/ActivityLog";
import HamburgerMenu from "@/components/HamburgerMenu";

const DEFAULT_TEMPLATES = {
  registro_otp: {
    subject: "Te enviamos un código de verificación — InfraMap",
    body: `Hola,\n\nTe has registrado en InfraMap. Te hemos enviado un código de verificación a tu correo.\n\nIngresa ese código en la app para activar tu cuenta.\n\nSi no ves el correo, revisa tu carpeta de spam.\n\nEl equipo de InfraMap 💙`,
  },
  restablecer_contrasena: {
    subject: "Restablecimiento de contraseña — InfraMap",
    body: `Hola,\n\nHas solicitado restablecer tu contraseña en InfraMap. Te hemos enviado un enlace para hacerlo.\n\nHaz clic en ese enlace para crear tu nueva contraseña. Si no ves el correo, revisa tu carpeta de spam.\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.\n\nEl equipo de InfraMap 💙`,
  },
};

export default function AdminEmails() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedFlow, setSelectedFlow] = useState("registro_otp");
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("config");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (!isAuth) { base44.auth.redirectToLogin("/"); return; }
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { navigate("/"); return; }
      const data = await base44.entities.EmailLog.list("-created_date", 50);
      setLogs(data);
      setLoading(false);
    });
    const unsub = base44.entities.EmailLog.subscribe((event) => {
      if (event.type === "create") setLogs((prev) => [event.data, ...prev]);
    });
    return unsub;
  }, []);

  const handleTemplateChange = (updated) => {
    setTemplates((prev) => ({ ...prev, [selectedFlow]: updated }));
  };

  const refreshLogs = async () => {
    const data = await base44.entities.EmailLog.list("-created_date", 50);
    setLogs(data);
  };

  // Desktop
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-[280px] shrink-0 bg-white border-r border-slate-200 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="px-5 pt-6 pb-4 border-b border-slate-200">
            <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs mb-3 font-inter">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <div className="flex flex-col">
                <h1 className="font-outfit text-xl font-bold text-slate-900 leading-tight">InfraMap</h1>
                <span className="text-slate-400 text-xs">Correos en español</span>
              </div>
            </div>
          </div>
          <FlowSelector selectedFlow={selectedFlow} onSelectFlow={setSelectedFlow} onSendTest={refreshLogs} />
        </div>

        <div className="flex-1 flex" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="w-[60%] p-5">
            <EmailPreview flow={selectedFlow} template={templates[selectedFlow]} onTemplateChange={handleTemplateChange} onSent={refreshLogs} />
          </div>
          <div className="w-[40%] p-5 pl-0">
            <ActivityLog logs={logs} loading={loading} />
          </div>
        </div>

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
      </div>
    );
  }

  // Mobile
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 pt-3 pb-3" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-outfit text-base font-bold text-slate-900 leading-tight">InfraMap</h1>
            <span className="text-slate-400 text-xs leading-tight">Correos en español</span>
          </div>
        </div>
        <div className="flex mt-3 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setMobileView("config")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all font-inter ${mobileView === "config" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Configuración
          </button>
          <button
            onClick={() => setMobileView("logs")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all font-inter ${mobileView === "logs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Registros
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        {mobileView === "config" ? (
          <>
            <FlowSelector selectedFlow={selectedFlow} onSelectFlow={setSelectedFlow} onSendTest={refreshLogs} isMobile />
            <EmailPreview flow={selectedFlow} template={templates[selectedFlow]} onTemplateChange={handleTemplateChange} onSent={refreshLogs} />
          </>
        ) : (
          <ActivityLog logs={logs} loading={loading} />
        )}
      </div>
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
    </div>
  );
}