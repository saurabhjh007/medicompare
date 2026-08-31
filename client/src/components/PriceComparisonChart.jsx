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
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-slate-700/50">
          <p className="font-bold text-sm">{payload[0].payload.name}</p>
          <p className="text-xs text-slate-400">{payload[0].payload.city}</p>
          <p className="text-xl font-extrabold text-indigo-400 mt-1">
            ₹{payload[0].value.toLocaleString()}
          </p>
          {payload[0].value === lowestPrice && (
            <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-semibold mt-1.5">
              ✨ Lowest Price Option
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900">Price Spread Visualizer</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparing procedure charges for <span className="font-semibold text-indigo-600">{serviceName}</span>
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-600">Cheapest Provider</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
            <span className="text-slate-600">Standard Rate</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              interval={0}
              tickFormatter={(value) =>
                value.length > 14 ? `${value.substring(0, 14)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", radius: 8 }} />
            <Bar dataKey="price" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.price === lowestPrice ? "#10b981" : "#4f46e5"}
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
