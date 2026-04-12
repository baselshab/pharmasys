import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertTriangle, Clock, ArrowRight, Banknote } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDatabase } from "@/db/DatabaseProvider";
import { seedIfEmpty } from "@/db/seedData";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageProvider";

const Dashboard = () => {
  const { db, isReady } = useDatabase();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (db && isReady) seedIfEmpty(db);
  }, [db, isReady]);

  const revenueChange = stats.yesterdayRevenue > 0
    ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue * 100).toFixed(0)
    : null;

  const kpis = [
    {
      label: t("todaysRevenue"),
      value: `₪${stats.todayRevenue.toFixed(2)}`,
      sub: revenueChange ? `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% ${t("vsYesterday")}` : t("noDataYesterday"),
      icon: Banknote,
      trend: revenueChange ? (Number(revenueChange) >= 0 ? "up" : "down") : "neutral",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: t("transactions"),
      value: stats.todaySales.toString(),
      sub: t("today"),
      icon: ShoppingCart,
      trend: "neutral" as const,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: t("lowStock"),
      value: stats.lowStockCount.toString(),
      sub: t("itemsBelowReorder"),
      icon: AlertTriangle,
      trend: stats.lowStockCount > 0 ? "warn" : "neutral",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: t("expiringSoon"),
      value: stats.expiringSoonCount.toString(),
      sub: t("within90Days"),
      icon: Clock,
      trend: stats.expiringSoonCount > 0 ? "warn" : "neutral",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <AppLayout title={t("dashboard")} subtitle={t("overviewOfPharmacy")}>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1 font-display">{loading ? "—" : kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                    {kpi.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                    <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Sales */}
          <div className="lg:col-span-2 card-pharma">
            <div className="p-5 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{t("recentSales")}</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => navigate("/pos")}>
                {t("newSale")} <ArrowRight className="h-3 w-3 ltr:ml-1 rtl:mr-1" />
              </Button>
            </div>
            {stats.recentSales.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm px-6 pb-6">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">{t("noSalesYet")}</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("saleNumber")}</TableHead>
                    <TableHead className="text-xs">{t("items")}</TableHead>
                    <TableHead className="text-xs">{t("payment")}</TableHead>
                    <TableHead className="text-xs text-end">{t("total")}</TableHead>
                    <TableHead className="text-xs text-end">{t("time")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium text-xs">{sale.sale_number}</TableCell>
                      <TableCell className="text-xs">{sale.item_count}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] capitalize">{sale.payment_method}</Badge>
                      </TableCell>
                      <TableCell className="text-end text-xs font-medium">₪{sale.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-end text-xs text-muted-foreground">
                        {new Date(sale.sale_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Alerts Panel */}
          <div className="space-y-4">
            <Card className="card-pharma">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">{t("lowStock")}</h3>
                </div>
                {stats.lowStockItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("allStockHealthy")}</p>
                ) : (
                  <div className="space-y-2">
                    {stats.lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-foreground truncate flex-1">{item.name}</span>
                        <Badge variant={item.stock === 0 ? "destructive" : "outline"} className="text-[10px] ltr:ml-2 rtl:mr-2">
                          {item.stock} {t("left")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-pharma">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-foreground">{t("expiringSoon")}</h3>
                </div>
                {stats.expiringSoonItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("noItemsExpiring")}</p>
                ) : (
                  <div className="space-y-2">
                    {stats.expiringSoonItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-foreground truncate block">{item.product_name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.batch_number}</span>
                        </div>
                        <span className="text-[10px] text-destructive font-medium ltr:ml-2 rtl:mr-2">
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
