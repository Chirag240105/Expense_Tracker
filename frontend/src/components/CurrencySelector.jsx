import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { HiChevronDown, HiCheck, HiRefresh } from 'react-icons/hi';
import { BiMoney } from 'react-icons/bi';

const CurrencySelector = ({ variant = 'navbar' }) => {
  const { 
    selectedCurrency, 
    currencies, 
    updateCurrency, 
    loading,
    fetchExchangeRates 
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCurrency = (currencyCode) => {
    updateCurrency(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (variant === 'navbar') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition border border-gray-200"
        >
          <span className="text-xl">{selectedCurrencyData?.flag}</span>
          <span className="font-semibold text-sm">{selectedCurrency}</span>
          <HiChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BiMoney className="text-green-600" />
                    Select Currency
                  </h3>
                  <button
                    onClick={fetchExchangeRates}
                    disabled={loading}
                    className="p-1 hover:bg-gray-100 rounded transition"
                    title="Refresh exchange rates"
                  >
                    <HiRefresh className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search currency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none"
                />
              </div>

              {/* Currency List */}
              <div className="overflow-y-auto flex-1">
                {filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelectCurrency(currency.code)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition ${
                      selectedCurrency === currency.code ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currency.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-800">
                          {currency.code} - {currency.symbol}
                        </p>
                        <p className="text-xs text-gray-500">{currency.name}</p>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <HiCheck className="text-green-600 text-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Profile variant
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Preferred Currency
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none flex items-center justify-between bg-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCurrencyData?.flag}</span>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-800">
                {selectedCurrency} - {selectedCurrencyData?.symbol}
              </p>
              <p className="text-xs text-gray-500">{selectedCurrencyData?.name}</p>
            </div>
          </div>
          <HiChevronDown className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>
              <div className="overflow-y-auto">
                {filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelectCurrency(currency.code)}
                    className={`w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition ${
                      selectedCurrency === currency.code ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{currency.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-sm">{currency.code}</p>
                        <p className="text-xs text-gray-500">{currency.name}</p>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <HiCheck className="text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;
