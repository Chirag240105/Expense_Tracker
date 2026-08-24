import React from 'react';
import { FaBrain, FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import { addThousandSeperator } from '../../utils/helper';
import { useCurrency } from '../../context/CurrencyContext';

const AIPredictionWidget = ({ prediction, trend, onClick }) => {
  const {formatCurrency} = useCurrency();
  return (
    <div 
      onClick={onClick}
      className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-2xl p-6 text-white cursor-pointer overflow-hidden group transition-transform hover:scale-[1.02]"
    >
   
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <FaBrain className="text-2xl animate-pulse" />
          </div>
          <span className="font-semibold text-lg">AI Expense Prediction</span>
        </div>
        
        <p className="text-sm opacity-90 mb-2">Expected spending next month</p>
        
        <div className="flex items-end gap-3 mb-4">
          <span className="text-5xl font-bold">{formatCurrency(addThousandSeperator(prediction))}</span>
          {trend === 'increasing' ? (
            <FaArrowTrendUp className="text-yellow-300 mb-3 text-2xl" />
          ) : (
            <FaArrowTrendDown className="text-green-300 mb-3 text-2xl" />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'increasing' 
              ? 'bg-red-500/30 backdrop-blur-sm' 
              : 'bg-green-500/30 backdrop-blur-sm'
          }`}>
            Trend: {trend}
          </span>
          <span className="text-sm opacity-80">
            Based on last 30 days
          </span>
        </div>
      </div>

      
      <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
      <div className="absolute bottom-8 left-8 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
    </div>
  );
};

export default AIPredictionWidget;
