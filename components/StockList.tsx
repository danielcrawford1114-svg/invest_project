import React from 'react';
import { Stock } from '../types';

interface StockListProps {
  stocks: Stock[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, selectedSymbol, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full md:w-80">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white tracking-wide">Watchlist</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {stocks.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isUp = stock.change >= 0;
          
          return (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`w-full flex items-center justify-between p-4 transition-colors duration-200 border-b border-slate-800/50 ${
                isSelected 
                  ? 'bg-slate-800/80 border-l-4 border-l-blue-500' 
                  : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-white text-base">{stock.symbol}</span>
                <span className="text-slate-400 text-xs truncate max-w-[120px]">{stock.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono text-white text-sm font-medium">${stock.price.toFixed(2)}</span>
                <span className={`text-xs font-medium flex items-center ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StockList;
