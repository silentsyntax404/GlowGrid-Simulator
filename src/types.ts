export interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'text' | 'stock';
  x: number;
  y: number;
  width: number;
  height: number;
  config: any;
}

export interface ClockConfig {
  format: '12h' | '24h';
}

export interface WeatherConfig {
  location: string;
  unit: 'C' | 'F';
}

export interface TextConfig {
  text: string;
  fontSize: number;
}

export interface StockConfig {
  symbol: string;
}