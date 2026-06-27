export interface TickerData {
  symbol: string;
  price: number;
  priceChangePercent: number;
  history: number[]; // Last N prices for sparkline
  direction: 'up' | 'down' | 'none';
}

type TickerListener = (symbol: string, data: TickerData) => void;

class TickerService {
  private worker: Worker | null = null;
  private dataStore: Map<string, TickerData> = new Map();
  private listeners: Set<TickerListener> = new Set();

  private readonly defaultSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'LINK', 'AVAX', 'MATIC'];

  constructor() {
    this.initializeStore();
  }

  private initializeStore() {
    this.defaultSymbols.forEach(symbol => {
      this.dataStore.set(symbol, {
        symbol,
        price: 0,
        priceChangePercent: 0,
        history: [],
        direction: 'none'
      });
    });
  }

  public connect() {
    if (this.worker || typeof window === 'undefined') return;

    this.worker = new Worker(new URL('../workers/tickerWorker.ts', import.meta.url), { type: 'module' });

    this.worker.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === 'TICK') {
        this.handleTick(data.symbol, data.price);
      } else if (type === 'STATS') {
        this.handleStats(data.symbol, data.price, data.priceChangePercent);
      }
    };
  }

  public disconnect() {
    if (this.worker) {
      this.worker.postMessage('DISCONNECT');
      this.worker.terminate();
      this.worker = null;
    }
  }

  private handleTick(symbol: string, price: number) {
    const currentData = this.dataStore.get(symbol);
    if (!currentData) return;

    if (currentData.price !== 0 && currentData.price !== price) {
      currentData.direction = price > currentData.price ? 'up' : 'down';

      // Update history for sparkline (keep last 50 points)
      currentData.history.push(price);
      if (currentData.history.length > 50) {
        currentData.history.shift();
      }
    }

    currentData.price = price;
    this.dataStore.set(symbol, currentData);
    this.notifyListeners(symbol, currentData);
  }

  private handleStats(symbol: string, price: number, priceChangePercent: number) {
    const currentData = this.dataStore.get(symbol);
    if (!currentData) return;

    if (currentData.price === 0) {
      currentData.price = price;
    }
    currentData.priceChangePercent = priceChangePercent;

    this.dataStore.set(symbol, currentData);
    this.notifyListeners(symbol, currentData);
  }

  public subscribe(listener: TickerListener) {
    this.listeners.add(listener);

    // Immediately push current state to new subscriber
    this.dataStore.forEach((data, symbol) => {
      if (data.price !== 0) {
        listener(symbol, data);
      }
    });

    return () => this.listeners.delete(listener);
  }

  private notifyListeners(symbol: string, data: TickerData) {
    this.listeners.forEach(listener => listener(symbol, data));
  }

  public getData(symbol: string): TickerData | undefined {
    return this.dataStore.get(symbol);
  }
}

export const tickerService = new TickerService();
