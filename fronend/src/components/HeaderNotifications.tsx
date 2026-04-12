import { Bell, AlertTriangle, Clock, Package } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAlerts } from "@/hooks/useAlerts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeaderNotifications() {
  const { t } = useLanguage();
  const { alerts, expiryCount, lowStockCount, outOfStockCount } = useAlerts();
  const totalCount = alerts.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-0.5">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("notifications")}</span>
          <div className="flex gap-1">
            {expiryCount > 0 && <Badge variant="outline" className="text-[9px]"><Clock className="h-2.5 w-2.5 ltr:mr-0.5 rtl:ml-0.5" />{expiryCount}</Badge>}
            {lowStockCount > 0 && <Badge variant="outline" className="text-[9px]"><AlertTriangle className="h-2.5 w-2.5 ltr:mr-0.5 rtl:ml-0.5" />{lowStockCount}</Badge>}
            {outOfStockCount > 0 && <Badge variant="destructive" className="text-[9px]"><Package className="h-2.5 w-2.5 ltr:mr-0.5 rtl:ml-0.5" />{outOfStockCount}</Badge>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t("noNotifications")}</div>
        ) : (
          alerts.slice(0, 20).map((alert) => (
            <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-0.5 cursor-pointer py-2">
              <div className="flex items-center gap-1.5 w-full">
                {alert.type === "expiry" && <Clock className="h-3 w-3 text-warning shrink-0" />}
                {alert.type === "low_stock" && <AlertTriangle className="h-3 w-3 text-warning shrink-0" />}
                {alert.type === "out_of_stock" && <Package className="h-3 w-3 text-destructive shrink-0" />}
                <span className="text-xs font-medium truncate flex-1">{alert.title}</span>
                <Badge variant={alert.severity === "danger" ? "destructive" : "outline"} className="text-[9px] shrink-0">
                  {alert.type === "expiry" ? t("expiringSoon") : alert.type === "out_of_stock" ? t("outOfStock") : t("lowStock")}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">{alert.description}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
