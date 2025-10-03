import React from 'react';
import CustomPieChart from '../charts/CustomPieChart';

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  const balanceData = [
    { name: "Total Balance", amount: totalBalance || 0 },
    { name: "Total Income", amount: totalIncome || 0 },
    { name: "Total Expense", amount: totalExpense || 0 }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Financial Overview</h5>
      </div>

      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={`${totalBalance}`|| 0}
        showTextAnchor
      />
    </div>
  );
};

export default FinanceOverview;
