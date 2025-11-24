import { Stock, StockDataPoint } from '../types';
import { INITIAL_STOCKS } from '../constants';

// Helper to generate random volatility
const randomChange = (price: number, volatility: number = 0.002) => {
  const change = price * volatility * (Math.random() - 0.5);
  return price + change;
};

// Generate historical data
export const generateHistory = (basePrice: number, points: number): StockDataPoint[] => {
  let currentPrice = basePrice;
  const data: StockDataPoint[] = [];
  const now = new Date();
  
  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 min intervals
    currentPrice = randomChange(currentPrice, 0.01);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
  }
  return data;
};

export const initializeStocks = (): Stock[] => {
  return INITIAL_STOCKS.map(s => {
    const history = generateHistory(s.basePrice, 50);
    const lastPrice = history[history.length - 1].price;
    const prevPrice = history[0].price; // Compare to start of "day" for simplicity
    const change = lastPrice - prevPrice;
    
    return {
      symbol: s.symbol,
      name: s.name,
      price: lastPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      data: history
    };
  });
};

// Simulate a live tick
export const updateStockPrice = (stock: Stock): Stock => {
  const lastPrice = stock.price;
  const newPrice = parseFloat(randomChange(lastPrice).toFixed(2));
  const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const newDataPoint: StockDataPoint = {
    time: newTime,
    price: newPrice,
    volume: Math.floor(Math.random() * 5000) + 500
  };

  const newData = [...stock.data.slice(1), newDataPoint]; // Keep array size constant
  const change = newPrice - stock.data[0].price; // Change relative to the start of the window
  
  return {
    ...stock,
    price: newPrice,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / stock.data[0].price) * 100).toFixed(2)),
    data: newData
  };
};
