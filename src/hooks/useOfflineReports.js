import { useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "inframap_offline_reports";

export function usePendingOfflineSync() {
  const syncPending = useCallback(async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const pending = JSON.parse(raw);
    if (!pending || pending.length === 0) return;

    const remaining = [];
    for (const item of pending) {
      try {
        const report = await base44.entities.Report.create(item.reportData);
        await base44.entities.Notification.create({
          message: `${item.reportData.reporter_name} reportó "${item.reportData.title}" en ${item.reportData.location_label || "sin ubicación"}`,
          report_id: report.id,
          reporter_name: item.reportData.reporter_name,
          report_title: item.reportData.title,
          location_label: item.reportData.location_label || "",
          is_read: false,
        });
      } catch {
        remaining.push(item);
      }
    }
    if (remaining.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => syncPending();
    window.addEventListener("online", handleOnline);
    // Try on mount too
    if (navigator.onLine) syncPending();
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPending]);
}

export function saveReportOffline(reportData) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const pending = raw ? JSON.parse(raw) : [];
  pending.push({ reportData, savedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function getPendingCount() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  return JSON.parse(raw).length;
}