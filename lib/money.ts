export type SupportedCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "NZD"
  | "JPY"
  | "KRW"
  | "CNY"
  | "HKD"
  | "SGD"
  | "INR"
  | "BRL"
  | "MXN"
  | "ZAR"
  | "SEK"
  | "NOK"
  | "DKK"
  | "CHF"
  | "PLN"
  | "CZK"
  | "HUF"
  | "RON"
  | "TRY"
  | "ILS"
  | "AED"
  | "SAR";

export const USD_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
  NZD: 1.63,
  JPY: 147,
  KRW: 1330,
  CNY: 7.18,
  HKD: 7.82,
  SGD: 1.34,
  INR: 83.1,
  BRL: 4.95,
  MXN: 17.2,
  ZAR: 18.6,
  SEK: 10.4,
  NOK: 10.6,
  DKK: 6.86,
  CHF: 0.89,
  PLN: 4.02,
  CZK: 22.8,
  HUF: 360,
  RON: 4.58,
  TRY: 30.3,
  ILS: 3.65,
  AED: 3.67,
  SAR: 3.75,
};

export function convertFromUsd(amountUsd: number, currency: SupportedCurrency): number {
  const rate = USD_RATES[currency] ?? 1;
  return amountUsd * rate;
}

export function formatMoney(params: {
  amountUsd: number;
  currency: SupportedCurrency;
  locale: string;
}): string {
  const { amountUsd, currency, locale } = params;
  const converted = convertFromUsd(amountUsd, currency);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
    minimumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
  }).format(converted);
}
