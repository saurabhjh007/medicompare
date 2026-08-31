import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function PriceComparisonChart({ data, serviceName }) {
  if (!data || data.length === 0) return null;

  // Format data for chart
  const chartData = data.map((item) => ({
    name: item.hospitalName,
    price: item.price,
    city: item.city,
  }));

  // Find lowest price
  const lowestPrice = Math.min(...chartData.map((d) => d.price));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-500">{payload[0].payload.city}</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">
            ₹{payload[0].value}
          </p>
          {payload[0].value === lowestPrice && (
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold mt-1">
              Cheapest Option!
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Price Spread Visualizer</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Comparing rates for <span className="font-semibold text-blue-600">{serviceName}</span>
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span className="text-gray-600">Cheapest Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-600">Standard Price</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              interval={0}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.substring(0, 15)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="price" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.price === lowestPrice ? "#10b981" : "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PriceComparisonChart;
