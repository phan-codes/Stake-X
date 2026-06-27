import { useEffect, useRef } from 'react';
import { tickerService, type TickerData } from '../../services/tickerService';

const initialSymbols = [
  { s: 'BTC' },
  { s: 'ETH' },
  { s: 'SOL' },
  { s: 'BNB' },
  { s: 'XRP' },
  { s: 'ADA' },
  { s: 'DOGE' },
  { s: 'LINK' },
  { s: 'AVAX' },
  { s: 'MATIC' }
];

export default function TickerBar() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. GPU-accelerated infinite scroll
    let animationId: number;
    let position = 0;

    const animateScroll = () => {
      position -= 0.45;
      if (position <= -container.scrollWidth / 2) position = 0;
      container.style.transform = `translate3d(${position}px, 0, 0)`;
      animationId = requestAnimationFrame(animateScroll);
    };
    animationId = requestAnimationFrame(animateScroll);

    // 2. Connect to WebSocket ticker service
    tickerService.connect();

    // 3. Sparkline drawing helper
    const drawSparkline = (symbol: string, history: number[], direction: 'up' | 'down' | 'none') => {
      const canvases = document.querySelectorAll(`[data-spark-target="${symbol}"]`);
      if (!canvases.length || history.length < 2) return;

      canvases.forEach((node) => {
        const canvas = node as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;

        ctx.beginPath();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = direction === 'up' ? '#34d399' : direction === 'down' ? '#f87171' : '#a78bfa';

        history.forEach((price, i) => {
          const x = (i / (history.length - 1)) * w;
          const y = h - ((price - min) / range) * (h - 4) - 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    };

    // 4. Subscribe — direct DOM mutations, no React re-renders
    const handleTick = (symbol: string, data: TickerData) => {
      const priceNodes = document.querySelectorAll(`[data-price-target="${symbol}"]`);
      const changeNodes = document.querySelectorAll(`[data-change-target="${symbol}"]`);

      const formatted = data.price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const changeStr = `${data.priceChangePercent >= 0 ? '+' : ''}${data.priceChangePercent.toFixed(2)}%`;
      const isPositive = data.priceChangePercent >= 0;

      priceNodes.forEach(node => {
        if (node.textContent !== formatted) {
          node.textContent = formatted;

          if (data.direction !== 'none') {
            const cls = data.direction === 'up' ? 'flash-up' : 'flash-down';
            node.classList.add(cls);
            setTimeout(() => node.classList.remove(cls), 80);
          }
        }
      });

      changeNodes.forEach(node => {
        if (node.textContent !== changeStr) {
          node.textContent = changeStr;
          node.className = `text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`;
        }
      });

      drawSparkline(symbol, data.history, data.direction);
    };

    const unsubscribe = tickerService.subscribe(handleTick);

    return () => {
      cancelAnimationFrame(animationId);
      unsubscribe();
    };
  }, []);

  return (
    <section className="w-full bg-surface-900 border-y border-white/5 py-2.5 overflow-hidden will-change-transform">
      <div className="relative">
        <div ref={scrollContainerRef} className="ticker-track flex whitespace-nowrap gap-2 md:gap-3" style={{ width: 'max-content' }}>
          {[...initialSymbols, ...initialSymbols].map((coin, i) => (
            <div key={`${coin.s}-${i}`} className="ticker-item flex items-center gap-1 px-1.5 md:gap-1.5 md:px-2 border-r border-white/5 last:border-r-0">
              <div className="w-1 h-1 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(245,158,11,0.55)]" />
              <span className="text-white/90 text-sm font-semibold tracking-wide">{coin.s}</span>
              <span
                className="text-white/80 text-sm price-text font-medium min-w-[44px] text-right"
                data-price-target={coin.s}
              >
                —
              </span>
              <span className="text-sm font-medium min-w-[38px] text-white/40" data-change-target={coin.s}>
                —
              </span>
              <canvas
                data-spark-target={coin.s}
                width={42}
                height={18}
                className="opacity-80 shrink-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
