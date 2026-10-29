import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../charts/chartColors.js";

/**
 * Converts raw dailyTrends array [{ _id: { date, type }, total }]
 * into recharts-friendly objects keyed by date.
 */
function buildChartData(rawTrends = []) {
  const map = new Map();
  for (const item of rawTrends) {
    const date = item._id?.date ?? item.date;
    const type = item._id?.type ?? item.type;
    if (!date || !type) continue;
    if (!map.has(date)) map.set(date, { date, income: 0, expense: 0 });
    const entry = map.get(date);
    entry[type] = parseFloat((item.total ?? 0).toFixed(2));
  }
  return Array.from(map.values()).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
}

const DailyTrendsChart = ({ data = [] }) => {
  const chartData = useMemo(() => buildChartData(data), [data]);

  if (chartData.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-gray-400 text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <div className="card">
      <h5 className="text-lg font-semibold mb-4">30-Day Daily Trends</h5>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(d) => d.slice(5)} // show MM-DD
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10 }} width={50} />
          <Tooltip
            formatter={(v) => `$${v.toLocaleString()}`}
            labelFormatter={(l) => `Date: ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill={CHART_COLORS.income} radius={[3, 3, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill={CHART_COLORS.expense} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTrendsChart;
