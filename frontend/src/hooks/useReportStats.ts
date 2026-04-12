import { useState, useEffect, useCallback, useMemo } from "react";
import { useDatabase } from "@/db/DatabaseProvider";

interface DailySales {
  date: string;
  revenue: number;
  transactions: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface PaymentBreakdown {
  method: string;
  count: number;
  amount: number;
}

interface ReportStats {
  dailySales: DailySales[];
  topProducts: TopProduct[];
  paymentBreakdown: PaymentBreakdown[];
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  totalItemsSold: number;
}

export function useReportStats(days: number = 30) {
  const { db, isReady } = useDatabase();
  const [stats, setStats] = useState<ReportStats>({
    dailySales: [],
    topProducts: [],
    paymentBreakdown: [],
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    totalItemsSold: 0,
  });

  const load = useCallback(() => {
    if (!db || !isReady) return;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split("T")[0];

    // Daily sales
    const dailyResult = db.exec(
      `SELECT DATE(sale_date) as d, SUM(total_amount) as rev, COUNT(*) as cnt
       FROM sales WHERE DATE(sale_date) >= ? AND status = 'completed'
       GROUP BY DATE(sale_date) ORDER BY d`,
      [startStr]
    );
    const dailySales: DailySales[] = dailyResult.length > 0
      ? dailyResult[0].values.map((r) => ({ date: r[0] as string, revenue: r[1] as number, transactions: r[2] as number }))
      : [];

    // Top products
    const topResult = db.exec(
      `SELECT p.name, SUM(si.quantity) as qty, SUM(si.total_price) as rev
       FROM sale_items si
       JOIN products p ON p.id = si.product_id
       JOIN sales s ON s.id = si.sale_id
       WHERE DATE(s.sale_date) >= ? AND s.status = 'completed'
       GROUP BY si.product_id ORDER BY rev DESC LIMIT 10`,
      [startStr]
    );
    const topProducts: TopProduct[] = topResult.length > 0
      ? topResult[0].values.map((r) => ({ name: r[0] as string, quantity: r[1] as number, revenue: r[2] as number }))
      : [];

    // Payment breakdown
    const payResult = db.exec(
      `SELECT payment_method, COUNT(*) as cnt, SUM(total_amount) as amt
       FROM sales WHERE DATE(sale_date) >= ? AND status = 'completed'
       GROUP BY payment_method ORDER BY amt DESC`,
      [startStr]
    );
    const paymentBreakdown: PaymentBreakdown[] = payResult.length > 0
      ? payResult[0].values.map((r) => ({ method: r[0] as string, count: r[1] as number, amount: r[2] as number }))
      : [];

    // Totals
    const totalsResult = db.exec(
      `SELECT COALESCE(SUM(total_amount),0), COUNT(*), COALESCE(AVG(total_amount),0)
       FROM sales WHERE DATE(sale_date) >= ? AND status = 'completed'`,
      [startStr]
    );
    const totalRevenue = totalsResult.length > 0 ? (totalsResult[0].values[0][0] as number) : 0;
    const totalTransactions = totalsResult.length > 0 ? (totalsResult[0].values[0][1] as number) : 0;
    const avgTransactionValue = totalsResult.length > 0 ? (totalsResult[0].values[0][2] as number) : 0;

    const itemsResult = db.exec(
      `SELECT COALESCE(SUM(si.quantity),0) FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       WHERE DATE(s.sale_date) >= ? AND s.status = 'completed'`,
      [startStr]
    );
    const totalItemsSold = itemsResult.length > 0 ? (itemsResult[0].values[0][0] as number) : 0;

    setStats({ dailySales, topProducts, paymentBreakdown, totalRevenue, totalTransactions, avgTransactionValue, totalItemsSold });
  }, [db, isReady, days]);

  useEffect(() => { load(); }, [load]);

  return stats;
}
