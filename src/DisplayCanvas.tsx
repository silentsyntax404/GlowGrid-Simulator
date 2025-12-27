import React, { useRef, useEffect } from 'react';
import type { Widget } from './types';
import { ClockWidget, WeatherWidget, TextWidget, StockWidget } from './widgets';

interface DisplayCanvasProps {
  widgets: Widget[];
  width: number;
  height: number;
  onSelectWidget?: (id: string) => void;
  selectedWidgetId?: string | null;
}

const DisplayCanvas: React.FC<DisplayCanvasProps> = ({ widgets, width, height, onSelectWidget, selectedWidgetId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Disable image smoothing for pixelated look
    ctx.imageSmoothingEnabled = false;

    // Clear canvas with dark background (LED off state)
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, width, height);

    // Draw a subtle grid to simulate LED matrix
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    const pixelSize = 5; // Approximate pixel size for 64x32 on 320x160
    for (let x = 0; x < width; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render each widget
    const renderWidgets = async () => {
      for (const widget of widgets) {
        let widgetInstance;
        switch (widget.type) {
          case 'clock':
            widgetInstance = new ClockWidget(widget);
            widgetInstance.render(ctx);
            break;
          case 'weather':
            widgetInstance = new WeatherWidget(widget);
            await widgetInstance.render(ctx);
            break;
          case 'text':
            widgetInstance = new TextWidget(widget);
            widgetInstance.render(ctx);
            break;
          case 'stock':
            widgetInstance = new StockWidget(widget);
            await widgetInstance.render(ctx);
            break;
          default:
            break;
        }
      }
    };

    renderWidgets();

    // Draw selection border if widget is selected
    if (selectedWidgetId) {
      const selected = widgets.find(w => w.id === selectedWidgetId);
      if (selected) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(selected.x - 2, selected.y - 2, selected.width + 4, selected.height + 4);
      }
    }
  }, [widgets, width, height, selectedWidgetId]);

  return (
    <div style={{ 
      border: '10px solid #333', 
      borderRadius: '5px', 
      display: 'inline-block', 
      backgroundColor: '#000',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      padding: '10px'
    }}>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        style={{ 
          display: 'block',
          imageRendering: 'pixelated' as any,
          cursor: 'pointer'
        }}
        onClick={(e) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (width / rect.width);
          const y = (e.clientY - rect.top) * (height / rect.height);
          
          // Find widget at clicked position
          for (const widget of widgets) {
            if (x >= widget.x && x <= widget.x + widget.width &&
                y >= widget.y && y <= widget.y + widget.height) {
              onSelectWidget?.(widget.id);
              return;
            }
          }
        }}
      />
    </div>
  );
};

export default DisplayCanvas;