import { map } from "nanostores";
import { categorias } from "../data/productos";

type StockMap = Record<string, number>;

function loadStock(): StockMap {
  const initial: StockMap = {};
  categorias.forEach((cat) => {
    cat.items.forEach((item) => {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem(`oms_stock_${item.id}`);
        initial[item.id] = saved !== null ? parseInt(saved, 10) : item.stock;
      } else {
        initial[item.id] = item.stock;
      }
    });
  });
  return initial;
}

export const stockMap = map<StockMap>({});

export function initStock() {
  stockMap.set(loadStock());
}

export function getStock(id: string): number {
  return stockMap.get()[id] ?? 0;
}

export function decrementStock(id: string, cantidad: number) {
  const current = stockMap.get()[id] ?? 0;
  const newStock = Math.max(0, current - cantidad);
  stockMap.setKey(id, newStock);
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`oms_stock_${id}`, newStock.toString());
  }
}

export function isInStock(id: string): boolean {
  return getStock(id) > 0;
}

// Initialize on import (client only)
if (typeof window !== "undefined") {
  initStock();
}
