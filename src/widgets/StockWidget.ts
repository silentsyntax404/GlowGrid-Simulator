import { BaseWidget } from './BaseWidget';
import type { Widget, StockConfig } from '../types';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  priceHistory: number[];
}

export class StockWidget extends BaseWidget {
  private static stockCache: Map<string, { data: StockData; timestamp: number; loading: boolean }> = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(widget: Widget) {
    super(widget);
  }

  private async fetchIndianStock(symbol: string, widgetId: string): Promise<void> {
    const cacheKey = `${widgetId}-${symbol}`; // Include symbol in cache key
    const cached = StockWidget.stockCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < StockWidget.CACHE_DURATION || cached.loading)) {
      return;
    }

    StockWidget.stockCache.set(cacheKey, { 
      data: { symbol, price: 0, change: 0, changePercent: 0, priceHistory: [] }, 
      timestamp: Date.now(), 
      loading: true 
    });

    try {
      // Using Alpha Vantage with Indian stock symbols (NSE format)
      // Example: RELIANCE.BSE, TCS.BSE, INFY.BSE, WIPRO.BSE
      const apiKey = 'demo'; // Replace with your API key
      const nseSymbol = `${symbol}.BSE`;
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${nseSymbol}&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price']);
        const previousClose = parseFloat(quote['08. previous close']) || price * 0.99;
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        // Generate mock price history for visualization
        const priceHistory = this.generatePriceHistory(previousClose, price, 20);

        StockWidget.stockCache.set(cacheKey, {
          data: { symbol, price, change, changePercent, priceHistory },
          timestamp: Date.now(),
          loading: false
        });
      } else {
        // Demo data for Indian stocks
        const demoPrice = Math.random() * 5000 + 1000; // 1000-6000 range typical for Indian stocks
        const demoChange = (Math.random() - 0.5) * 100;
        const demoChangePercent = (demoChange / demoPrice) * 100;
        const priceHistory = this.generatePriceHistory(demoPrice - demoChange, demoPrice, 20);

        StockWidget.stockCache.set(cacheKey, {
          data: { symbol: symbol.toUpperCase(), price: demoPrice, change: demoChange, changePercent: demoChangePercent, priceHistory },
          timestamp: Date.now(),
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Demo data fallback
      const demoPrice = 2500 + Math.random() * 2000;
      const demoChange = (Math.random() - 0.5) * 50;
      const priceHistory = this.generatePriceHistory(demoPrice - demoChange, demoPrice, 20);

      StockWidget.stockCache.set(cacheKey, {
        data: { symbol: symbol.toUpperCase(), price: demoPrice, change: demoChange, changePercent: (demoChange / demoPrice) * 100, priceHistory },
        timestamp: Date.now(),
        loading: false
      });
    }
  }

  private generatePriceHistory(startPrice: number, endPrice: number, points: number): number[] {
    const history: number[] = [];
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const price = startPrice + (endPrice - startPrice) * progress + (Math.random() - 0.5) * Math.abs(endPrice - startPrice) * 0.1;
      history.push(Math.max(price, startPrice * 0.8));
    }
    return history;
  }

  private drawTrendChart(ctx: CanvasRenderingContext2D, history: number[], x: number, y: number, width: number, height: number): void {
    if (history.length < 2) return;

    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);
    const priceRange = maxPrice - minPrice || 1;

    // Draw chart background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, width, height);

    // Draw trend line using dots
    const pointWidth = width / (history.length - 1);
    
    for (let i = 0; i < history.length; i++) {
      const normalizedPrice = (history[i] - minPrice) / priceRange;
      const pointX = x + i * pointWidth;
      const pointY = y + height - (normalizedPrice * height);

      // Color based on trend (red for down, green for up relative to start)
      const isUp = history[i] >= history[0];
      ctx.fillStyle = isUp ? '#ff4444' : '#ff2222';

      // Draw small dot
      ctx.fillRect(pointX, pointY, 2, 2);
    }

    // Draw trend line
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const normalizedPrice = (history[i] - minPrice) / priceRange;
      const pointX = x + i * (width / (history.length - 1));
      const pointY = y + height - (normalizedPrice * height);

      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.stroke();
  }

  async render(ctx: CanvasRenderingContext2D): Promise<void> {
    const config = this.widget.config as StockConfig;
    const cacheKey = `${this.widget.id}-${config.symbol}`; // Include symbol in cache key
    const cached = StockWidget.stockCache.get(cacheKey);

    if (!cached || Date.now() - cached.timestamp > StockWidget.CACHE_DURATION) {
      await this.fetchIndianStock(config.symbol, this.widget.id);
    }

    const cacheKeyForData = `${this.widget.id}-${config.symbol}`;
    const data = StockWidget.stockCache.get(cacheKeyForData)?.data || { 
      symbol: config.symbol, 
      price: 0, 
      change: 0, 
      changePercent: 0,
      priceHistory: []
    };

    // Draw stock symbol and price in white
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'left';

    const symbolText = data.symbol.toUpperCase();
    const priceText = `₹${data.price.toFixed(2)}`;

    ctx.fillText(symbolText, this.widget.x, this.widget.y + 12);
    ctx.fillText(priceText, this.widget.x, this.widget.y + 24);

    // Draw change info in green/red
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillStyle = data.change >= 0 ? '#00ff00' : '#ff0000';
    const changeText = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`;
    ctx.fillText(changeText, this.widget.x, this.widget.y + 35);

    // Draw trend chart
    if (data.priceHistory.length > 0) {
      this.drawTrendChart(ctx, data.priceHistory, this.widget.x, this.widget.y + 40, 110, 35);
    }
  }
}