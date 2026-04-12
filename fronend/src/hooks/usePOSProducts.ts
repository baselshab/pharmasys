import { useState, useEffect, useMemo } from "react";
import { useDatabase } from "@/db/DatabaseProvider";

export interface POSProduct {
  id: string;
  name: string;
  generic_name: string | null;
  barcode: string | null;
  unit: string;
  sell_price: number;
  cost_price: number;
  category_id: string;
  category_name: string;
  requires_prescription: boolean;
  stock: number;
}

export function usePOSProducts(search: string, categoryFilter: string) {
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!db || !isReady) return;

    // Load categories
    const catResult = db.exec("SELECT id, name FROM categories ORDER BY name");
    if (catResult.length > 0) {
      setCategories(catResult[0].values.map((r) => ({ id: r[0] as string, name: r[1] as string })));
    }

    // Load products with stock
    const sql = `
      SELECT p.id, p.name, p.generic_name, p.barcode, p.unit, p.sell_price, p.cost_price,
             p.category_id, c.name as category_name, p.requires_prescription,
             COALESCE(SUM(b.quantity), 0) as stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_batches b ON b.product_id = p.id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.name
    `;
    const result = db.exec(sql);
    if (result.length > 0) {
      setProducts(
        result[0].values.map((r) => ({
          id: r[0] as string,
          name: r[1] as string,
          generic_name: r[2] as string | null,
          barcode: r[3] as string | null,
          unit: r[4] as string,
          sell_price: r[5] as number,
          cost_price: r[6] as number,
          category_id: r[7] as string,
          category_name: r[8] as string,
          requires_prescription: (r[9] as number) === 1,
          stock: r[10] as number,
        }))
      );
    }
  }, [db, isReady]);

  const filtered = useMemo(() => {
    let list = products;
    if (categoryFilter && categoryFilter !== "all") {
      list = list.filter((p) => p.category_id === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.generic_name?.toLowerCase().includes(q) ||
          p.barcode?.includes(q)
      );
    }
    return list;
  }, [products, search, categoryFilter]);

  return { products: filtered, categories, allProducts: products };
}
