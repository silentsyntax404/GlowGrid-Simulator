import { BaseWidget } from './BaseWidget';
import type { Widget, TextConfig } from '../types';

export class TextWidget extends BaseWidget {
  constructor(widget: Widget) {
    super(widget);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const config = this.widget.config as TextConfig;

    ctx.fillStyle = '#ffffff'; // White text for dark background
    ctx.font = `bold ${Math.min(config.fontSize, 24)}px "Courier New", monospace`; // Limit max font size
    ctx.textAlign = 'center';
    
    // Ensure text doesn't go beyond canvas bounds (320px wide)
    const text = config.text.length > 20 ? config.text.substring(0, 17) + '...' : config.text;
    
    ctx.fillText(text, this.widget.x, this.widget.y + Math.min(config.fontSize, 24));
    ctx.textAlign = 'left'; // Reset alignment
  }
}