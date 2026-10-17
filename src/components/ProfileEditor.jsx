import { useState, useRef } from "react";
import { Camera, Check, Loader2, Pencil, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProfileEditor({ user, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(res.file_url);
    } catch (uploadError) {
      console.error("No se pudo subir la foto del perfil:", uploadError);
      setError(uploadError.message || "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await base44.auth.updateMe({
        full_name: name.trim(),
        photo_url: photoUrl,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (saveError) {
      console.error("No se pudo guardar el perfil:", saveError);
      setError(saveError.message || "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.full_name || "");
    setPhotoUrl(user?.photo_url || "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-3">
        <div className="relative">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-600"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center border-2 border-zinc-600">
              <span className="text-white text-2xl font-bold">
                {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
              </span>
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5 text-zinc-900" />
          </button>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">{user?.full_name || "Usuario"}</p>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="mt-1 flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-medium border border-zinc-700 rounded-xl px-3 py-1.5 transition-colors"
        >
          <Pencil className="w-3 h-3" /> Editar perfil
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-4">
      {/* Photo */}
      <div className="relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-600"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center border-2 border-zinc-600">
            <span className="text-white text-2xl font-bold">
              {name ? name[0].toUpperCase() : "U"}
            </span>
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 text-zinc-900 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-zinc-900" />
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Name input */}
      <div className="w-full">
        <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Nombre de visualización</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleCancel}
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl hover:bg-zinc-700 transition-colors text-sm"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving || uploading || !name.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-zinc-900 font-bold py-2.5 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Guardar
        </button>
      </div>
      {error && <p role="alert" className="text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}