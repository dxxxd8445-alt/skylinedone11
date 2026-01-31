"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupportedCurrency } from "@/lib/money";

type CurrencyContextValue = {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "magma_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCurrencyState(raw as SupportedCurrency);
    } catch {
    }
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    if (mounted) {
      try {
        window.localStorage.setItem(STORAGE_KEY, c);
      } catch {
      }
    }
  };

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
