import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrency } from "../../context/CurrencyContext";

const CategorySpendingChart = ({ categories = [] }) => {
  const { formatCurrency } = useCurrency();

  const data = useMemo(
    () =>
      categories
        .filter((c) => c.totalAmount > 0)
        .slice(0, 8)
        .map((c) => ({
          name: c.categoryName,
          value: parseFloat(c.totalAmount.toFixed(2)),
          color: c.categoryColor || "#6B7280",
          percentage: c.percentage,
        })),
    [categories]
  );

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-gray-400 text-sm">
        No spending data for this period
      </div>
    );
  }

  return (
    <div className="card">
      <h5 className="text-lg font-semibold mb-4">Category Spending (30 days)</h5>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [formatCurrency(v), name]}
          />
          <Legend
            formatter={(value, entry) =>
              `${value} (${entry.payload.percentage}%)`
            }
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategorySpendingChart;
