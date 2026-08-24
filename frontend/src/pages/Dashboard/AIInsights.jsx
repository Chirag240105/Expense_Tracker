import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from '../../hooks/useUserAuth';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import { FaBrain, FaChartLine, FaLightbulb, FaRobot } from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi2'; 
import { addThousandSeperator } from '../../utils/helper';
import CustomBarChart from '../../components/charts/CustomBarChart';
import { useCurrency } from '../../context/CurrencyContext';

const AIInsights = () => {
   const {formatCurrency} = useCurrency();
  useUserAuth();
  
  const [prediction, setPrediction] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const [predictionRes, analysisRes, recommendationsRes] = await Promise.all([
        axiosInstances.get(API_PATH.AI.PREDICT_EXPENSE),
        axiosInstances.get(API_PATH.AI.ANALYZE_SPENDING),
        axiosInstances.get(API_PATH.AI.RECOMMENDATIONS)
      ]);
      
      setPrediction(predictionRes.data);
      setAnalysis(analysisRes.data);
      setRecommendations(recommendationsRes.data);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="AI Insights">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <FaBrain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-purple-600 animate-pulse" />
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">AI is analyzing your finances...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="AI Insights">
      <div className="my-5 mx-auto max-w-7xl">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl">
              <FaBrain className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                AI Financial Insights
              </h1>
              <p className="text-gray-600 mt-1">Powered by DATAVERSE Intelligence</p>
            </div>
          </div>
        </div>

        
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm">
          {['overview', 'analysis', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

       
        {activeTab === 'overview' && (
          <div className="space-y-6">
           
            {prediction?.success && (
              <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-32 -right-32 animate-pulse"></div>
                  <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -bottom-20 -left-20 animate-pulse" style={{animationDelay: '0.7s'}}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <FaChartLine className="text-3xl" />
                    <div>
                      <h2 className="text-2xl font-bold">Next Month Prediction</h2>
                      <p className="text-white/80">AI-powered forecast</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-white/80 mb-2">Predicted Expense</p>
                      <p className="text-6xl font-bold mb-4">{formatCurrency(addThousandSeperator(prediction.prediction))}</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                        prediction.trend === 'increasing' 
                          ? 'bg-red-500/20 backdrop-blur-sm' 
                          : 'bg-green-500/20 backdrop-blur-sm'
                      }`}>
                        {prediction.trend === 'increasing' ? '📈' : '📉'}
                        Trend: {prediction.trend}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                        <FaRobot className="text-6xl mb-3 animate-bounce" />
                        <p className="text-center text-sm">{prediction.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 hover:scale-[1.02] transition-transform">
                <p className="text-gray-600 mb-2">Total Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysis?.total_expense || 0)}</p>
                <p className="text-sm text-gray-500 mt-2">Across all categories</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-pink-500 hover:scale-[1.02] transition-transform">
                <p className="text-gray-600 mb-2">Avg Transaction</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(addThousandSeperator(analysis?.average_transaction || 0))}</p>
                <p className="text-sm text-gray-500 mt-2">Per transaction</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:scale-[1.02] transition-transform">
                <p className="text-gray-600 mb-2">Savings Rate</p>
                <p className="text-3xl font-bold text-gray-900">{recommendations?.savings_rate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-gray-500 mt-2">Of total income</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && analysis?.success && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <HiSparkles className="text-purple-600" />
                Spending by Category
              </h3>
              
              <div className="space-y-4 mb-6">
                {analysis.category_breakdown?.slice(0, 5).map((cat, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="font-bold text-purple-600">{formatCurrency(addThousandSeperator(cat.total))}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{cat.count} transactions</span>
                      <span>{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {analysis.category_breakdown && (
                <CustomBarChart 
                  data={analysis.category_breakdown.map(cat => ({
                    category: cat.category,
                    amount: cat.total
                  }))}
                />
              )}
            </div>

       
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaBrain className="text-purple-600" />
                AI-Discovered Patterns
              </h3>
              
              <div className="space-y-4">
                {analysis.insights?.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">💡</span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && recommendations?.success && (
          <div className="space-y-6">
          
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Your Savings Performance</h3>
                  <p className="text-white/80">Track your financial health</p>
                </div>
                <div className="text-6xl font-bold">
                  {recommendations.savings_rate?.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden mb-4">
                <div
                  className="h-full bg-white rounded-full shadow-lg transition-all duration-1500 ease-out"
                  style={{ width: `${Math.min(recommendations.savings_rate, 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Total Income</p>
                  <p className="text-xl font-bold">{formatCurrency(recommendations.total_income)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Total Expense</p>
                  <p className="text-xl font-bold">{formatCurrency(recommendations.total_expense)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Net Savings</p>
                  <p className="text-xl font-bold">{formatCurrency(recommendations.net_savings)}</p>
                </div>
              </div>
            </div>


            <div className="grid gap-4">
              {recommendations.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 shadow-lg border-l-4 ${
                    rec.type === 'warning' 
                      ? 'bg-red-50 border-red-500' 
                      : rec.type === 'success' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      rec.type === 'warning' 
                        ? 'bg-red-100' 
                        : rec.type === 'success' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : '💡'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2">{rec.title}</h4>
                      <p className="text-gray-700 mb-3 leading-relaxed">{rec.message}</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        rec.type === 'warning' 
                          ? 'bg-red-100 text-red-700' 
                          : rec.type === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <FaLightbulb />
                        {rec.action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
