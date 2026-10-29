import React from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import { CHART_COLORS } from "./chartColors.js";
const CustomLineChart = ({ data }) => {
    const {formatCurrency} = useCurrency();
    const CustomToolTip = ({active, payload}) => {
        if (active && payload && payload.length){
            return(
                <div className='rounded-lg border border-gray-300 bg-white p-2 shadow-md'>
                    <p className='mb-1 text-xs font-semibold text-rose-800'>{payload[0].payload.category}</p>
                    <p className='text-sm text-gray-600'>Amount: <span className='text-sm font-medium text-gray-900 '>{formatCurrency(payload[0].payload.amount)}</span></p>
                </div>
            )
        }
    }
  return <div className=''>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
            <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
            </linearGradient>
            </defs>
            <CartesianGrid stroke='none'/>
                <XAxis dataKey="month" tick={{fontSize: 12, fill: "var(--text-secondary)"}} stroke='none' />
                <YAxis tick={{fontSize: 12, fill: "var(--text-secondary)"}} stroke='none'/>
                <Tooltip content={<CustomToolTip/>}/>

                <Area type="monotone" dataKey="amount" stroke={CHART_COLORS.expense} fill="url(#expenseGradient)" strokeWidth={3} dot={{r: 3, fill: CHART_COLORS.expense }}/>
           

            </AreaChart>
        </ResponsiveContainer>

  </div>
}

export default CustomLineChart