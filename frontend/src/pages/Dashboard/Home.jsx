import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import InfoCard from '../../components/Cards/InfoCard';
import { IoMdCard } from "react-icons/io";
import { addThousandSeperator } from '../../utils/helper';
import RecentTransaction from '../../components/dashboard/RecentTransaction';
import FinanceOverview from '../../components/dashboard/FinanceOverview';
import ExpenseTransaction from '../../components/dashboard/ExpenseTransaction';
import Last30DaysExpense from '../../components/dashboard/last30DaysExpense';
import RecentIncomeWithChart from '../../components/dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/dashboard/RecentIncome';



const Home = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
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

  useEffect(() => {
    fetchDashboardData();
    return () => {};
  },[]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto ">
         <div className="grid items-center grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandSeperator(dashboardData?.totalBalance || 0)}
            onSeeMore={() => navigate("/expense")}
            color="bg-blue-500"
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Income"
            value={addThousandSeperator(dashboardData?.totalIncome || 0)}
            color="bg-green-500"
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Expense"
            value={addThousandSeperator(dashboardData?.totalExpense || 0)}
            color="bg-red-500"
          />
        </div> 

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
           <RecentTransaction
            transactions = {dashboardData?.recentTransaction}
            
            onSeeMore = {()=> navigate("/expense")} 
          />
          {
          <FinanceOverview
          totalBalance={dashboardData?.totalBalance || 0}
          totalIncome={dashboardData?.totalIncome || 0}
          totalExpense={dashboardData?.totalExpense || 0}
          />} 
          <ExpenseTransaction
          transactions={dashboardData?.last30DaysExpense?.transactions}
          onSeeMore={()=> navigate("/expense")}
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
