import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import CustomPieChart from '../charts/CustomPieChart';
import { useCurrency } from '../../context/CurrencyContext';

const RecentIncomeWithChart = ({data, totalIncome}) => {
    const {formatCurrency} = useCurrency();
    const [ChartData, setChartData] = useState([]);
    const prepareChartData = () =>{
        const dataArr = data?.map((item) =>({
            name: item?.source,
            amount: item?.amount,
        }));
        setChartData(dataArr);
    };
        useEffect(()=>{
            prepareChartData();
            return () => {};
        },[data]);
        
    return (
    <div className='card'>
        <div className='flex items-center justify-between'>
             <h5 className='text-lg'> Last 60 Days Income</h5>
        </div>

    <CustomPieChart
    data={ChartData}
    label="Total Income"
    totalAmount={formatCurrency(totalIncome)}
    showTextAnchor
 
    />
    </div>
  )
}

export default RecentIncomeWithChart