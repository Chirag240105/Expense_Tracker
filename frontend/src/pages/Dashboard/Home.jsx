import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import InfoCard from '../../components/Cards/InfoCard';
import { IoMdCard } from "react-icons/io";
import { useCurrency } from '../../context/CurrencyContext'; 
import RecentTransaction from '../../components/dashboard/RecentTransaction';
import FinanceOverview from '../../components/dashboard/FinanceOverview';
import ExpenseTransaction from '../../components/dashboard/ExpenseTransaction';
import Last30DaysExpense from '../../components/dashboard/last30DaysExpense';
import RecentIncomeWithChart from '../../components/dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/dashboard/RecentIncome';
import AIPredictionWidget from './AIPredictionWidget';
import { FaBrain } from 'react-icons/fa';
import { HiSparkles } from "react-icons/hi";


const Home = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency(); 

  const [dashboardData, setDashboardData] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosInstances.get(API_PATH.DASHBOARD.GET_DATA);
      if (response.data) {
        setDashboardData(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIPrediction = async () => {
    try {
      const response = await axiosInstances.get(API_PATH.AI.PREDICT_EXPENSE);
      if (response.data?.success) {
        setAiPrediction(response.data);
      }
    } catch (error) {
      console.log("AI prediction not available", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAIPrediction();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
       
        <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1">
                <HiSparkles /> AI-Powered
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                DATAVERSE
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back to your financial dashboard!
            </h1>
            <p className="text-white/90 text-lg mb-4">
              Your AI assistant has analyzed your finances and found new insights.
            </p>
            <button 
              onClick={() => navigate("/ai-insights")}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <FaBrain /> View AI Insights →
            </button>
          </div>
        </div>

     
        <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={formatCurrency(dashboardData?.totalBalance || 0)}
            onSeeMore={() => navigate("/expense")}
            color="bg-blue-500"
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Income"
            value={formatCurrency(dashboardData?.totalIncome || 0)}
            color="bg-green-500"
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Expense"
            value={formatCurrency(dashboardData?.totalExpense || 0)}
            color="bg-red-500"
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
         
          {aiPrediction?.success && (
            <AIPredictionWidget 
              prediction={aiPrediction.prediction}
              trend={aiPrediction.trend}
              onClick={() => navigate("/ai-insights")}
            />
          )}

          <RecentTransaction
            transactions={dashboardData?.recentTransaction}
            onSeeMore={() => navigate("/expense")} 
          />
          
          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpense || 0}
          />
          
          <ExpenseTransaction
            transactions={dashboardData?.last30DaysExpense?.transactions}
            onSeeMore={() => navigate("/expense")}
          />
          
          <Last30DaysExpense 
            data={dashboardData?.last30DaysExpense?.transactions} 
          /> 
          
          <RecentIncomeWithChart
            data={dashboardData?.last60DaysIncome?.transactions.slice(0,2) || []}
            totalIncome={dashboardData?.totalIncome || 0}
          />
          
          <RecentIncome 
            transactions={dashboardData?.last60DaysIncome?.transactions || []} 
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
