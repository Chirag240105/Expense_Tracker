import React from 'react'
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { useCurrency } from '../../context/CurrencyContext';
import { CHART_COLORS } from "./chartColors.js";


const CustomBarChart = ({data, type = "neutral"}) => {
    const {formatCurrency} = useCurrency();

    const barColor = type === "income"
        ? CHART_COLORS.income
        : type === "expense"
          ? CHART_COLORS.expense
          : CHART_COLORS.primary;

    const CustomTooltip = ({ active , payload})=>{
        if(active && payload && payload.length){
            return (
                <div className='rounded-lg border border-gray-300 bg-white p-2 shadow-md'>
                    <p className='mb-1 text-xs font-semibold text-indigo-800'>{payload[0].payload.category}</p>
                    <p className='text-sm text-gray-600'> Amount: <span className='text-sm font-medium text-gray-900 '>{formatCurrency(payload[0].payload.amount)}</span></p>
                </div>
            )
        }
        return null;
    }
  return (
    <div className='bg-white mt-6'>
        <ResponsiveContainer width="100%" height={300}>

            <BarChart data={data}>
                <CartesianGrid stroke="none"/>
                <XAxis dataKey="category" tick={{fontSize: 12, fill: "var(--text-secondary)"}} stroke="none"/>
                <YAxis tick={{fontSize : 12, fill: "var(--text-secondary)" }} stroke="none"/>
                <Tooltip content={CustomTooltip}/>

                <Bar 
                dataKey="amount"
                fill={barColor}
                radius={[10, 10, 0, 0]}
                activeDot={{r: 8, fill: "yellow" }}
                activeStyle={{fill: "green"}}
                >{data.map((entry)=>( 
                    <Cell key={entry.category} fill={barColor}/>
                ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart