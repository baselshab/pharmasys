import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useReportStats } from "@/hooks/useReportStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const COLORS = [
  "hsl(168, 55%, 32%)", "hsl(43, 96%, 56%)", "hsl(205, 80%, 50%)", "hsl(152, 60%, 40%)", "hsl(0, 72%, 51%)",
];

const Reports = () => {
  const [days, setDays] = useState(30);
  const stats = useReportStats(days);
  const { t } = useLanguage();

  const chartData = stats.dailySales.map((d) => ({
    date: d.date.slice(5),
    revenue: d.revenue,
    transactions: d.transactions,
  }));

  return (
    <AppLayout title={t("reports")} subtitle={t("analyticsInsights")}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("last7Days")}</SelectItem>
              <SelectItem value="30">{t("last30Days")}</SelectItem>
              <SelectItem value="90">{t("last90Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">ILS {stats.totalRevenue.toFixed(0)}</p><p className="text-xs text-muted-foreground">{t("totalRevenue")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center"><ShoppingCart className="h-5 w-5 text-info" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p><p className="text-xs text-muted-foreground">{t("transactions")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold text-foreground">ILS {stats.avgTransactionValue.toFixed(0)}</p><p className="text-xs text-muted-foreground">{t("avgTransaction")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Package className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-bold text-foreground">{stats.totalItemsSold}</p><p className="text-xs text-muted-foreground">{t("itemsSold")}</p></div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">{t("revenueTrend")}</TabsTrigger>
            <TabsTrigger value="transactions">{t("transactionsTab")}</TabsTrigger>
            <TabsTrigger value="payments">{t("paymentMethods")}</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">{t("dailyRevenue")}</CardTitle></CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">{t("noSalesData")}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [`ILS ${value.toFixed(2)}`, t("revenue")]} />
                      <Bar dataKey="revenue" fill="hsl(168, 55%, 32%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">{t("dailyTransactions")}</CardTitle></CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">{t("noSalesData")}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="transactions" stroke="hsl(205, 80%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">{t("paymentBreakdown")}</CardTitle></CardHeader>
              <CardContent>
                {stats.paymentBreakdown.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">{t("noPaymentData")}</p>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={stats.paymentBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={90}
                          label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.paymentBreakdown.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`ILS ${value.toFixed(2)}`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">{t("topSellingProducts")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t("product")}</TableHead>
                  <TableHead>{t("qtySold")}</TableHead>
                  <TableHead>{t("revenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
                ) : (
                  stats.topProducts.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>ILS {p.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
