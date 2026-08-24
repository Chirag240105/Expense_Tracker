import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const CurrencyContext = createContext();

const CACHE_DURATION = 3600000; 

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'USD';
  });
  
  const [exchangeRates, setExchangeRates] = useState(() => {
    const cached = localStorage.getItem('exchangeRates');
    const cacheTime = localStorage.getItem('exchangeRatesTime');
    
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
      return JSON.parse(cached);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  ];

 
  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
     
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      
      const rates = response.data.rates;
      setExchangeRates(rates);
      
      localStorage.setItem('exchangeRates', JSON.stringify(rates));
      localStorage.setItem('exchangeRatesTime', Date.now().toString());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    
      const fallbackRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
        JPY: 149.50,
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
      setExchangeRates(fallbackRates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!exchangeRates) {
      fetchExchangeRates();
    }
  }, []);

  // Update selected currency
  const updateCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);
  };


  const convertCurrency = (amount, fromCurrency = 'USD') => {
    if (!exchangeRates || !amount) return amount;
    
    // Convert to USD first if not already in USD
    const amountInUSD = fromCurrency === 'USD' 
      ? amount 
      : amount / exchangeRates[fromCurrency];
    
    // Convert from USD to selected currency
    const convertedAmount = selectedCurrency === 'USD'
      ? amountInUSD
      : amountInUSD * exchangeRates[selectedCurrency];
    
    return convertedAmount;
  };

  // Format currency with symbol and thousand separator
  const formatCurrency = (amount, fromCurrency = 'INR') => {
    const convertedAmount = convertCurrency(amount, fromCurrency);
    const currency = currencies.find(c => c.code === selectedCurrency);
    const symbol = currency?.symbol || '₹';
    
    if (convertedAmount == null || isNaN(convertedAmount)) return `${symbol}0`;
    
    const [integerPart, fractionalPart] = convertedAmount.toFixed(2).split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `${symbol}${formattedInteger}.${fractionalPart}`;
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency?.symbol || '$';
  };

  const value = {
    selectedCurrency,
    currencies,
    exchangeRates,
    loading,
    updateCurrency,
    convertCurrency,
    formatCurrency,
    getCurrencySymbol,
    fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
