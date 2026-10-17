import { useState, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NotificationBell({ isAdmin }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    const data = await base44.entities.Notification.list("-created_date", 20);
    setNotifications(data);
  };

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
      const unsub = base44.entities.Notification.subscribe((event) => {
        if (event.type === "create") {
          setNotifications((prev) => [event.data, ...prev]);
        } else if (event.type === "update") {
          setNotifications((prev) => prev.map((n) => n.id === event.id ? event.data : n));
        }
      });
      return unsub;
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  const unread = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.is_read);
    for (const n of unreadItems) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-sm">Notificaciones</h3>
              <div className="flex gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-zinc-400 hover:text-white transition-colors">
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-zinc-800 last:border-0 ${!notif.is_read ? "bg-zinc-800/60" : ""}`}
                  >
                    <p className="text-zinc-200 text-xs leading-relaxed">{notif.message}</p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {new Date(notif.created_date).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}