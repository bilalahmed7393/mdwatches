"use client";
import * as React from "react";
import { formatPrice } from "@/lib/utils/format";

const Ctx = React.createContext<string>("USD");

export function CurrencyProvider({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={code}>{children}</Ctx.Provider>;
}

export function useCurrency(): string {
  return React.useContext(Ctx);
}

/** Hook for client components — returns a price formatter using the current currency. */
export function useFormatPrice() {
  const code = useCurrency();
  return React.useCallback((value: number) => formatPrice(value, code), [code]);
}
