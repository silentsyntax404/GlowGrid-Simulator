import { useState, useEffect } from 'react';
import DisplayCanvas from './DisplayCanvas';
import WidgetPanel from './WidgetPanel';
import type { Widget } from './types';
import './App.css';

function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const handleAddWidget = (widget: Widget) => {
    setWidgets([...widgets, widget]);
  };

  const handleUpdateWidget = (updatedWidget: Widget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
  };

  const handleClearDisplay = () => {
    setWidgets([]);
  };

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setWidgets([...widgets]); // trigger re-render
    }, 1000);
    return () => clearInterval(interval);
  }, [widgets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>GlowGrid Simulator</h1>
      <div style={{ display: 'flex' }}>
        <WidgetPanel 
          onAddWidget={handleAddWidget} 
          onClearDisplay={handleClearDisplay}
          onUpdateWidget={handleUpdateWidget}
          selectedWidget={selectedWidgetId ? widgets.find(w => w.id === selectedWidgetId) : null}
        />
        <div style={{ marginLeft: '20px' }}>
          <DisplayCanvas widgets={widgets} width={320} height={160} onSelectWidget={setSelectedWidgetId} selectedWidgetId={selectedWidgetId} />
          <div style={{ marginTop: '10px', color: '#666' }}>
            <h3>Active Widgets:</h3>
            <ul style={{ cursor: 'pointer' }}>
              {widgets.map(w => (
                <li 
                  key={w.id}
                  onClick={() => setSelectedWidgetId(w.id)}
                  style={{ 
                    padding: '5px', 
                    backgroundColor: selectedWidgetId === w.id ? '#e0e0e0' : 'transparent',
                    borderRadius: '3px'
                  }}
                >
                  {w.type} at ({Math.round(w.x)}, {Math.round(w.y)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
