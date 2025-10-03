import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import CustomToolTip from './CustomToolTip';
import CustomLegend from './CustomLegend';

const CustomPieChart = ({ data, label, totalAmount, colors = ["#875CF5", "#FA2C37", "#FF6900"], showTextAnchor }) => {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
          label={({ cx, cy }) =>
            showTextAnchor ? (
              <>
                <text x={cx} y={cy - 25} textAnchor="middle" fill="#666" fontSize={14}>
                  {label}
                </text>
                <text x={cx} y={cy + 8} textAnchor="middle" fill="#333" fontSize={24} fontWeight={600}>
                  ₹{totalAmount}
                </text>
              </>
            ) : null
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-$${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        <Tooltip content={<CustomToolTip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
