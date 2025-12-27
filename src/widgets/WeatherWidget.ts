import { BaseWidget } from './BaseWidget';
import type { Widget, WeatherConfig } from '../types';

interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export class WeatherWidget extends BaseWidget {
  private static weatherCache: Map<string, { data: WeatherData; timestamp: number; loading: boolean }> = new Map();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor(widget: Widget) {
    super(widget);
  }

  private getWeatherEmoji(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('snow')) return '❄️';
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
    return '🌤️'; // Default partly cloudy
  }

  private getWeatherColor(condition: string): string {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '#ffff00'; // Yellow
    if (lowerCondition.includes('cloud')) return '#cccccc'; // Gray
    if (lowerCondition.includes('rain')) return '#0080ff'; // Blue
    if (lowerCondition.includes('snow')) return '#ffffff'; // White
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '#800080'; // Purple
    return '#ffa500'; // Orange for default
  }

  private async fetchWeather(location: string, unit: 'C' | 'F', widgetId: string): Promise<void> {
    const cacheKey = widgetId;
    const cached = WeatherWidget.weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < WeatherWidget.CACHE_DURATION || cached.loading)) {
      return; // Already have data or loading
    }

    WeatherWidget.weatherCache.set(cacheKey, { data: { temp: 0, condition: 'Loading...', location: 'Fetching...' }, timestamp: Date.now(), loading: true });

    try {
      let url: string;
      if (location === 'Current Location') {
        // Get current position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        url = `https://wttr.in/${position.coords.latitude},${position.coords.longitude}?format=j1`;
      } else {
        // Use city name
        url = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const current = data.current_condition[0];
      const areaName = data.nearest_area[0].areaName[0].value;
      const region = data.nearest_area[0].region[0].value;
      const displayLocation = location === 'Current Location' ? 
        (areaName !== 'Unknown' ? `${areaName}, ${region}` : `${data.nearest_area[0].latitude[0].value}, ${data.nearest_area[0].longitude[0].value}`) : 
        location;
      const weatherData: WeatherData = {
        temp: unit === 'F' ? Math.round(parseInt(current.temp_C) * 9/5 + 32) : parseInt(current.temp_C),
        condition: current.weatherDesc[0].value,
        location: displayLocation
      };
      WeatherWidget.weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now(), loading: false });
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      WeatherWidget.weatherCache.set(cacheKey, { 
        data: { temp: 22, condition: 'Error fetching weather', location: location === 'Current Location' ? 'Unknown' : location }, 
        timestamp: Date.now(), 
        loading: false 
      });
    }
  }

  async render(ctx: CanvasRenderingContext2D): Promise<void> {
    const config = this.widget.config as WeatherConfig;
    const cacheKey = this.widget.id;

    let weatherData: WeatherData | null = null;
    const cached = WeatherWidget.weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < WeatherWidget.CACHE_DURATION) {
      weatherData = cached.data;
    } else {
      // Need to fetch
      try {
        await this.fetchWeather(config.location, config.unit, cacheKey);
        const newCached = WeatherWidget.weatherCache.get(cacheKey);
        weatherData = newCached ? newCached.data : { temp: 22, condition: 'Sunny', location: config.location };
      } catch (error) {
        console.error('Weather fetch failed:', error);
        weatherData = { temp: 22, condition: 'Error', location: config.location };
      }
    }

    ctx.fillStyle = this.getWeatherColor(weatherData.condition);
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(weatherData.location, this.widget.x, this.widget.y + 12);
    
    ctx.font = 'bold 12px "Courier New", monospace';
    const emoji = this.getWeatherEmoji(weatherData.condition);
    ctx.fillText(`${emoji} ${weatherData.temp}°${config.unit}`, this.widget.x, this.widget.y + 25);
    ctx.fillText(`${weatherData.condition}`, this.widget.x, this.widget.y + 38);
  }
}