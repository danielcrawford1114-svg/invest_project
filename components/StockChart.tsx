import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Stock, StockDataPoint } from '../types';

interface StockChartProps {
  stock: Stock;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-sm">
          ${payload[0].value.toFixed(2)}
        </p>
        <p className="text-slate-400 text-xs">
          Vol: {payload[0].payload.volume.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const isPositive = stock.change >= 0;
  const color = isPositive ? '#10b981' : '#ef4444'; // Emerald-500 or Red-500

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl p-4 border border-slate-800 relative">
      <div className="absolute top-4 left-6 z-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">{stock.symbol}</h2>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-4xl font-semibold text-white">${stock.price.toFixed(2)}</span>
          <span className={`text-lg font-medium mb-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">{stock.name}</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={stock.data}
          margin={{ top: 90, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#475569" 
            fontSize={12} 
            tickFormatter={(val) => `$${val}`} 
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
