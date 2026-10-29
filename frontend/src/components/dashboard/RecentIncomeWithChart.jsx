import React, { useMemo } from 'react'
import CustomPieChart from '../charts/CustomPieChart';
import { useCurrency } from '../../context/CurrencyContext';

const RecentIncomeWithChart = ({data, totalIncome}) => {
    const {formatCurrency} = useCurrency();
    const chartData = useMemo(() => data?.map((item) => ({
            name: item?.source,
            amount: item?.amount,
        })) || [], [data]);
        
    return (
    <div className='card'>
        <div className='flex items-center justify-between'>
             <h5 className='text-lg'> Last 60 Days Income</h5>
        </div>

    <CustomPieChart
    data={chartData}
    label="Total Income"
    totalAmount={formatCurrency(totalIncome)}
    showTextAnchor
 
    />
    </div>
  )
}

export default RecentIncomeWithChart