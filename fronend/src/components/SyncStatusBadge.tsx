import { Wifi, CloudOff, Download } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useDatabase } from "@/db/DatabaseProvider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface SyncStatusBadgeProps {
  collapsed?: boolean;
}

export function SyncStatusBadge({ collapsed }: SyncStatusBadgeProps) {
  const isOnline = useOnlineStatus();
  const { canInstall, install, isInstalled } = usePWAInstall();
  const { t } = useLanguage();
  const { db } = useDatabase();
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    if (!db) return;
    try {
      const result = db.exec("SELECT COUNT(*) FROM sync_log WHERE synced = 0");
      setUnsyncedCount(result.length > 0 ? (result[0].values[0][0] as number) : 0);
    } catch { setUnsyncedCount(0); }
  }, [db]);

  const handleInstall = async () => {
    await install();
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-success animate-pulse-dot" : "bg-muted-foreground"}`} />
        {canInstall && (
          <button onClick={handleInstall} className="h-6 w-6 rounded flex items-center justify-center hover:bg-sidebar-accent">
            <Download className="h-3 w-3 text-sidebar-foreground/70" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className={isOnline ? "sync-online" : "sync-offline"}>
        {isOnline ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span>{t("online")}</span>
            {unsyncedCount > 0 && <span className="text-[10px] text-warning">({unsyncedCount} {t("pending")})</span>}
          </>
        ) : (
          <>
            <CloudOff className="h-3 w-3" />
            <span>{t("offline")}</span>
            {unsyncedCount > 0 && <span className="text-[10px]">({unsyncedCount})</span>}
          </>
        )}
      </div>
      {canInstall && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInstall}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-7 px-2 text-[11px]"
        >
          <Download className="h-3 w-3 shrink-0" />
          {t("installApp")}
        </Button>
      )}
      {isInstalled && (
        <div className="text-[10px] text-success/70 px-2">✓ {t("appInstalled")}</div>
      )}
    </div>
  );
}
