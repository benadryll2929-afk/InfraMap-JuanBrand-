import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/supabaseClient";
import { isAllowedEmail } from "@/lib/userAccess";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const applySession = useCallback(async (session) => {
    setAuthError(null);
    if (!session?.user) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    setIsLoadingAuth(true);
    if (!isAllowedEmail(session.user.email)) {
      const error = new Error("Usa tu correo institucional para acceder a InfraMap.");
      setAuthError({ type: "unauthorized", message: error.message });
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error("No se pudo cerrar la sesión no autorizada:", signOutError);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("No se pudo cargar el perfil de Supabase:", error);
      setAuthError({ type: "profile_error", message: error.message });
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    setUser({
      ...session.user,
      ...profile,
      email: session.user.email,
      full_name:
        profile.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email,
    });
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    let active = true;
    const handleSession = (session) => {
      Promise.resolve().then(() => {
        if (active) return applySession(session);
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setAuthError({ type: "unknown", message: error.message });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    await applySession(data.session);
  };

  const logout = async (shouldRedirect = true) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.assign("/login");
  };

  const navigateToLogin = () => window.location.assign("/login");

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
