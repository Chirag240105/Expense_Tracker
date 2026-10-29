import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { CurrencyContext } from "./CurrencyContext.jsx";

const CACHE_DURATION = 3600000;

const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.5,
  CNY: 7.24,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  SGD: 1.34,
  HKD: 7.83,
  AED: 3.67,
  SAR: 3.75,
  BRL: 4.97,
  MXN: 17.08,
  ZAR: 18.76,
};

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
];

const readCachedRates = () => {
  const cached = localStorage.getItem("exchangeRates");
  const cacheTime = Number(localStorage.getItem("exchangeRatesTime"));
  if (!cached || !cacheTime || Date.now() - cacheTime >= CACHE_DURATION) return null;
  try {
    return JSON.parse(cached);
  } catch {
    localStorage.removeItem("exchangeRates");
    localStorage.removeItem("exchangeRatesTime");
    return null;
  }
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    () => localStorage.getItem("selectedCurrency") || "USD",
  );
  const [exchangeRates, setExchangeRates] = useState(readCachedRates);
  const [loading, setLoading] = useState(false);

  const fetchExchangeRates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
      const rates = response.data.rates;
      setExchangeRates(rates);
      localStorage.setItem("exchangeRates", JSON.stringify(rates));
      localStorage.setItem("exchangeRatesTime", Date.now().toString());
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      setExchangeRates(FALLBACK_RATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!exchangeRates) fetchExchangeRates();
  }, [exchangeRates, fetchExchangeRates]);

  const updateCurrency = useCallback((currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem("selectedCurrency", currencyCode);
  }, []);

  const convertCurrency = useCallback((amount, fromCurrency = "USD") => {
    if (!exchangeRates || !amount) return amount;
    const amountInUSD = fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];
    return selectedCurrency === "USD" ? amountInUSD : amountInUSD * exchangeRates[selectedCurrency];
  }, [exchangeRates, selectedCurrency]);

  const formatCurrency = useCallback((amount, fromCurrency = "USD") => {
    const convertedAmount = convertCurrency(amount, fromCurrency);
    const currency = CURRENCIES.find(({ code }) => code === selectedCurrency);
    const symbol = currency?.symbol || "$";
    if (convertedAmount == null || Number.isNaN(Number(convertedAmount))) return `${symbol}0`;
    return `${symbol}${Number(convertedAmount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [convertCurrency, selectedCurrency]);

  const getCurrencySymbol = useCallback(() => (
    CURRENCIES.find(({ code }) => code === selectedCurrency)?.symbol || "$"
  ), [selectedCurrency]);

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      currencies: CURRENCIES,
      exchangeRates,
      loading,
      updateCurrency,
      convertCurrency,
      formatCurrency,
      getCurrencySymbol,
      fetchExchangeRates,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
