import React, { useState, useEffect } from 'react';
import StockList from './components/StockList';
import StockChart from './components/StockChart';
import AIChat from './components/AIChat';
import { Stock } from './types';
import { initializeStocks, updateStockPrice } from './services/stockService';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Initialization
  useEffect(() => {
    const initialData = initializeStocks();
    setStocks(initialData);
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => 
          // Update random stock or all? Let's update all slightly for liveliness
          Math.random() > 0.3 ? updateStockPrice(stock) : stock
        )
      );
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const selectedStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono">Initializing Market Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">MarketMind <span className="text-blue-500">AI</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Mobile Toggles */}
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="md:hidden p-2 text-slate-400 hover:text-white"
          >
             List
          </button>
           <button 
             onClick={() => setIsChatOpen(!isChatOpen)}
             className="md:hidden p-2 text-slate-400 hover:text-white"
          >
             AI
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Stocks */}
        <div className={`
          absolute md:relative z-10 h-full transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full w-0 md:translate-x-0 md:w-0 overflow-hidden'}
        `}>
          <StockList 
            stocks={stocks} 
            selectedSymbol={selectedSymbol} 
            onSelect={(s) => { setSelectedSymbol(s); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
          />
        </div>
        
        {/* Toggle Button for Desktop Sidebar */}
        <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-slate-800 text-slate-400 p-1 rounded-r border-y border-r border-slate-700 hover:text-white"
           style={{ left: isSidebarOpen ? '20rem' : '0' }}
        >
           {isSidebarOpen ? '‹' : '›'}
        </button>

        {/* Center Chart Area */}
        <main className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col gap-6">
           {/* Market Overview Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Market Sentiment</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[65%]"></div>
                   </div>
                   <span className="text-emerald-400 text-sm font-bold">Bullish</span>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Top Gainer</p>
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold">NVDA</span>
                  <span className="text-emerald-400 text-sm font-bold">+4.2%</span>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Volume</p>
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold">High</span>
                  <span className="text-slate-400 text-sm">2.4B</span>
                </div>
              </div>
           </div>

           {selectedStock && <StockChart stock={selectedStock} />}

           <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h3 className="text-white font-bold mb-4">About {selectedStock?.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {selectedStock?.name} is a leading technology company tracked in our real-time simulated environment. 
                Use the AI Assistant on the right to analyze its performance, ask about recent news, or compare it with other assets.
              </p>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <p className="text-slate-500 text-xs">Open</p>
                    <p className="text-white font-mono">${(selectedStock?.price * 0.99).toFixed(2)}</p>
                 </div>
                 <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <p className="text-slate-500 text-xs">High</p>
                    <p className="text-white font-mono">${(selectedStock?.price * 1.02).toFixed(2)}</p>
                 </div>
                 <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <p className="text-slate-500 text-xs">Low</p>
                    <p className="text-white font-mono">${(selectedStock?.price * 0.98).toFixed(2)}</p>
                 </div>
                 <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <p className="text-slate-500 text-xs">Mkt Cap</p>
                    <p className="text-white font-mono">2.4T</p>
                 </div>
              </div>
           </div>
        </main>

        {/* Right Chat Sidebar */}
        <div className={`
          absolute md:relative z-10 h-full border-l border-slate-800 transition-all duration-300 ease-in-out bg-slate-900
          ${isChatOpen ? 'translate-x-0 w-96 right-0' : 'translate-x-full w-0 md:translate-x-0 md:w-0 overflow-hidden'}
        `}>
           {selectedStock && <AIChat currentStock={selectedStock} />}
        </div>
        
         {/* Toggle Button for Desktop Chat */}
         <button 
           onClick={() => setIsChatOpen(!isChatOpen)}
           className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-slate-800 text-slate-400 p-1 rounded-l border-y border-l border-slate-700 hover:text-white"
           style={{ right: isChatOpen ? '24rem' : '0' }}
        >
           {isChatOpen ? '›' : '‹'}
        </button>
      </div>
    </div>
  );
};

export default App;
