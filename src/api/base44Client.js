import { supabase } from "@/supabaseClient";

// Compatibility facade for existing screens; every operation is backed by Supabase.
const entityTables = {
  Comment: "comments",
  EmailLog: "email_logs",
  Notification: "notifications",
  Report: "reports",
};

const throwIfError = (error, action) => {
  if (error) {
    throw new Error(`${action}: ${error.message}`);
  }
};

const getSortOptions = (sort) => {
  if (!sort) return null;
  const descending = sort.startsWith("-");
  return { column: descending ? sort.slice(1) : sort, ascending: !descending };
};

const getProfiledUser = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  throwIfError(authError, "No se pudo obtener la sesión");
  if (!authData.user) {
    throw new Error("No hay una sesión activa.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();
  throwIfError(profileError, "No se pudo cargar el perfil");

  return {
    ...authData.user,
    ...profile,
    email: authData.user.email,
    full_name:
      profile.full_name ||
      authData.user.user_metadata?.full_name ||
      authData.user.user_metadata?.name ||
      authData.user.email,
  };
};

const createEntityApi = (entityName) => {
  const table = entityTables[entityName];

  const applySort = (query, sort) => {
    const options = getSortOptions(sort);
    return options ? query.order(options.column, { ascending: options.ascending }) : query;
  };

  return {
    async list(sort, limit) {
      let query = supabase.from(table).select("*");
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error, `No se pudo cargar ${table}`);
      return data;
    },

    async filter(filters, sort, limit) {
      let query = supabase.from(table).select("*").match(filters);
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      throwIfError(error, `No se pudo filtrar ${table}`);
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();
      throwIfError(error, `No se pudo cargar el elemento de ${table}`);
      return data;
    },

    async create(values) {
      const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select("*")
        .single();
      throwIfError(error, `No se pudo crear el elemento en ${table}`);
      return data;
    },

    async update(id, values) {
      if (
        entityName === "Report" &&
        Object.keys(values).length === 1 &&
        Array.isArray(values.upvotes)
      ) {
        const { error } = await supabase.rpc("toggle_report_upvote", {
          target_report_id: id,
        });
        throwIfError(error, "No se pudo registrar el apoyo al reporte");
        const { data, error: reportError } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .single();
        throwIfError(reportError, "No se pudo recargar el reporte");
        return data;
      }

      const { data, error } = await supabase
        .from(table)
        .update(values)
        .eq("id", id)
        .select("*")
        .single();
      throwIfError(error, `No se pudo actualizar el elemento de ${table}`);
      return data;
    },

    async delete(id) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();
      throwIfError(error, `No se pudo eliminar el elemento de ${table}`);
      if (!data) {
        throw new Error(`No se encontró el elemento de ${table} o no tienes permiso para eliminarlo.`);
      }
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${table}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            const eventType = payload.eventType.toLowerCase();
            const row = eventType === "delete" ? payload.old : payload.new;
            callback({
              type:
                eventType === "insert"
                  ? "create"
                  : eventType === "update"
                    ? "update"
                    : "delete",
              id: row?.id,
              data: eventType === "delete" ? undefined : payload.new,
            });
          },
        )
        .subscribe((status, error) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(`La suscripción de ${table} falló:`, error || status);
          }
        });

      return () => {
        void supabase.removeChannel(channel);
      };
    },
  };
};

const entities = Object.fromEntries(
  Object.keys(entityTables).map((entityName) => [
    entityName,
    createEntityApi(entityName),
  ]),
);

const auth = {
  async me() {
    return getProfiledUser();
  },

  async isAuthenticated() {
    const { data, error } = await supabase.auth.getSession();
    throwIfError(error, "No se pudo comprobar la sesión");
    return Boolean(data.session);
  },

  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: email } },
    });
    throwIfError(error, "No se pudo crear la cuenta");
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });
    throwIfError(error, "No se pudo verificar el código");
    return data;
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    throwIfError(error, "No se pudo reenviar el código");
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    throwIfError(error, "No se pudo iniciar sesión");
    return data;
  },

  async loginWithProvider(provider, returnTo) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: new URL(returnTo || "/", window.location.origin).toString(),
      },
    });
    throwIfError(error, `No se pudo iniciar sesión con ${provider}`);
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/reset-password", window.location.origin).toString(),
    });
    throwIfError(error, "No se pudo solicitar el restablecimiento");
  },

  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError(error, "No se pudo actualizar la contraseña");
  },

  async updateMe(updates) {
    const user = await getProfiledUser();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*")
      .single();
    throwIfError(error, "No se pudo actualizar el perfil");
    return {
      ...user,
      ...data,
      email: user.email,
      full_name: data.full_name || user.full_name,
    };
  },

  async logout(redirectTo) {
    const { error } = await supabase.auth.signOut();
    throwIfError(error, "No se pudo cerrar la sesión");
    if (typeof redirectTo === "string") {
      window.location.assign(redirectTo);
    }
  },

  redirectToLogin() {
    window.location.assign("/login");
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const user = await getProfiledUser();
      if (!(file instanceof File) || !file.type.startsWith("image/")) {
        throw new Error("Selecciona un archivo de imagen válido.");
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("La foto no puede superar los 10 MB.");
      }
      const extension = file.name.match(/\.[a-zA-Z0-9]{1,10}$/)?.[0]?.toLowerCase() || "";
      const path = `${user.id}/${crypto.randomUUID()}${extension}`;
      const { error } = await supabase.storage
        .from("report-photos")
        .upload(path, file, { upsert: false });
      throwIfError(error, "No se pudo subir la foto");

      const { data } = supabase.storage.from("report-photos").getPublicUrl(path);
      return { file_url: data.publicUrl };
    },

    async SendEmail(email) {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: email,
      });
      if (error) {
        let message = error.message;
        if (error.context && typeof error.context.json === "function") {
          try {
            const responseBody = await error.context.json();
            message = responseBody?.error || message;
          } catch (parseError) {
            console.error("No se pudo leer el error del servicio de correo:", parseError);
          }
        }
        throw new Error(`No se pudo enviar el correo: ${message}`);
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      return data;
    },
  },
};

export const base44 = { auth, entities, integrations };
