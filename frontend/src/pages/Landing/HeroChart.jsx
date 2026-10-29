import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEMO_DATA = [
  { month: "May", income: 6250, expense: 4100 },
  { month: "Jun", income: 7700, expense: 4300 },
  { month: "Jul", income: 6250, expense: 3900 },
  { month: "Aug", income: 7700, expense: 5200 },
  { month: "Sep", income: 6730, expense: 4500 },
  { month: "Oct", income: 6250, expense: 4800 },
];

const HeroChart = () => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={DEMO_DATA}>
      <defs>
        <linearGradient id="heroIncome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="heroExpense" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis hide />
      <Tooltip
        contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }}
        labelStyle={{ color: "#fff" }}
        formatter={(value) => [`$${value.toLocaleString()}`, ""]}
      />
      <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
      <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#heroIncome)" strokeWidth={2} />
      <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" fill="url(#heroExpense)" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
);

export default HeroChart;
