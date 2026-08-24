import React from 'react';
import { FaBrain, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { useCurrency } from '../../context/CurrencyContext';

const AIPredictionWidget = ({ prediction, trend, onClick }) => {
  const { formatCurrency } = useCurrency();

 
  const getTrendInfo = () => {
    switch (trend?.toLowerCase()) {
      case 'increasing':
      case 'up':
        return {
          icon: <FaArrowUp />,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Increasing',
          message: 'Your expenses are trending upward'
        };
      case 'decreasing':
      case 'down':
        return {
          icon: <FaArrowDown />,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Decreasing',
          message: 'Your expenses are trending downward'
        };
      default:
        return {
          icon: <FaEquals />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Stable',
          message: 'Your expenses are stable'
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
  
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <FaBrain className="text-2xl" />
          <h3 className="text-lg font-bold">AI Prediction</h3>
        </div>
      </div>

 
      <div className="p-6">
      
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Next Month Expected Expense</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(prediction?.amount || prediction?.predictedAmount || prediction || 0)}
          </p>
        </div>

        
        <div className={`${trendInfo.bgColor} ${trendInfo.borderColor} border rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-3">
            <div className={`${trendInfo.color} text-2xl`}>
              {trendInfo.icon}
            </div>
            <div>
              <p className={`font-semibold ${trendInfo.color}`}>
                {trendInfo.label}
              </p>
              <p className="text-sm text-gray-600">{trendInfo.message}</p>
            </div>
          </div>
        </div>

        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI-powered prediction
          </div>
          <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm hover:underline">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionWidget;
