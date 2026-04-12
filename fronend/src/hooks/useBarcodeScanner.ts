import { useState, useEffect, useCallback } from "react";
import type { POSProduct } from "./usePOSProducts";

/**
 * Detects barcode scanner input (fast keystrokes ending with Enter)
 * and triggers a callback with the scanned barcode.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  useEffect(() => {
    let buffer = "";
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on an input/textarea (except our search)
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;

      if (e.key === "Enter" && buffer.length >= 4) {
        e.preventDefault();
        onScan(buffer);
        buffer = "";
        return;
      }

      // Only accept printable characters
      if (e.key.length === 1) {
        buffer += e.key;
        if (timeout) clearTimeout(timeout);
        // Barcode scanners type very fast — reset buffer if slow typing
        timeout = setTimeout(() => { buffer = ""; }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [onScan]);
}
