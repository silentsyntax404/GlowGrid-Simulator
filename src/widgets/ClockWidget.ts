import { BaseWidget } from './BaseWidget';
import type { Widget, ClockConfig } from '../types';

export class ClockWidget extends BaseWidget {
  constructor(widget: Widget) {
    super(widget);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const config = this.widget.config as ClockConfig;
    const now = new Date();
    let timeString: string;
    if (config.format === '12h') {
      timeString = now.toLocaleTimeString('en-US', { hour12: true });
    } else {
      timeString = now.toLocaleTimeString('en-US', { hour12: false });
    }
    
    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    ctx.fillStyle = '#00ff00'; // Green for clock
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(timeString, this.widget.x, this.widget.y + 20);
    ctx.fillText(dateString, this.widget.x, this.widget.y + 40);
  }
}