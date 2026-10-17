import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageCircle, Loader2 } from "lucide-react";

export default function CommentsSection({ reportId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.Comment.filter({ report_id: reportId }, "created_date", 100).then(setComments);
    const unsub = base44.entities.Comment.subscribe((event) => {
      if (event.data?.report_id !== reportId) return;
      if (event.type === "create") setComments((prev) => [...prev, event.data]);
      else if (event.type === "update") setComments((prev) => prev.map((c) => c.id === event.id ? event.data : c));
      else if (event.type === "delete") setComments((prev) => prev.filter((c) => c.id !== event.id));
    });
    return unsub;
  }, [reportId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await base44.entities.Comment.create({
      report_id: reportId,
      user_name: user.full_name || user.email,
      user_email: user.email,
      content: text.trim(),
    });
    setText("");
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-zinc-400" />
        <h3 className="text-white font-semibold text-sm">Comentarios ({comments.length})</h3>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
        {comments.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-4">Sé el primero en comentar</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-300">
                {(c.user_name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-zinc-800/70 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-zinc-300 text-xs font-semibold">{c.user_name}</span>
                  <span className="text-zinc-600 text-xs">
                    {new Date(c.created_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comentario..."
          rows={2}
          className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-zinc-500 placeholder:text-zinc-600 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-zinc-100 active:scale-95 transition-all shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" /> : <Send className="w-4 h-4 text-zinc-900" />}
        </button>
      </div>
    </div>
  );
}