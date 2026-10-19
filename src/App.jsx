import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { usePendingOfflineSync } from '@/hooks/useOfflineReports';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from './pages/Home';
import NewReport from './pages/NewReport';
import ReportDetail from './pages/ReportDetail';
import Settings from './pages/Settings';
import MapPage from './pages/MapPage';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmails from './pages/AdminEmails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Privacidad from './pages/Privacidad';  
import Terminos from './pages/Terminos';
import { AnimatePresence, motion } from 'framer-motion';

const slideProps = {
  initial: { x: '15%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-8%', opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  usePendingOfflineSync();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (authError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 p-6">
        <div className="max-w-md rounded-2xl border border-red-900/60 bg-zinc-900 p-6 text-center">
          <h1 className="text-lg font-semibold text-white">No se pudo conectar con Supabase</h1>
          <p className="mt-2 break-words text-sm text-zinc-400">{authError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="/privacidad" element={<Privacidad />} />
             <Route path="/terminos" element={<Terminos />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/" element={<motion.div {...slideProps}><Home /></motion.div>} />
          <Route path="/new-report" element={<motion.div {...slideProps}><NewReport /></motion.div>} />
          <Route path="/report/:reportId" element={<motion.div {...slideProps}><ReportDetail /></motion.div>} />
          <Route path="/settings" element={<motion.div {...slideProps}><Settings /></motion.div>} />
          <Route path="/map" element={<motion.div {...slideProps}><MapPage /></motion.div>} />
          <Route path="/my-reports" element={<motion.div {...slideProps}><MyReports /></motion.div>} />
          <Route path="/admin" element={<motion.div {...slideProps}><AdminDashboard /></motion.div>} />
          <Route path="/admin/emails" element={<motion.div {...slideProps}><AdminEmails /></motion.div>} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App