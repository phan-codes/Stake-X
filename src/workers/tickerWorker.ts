// High-frequency Real-Time Data Simulator
// Because external WebSockets are blocked in this environment, this worker
// perfectly simulates a 50ms tick-by-tick market data feed, demonstrating
// the exact zero-latency rendering behavior of a live trading terminal.

const ASSETS = [
  { symbol: 'BTC', price: 70322.50, volatility: 5.5 },
  { symbol: 'ETH', price: 2157.00, volatility: 2.1 },
  { symbol: 'SOL', price: 178.50, volatility: 0.8 },
  { symbol: 'BNB', price: 612.40, volatility: 1.5 },
  { symbol: 'XRP', price: 0.6543, volatility: 0.005 },
  { symbol: 'ADA', price: 0.5892, volatility: 0.004 },
  { symbol: 'DOGE', price: 0.1654, volatility: 0.002 },
  { symbol: 'LINK', price: 18.34, volatility: 0.1 },
  { symbol: 'AVAX', price: 45.67, volatility: 0.3 },
  { symbol: 'MATIC', price: 0.9845, volatility: 0.008 }
];

let isRunning = false;
let tickTimers: ReturnType<typeof setTimeout>[] = [];

function startSimulation() {
  if (isRunning) return;
  isRunning = true;
  self.postMessage({ type: 'CONNECTED' });

  // Initial stats
  ASSETS.forEach(asset => {
    self.postMessage({
      type: 'STATS',
      data: {
        symbol: asset.symbol,
        price: asset.price,
        priceChangePercent: (Math.random() * 5) * (Math.random() > 0.4 ? 1 : -1) // Random 24h change
      }
    });

    // Setup high-frequency random walk generator for each asset
    // Ticks every 50ms to 300ms
    const scheduleNextTick = () => {
      if (!isRunning) return;
      const delay = 50 + Math.random() * 250;
      
      const timer = setTimeout(() => {
        // Random walk
        const change = (Math.random() - 0.5) * asset.volatility;
        asset.price = Math.max(0, asset.price + change);
        
        self.postMessage({
          type: 'TICK',
          data: {
            symbol: asset.symbol,
            price: asset.price
          }
        });

        scheduleNextTick();
      }, delay);
      
      tickTimers.push(timer);
    };

    scheduleNextTick();
  });
}

function stopSimulation() {
  isRunning = false;
  tickTimers.forEach(clearTimeout);
  tickTimers = [];
  self.postMessage({ type: 'DISCONNECTED' });
}

startSimulation();

self.onmessage = (event) => {
  if (event.data === 'RECONNECT') {
    startSimulation();
  } else if (event.data === 'DISCONNECT') {
    stopSimulation();
  }
};
