import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Wifi, WifiOff } from "lucide-react";
import { HeaderProfileMenu } from "@/components/HeaderProfileMenu";
import NotificationsDropdown from '@/components/layouts/NotificationsDropdown';
import GlobalSearch from "./common/GlobalSearch";
import LanguageToggle from "./common/LanguageToggle";
import { SyncStatusBadge } from "./SyncStatus";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              {title && (
                <div>
                  <h1 className="text-sm font-semibold text-foreground">{title}</h1>
                  {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
                        <SyncStatusBadge /> {/* ← أضف هذا */}
                
                </div>
                
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${isOnline ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span className="hidden sm:inline">{isOnline ? t("synced") : t("offline")}</span>
              </div>
              <GlobalSearch />
              <LanguageToggle />
              <NotificationsDropdown />
              <HeaderProfileMenu />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
