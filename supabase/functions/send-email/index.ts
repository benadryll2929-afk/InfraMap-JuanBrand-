import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedDomain = "@ietirafaelnaviavaron.edu.co";
const adminEmail = "admininframap@gmail.com";
const loggedFlows = new Set(["registro_otp", "restablecer_contrasena"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json(
      { error: "Método no permitido." },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sender = Deno.env.get("RESEND_FROM_EMAIL");

    if (!token || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json(
        { error: "Falta una sesión válida o la configuración del servidor." },
        { status: 401, headers: corsHeaders },
      );
    }
    if (!resendApiKey || !sender) {
      return Response.json(
        { error: "Configura RESEND_API_KEY y RESEND_FROM_EMAIL en Supabase Functions Secrets." },
        { status: 503, headers: corsHeaders },
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData.user?.email) {
      return Response.json(
        { error: "La sesión no es válida." },
        { status: 401, headers: corsHeaders },
      );
    }

    const body = await request.json();
    const { to, subject, body: text, flow_type: flowType } = body ?? {};
    if (
      typeof to !== "string" ||
      typeof subject !== "string" ||
      typeof text !== "string" ||
      !to.trim() ||
      !subject.trim() ||
      !text.trim() ||
      to.length > 320 ||
      subject.length > 300 ||
      text.length > 20000
    ) {
      return Response.json(
        { error: "El destinatario, asunto o contenido del correo no es válido." },
        { status: 400, headers: corsHeaders },
      );
    }

    const normalizedEmail = authData.user.email.toLowerCase();
    const isAdmin = normalizedEmail === adminEmail;
    const isAllowed =
      isAdmin || normalizedEmail.endsWith(allowedDomain);
    if (!isAllowed || (!isAdmin && normalizedEmail !== to.toLowerCase())) {
      return Response.json(
        { error: "No tienes permiso para enviar este correo." },
        { status: 403, headers: corsHeaders },
      );
    }

    if (isAdmin) {
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      if (profileError || profile?.role !== "admin") {
        return Response.json(
          { error: "Se requieren permisos de administrador para este envío." },
          { status: 403, headers: corsHeaders },
        );
      }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject,
        text,
      }),
    });
    const responseBody = await response.text();
    if (!response.ok) {
      if (loggedFlows.has(flowType)) {
        const { error: logError } = await adminClient.from("email_logs").insert({
          recipient_email: to,
          flow_type: flowType,
          status: "error",
        });
        if (logError) console.error("No se pudo guardar el registro de correo:", logError);
      }
      console.error("El proveedor de correo rechazó el envío:", response.status, responseBody);
      return Response.json(
        { error: "El proveedor de correo no pudo enviar el mensaje." },
        { status: 502, headers: corsHeaders },
      );
    }

    if (loggedFlows.has(flowType)) {
      const { error: logError } = await adminClient.from("email_logs").insert({
        recipient_email: to,
        flow_type: flowType,
        status: "enviado",
      });
      if (logError) {
        console.error("El correo se envió, pero no se pudo guardar su registro:", logError);
        return Response.json(
          { error: "El correo se envió, pero no se pudo guardar el registro." },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    return Response.json({ sent: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error inesperado en send-email:", error);
    return Response.json(
      { error: "Ocurrió un error inesperado al enviar el correo." },
      { status: 500, headers: corsHeaders },
    );
  }
});
