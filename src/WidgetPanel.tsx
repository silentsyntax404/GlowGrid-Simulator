import React, { useState } from 'react';
import type { Widget } from './types';

interface WidgetPanelProps {
  onAddWidget: (widget: Widget) => void;
  onClearDisplay: () => void;
  onUpdateWidget?: (widget: Widget) => void;
  selectedWidget?: Widget | null;
}

const WidgetPanel: React.FC<WidgetPanelProps> = ({ onAddWidget, onClearDisplay, onUpdateWidget, selectedWidget }) => {
  const [selectedType, setSelectedType] = useState<'clock' | 'weather' | 'text' | 'stock'>('clock');
  const [textConfig, setTextConfig] = useState({ text: 'Hello World', fontSize: 16 });
  const [weatherConfig, setWeatherConfig] = useState({ location: 'Current Location', unit: 'C' as 'C' | 'F' });
  const [clockConfig, setClockConfig] = useState({ format: '24h' as '12h' | '24h' });
  const [stockConfig, setStockConfig] = useState({ symbol: 'RELIANCE' });

  // Update form when a widget is selected
  React.useEffect(() => {
    if (selectedWidget) {
      setSelectedType(selectedWidget.type as any);
      if (selectedWidget.type === 'text') {
        setTextConfig(selectedWidget.config);
      } else if (selectedWidget.type === 'weather') {
        setWeatherConfig(selectedWidget.config);
      } else if (selectedWidget.type === 'clock') {
        setClockConfig(selectedWidget.config);
      } else if (selectedWidget.type === 'stock') {
        setStockConfig(selectedWidget.config);
      }
    }
  }, [selectedWidget]);

  const handleAdd = () => {
    const config = selectedType === 'text' ? textConfig : 
                   selectedType === 'weather' ? weatherConfig : 
                   selectedType === 'stock' ? stockConfig :
                   clockConfig;
    
    // If updating existing widget
    if (selectedWidget) {
      const updatedWidget: Widget = {
        ...selectedWidget,
        config: config
      };
      onUpdateWidget?.(updatedWidget);
      return;
    }
    
    // Calculate position based on widget type
    let position = { x: 0, y: 0 };
    switch (selectedType) {
      case 'text':
        position = { x: 160, y: 10 }; // Center top
        break;
      case 'clock':
        position = { x: 10, y: 40 }; // Left side
        break;
      case 'weather':
        position = { x: 190, y: 120 }; // Bottom right, moved left for text space
        break;
      case 'stock':
        position = { x: 10, y: 80 }; // Bottom left with more space
        break;
    }
    
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: selectedType,
      x: position.x,
      y: position.y,
      width: selectedType === 'stock' ? 120 : 100,
      height: selectedType === 'stock' ? 80 : 50,
      config: config,
    };
    onAddWidget(newWidget);
  };

  const renderConfig = () => {
    switch (selectedType) {
      case 'text':
        return (
          <div style={{ marginTop: '10px' }}>
            <label style={{ color: 'black' }}>Text: 
              <div style={{ display: 'flex', gap: '5px' }}>
                <input 
                  type="text" 
                  value={textConfig.text} 
                  onChange={(e) => setTextConfig({...textConfig, text: e.target.value})} 
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={() => setTextConfig({...textConfig, text: ''})}
                  style={{ padding: '2px 8px', fontSize: '12px' }}
                >
                  Clear
                </button>
              </div>
            </label>
            <label style={{ color: 'black' }}>Font Size: <input 
              type="number" 
              value={textConfig.fontSize} 
              onChange={(e) => setTextConfig({...textConfig, fontSize: parseInt(e.target.value) || 16})} 
              min="8" max="32" 
              style={{ width: '100%' }}
            /></label>
          </div>
        );
      case 'weather':
        return (
          <div style={{ marginTop: '10px' }}>
            <label style={{ color: 'black' }}>Location: <input 
              type="text" 
              value={weatherConfig.location} 
              onChange={(e) => setWeatherConfig({...weatherConfig, location: e.target.value})} 
              style={{ width: '100%', marginBottom: '5px' }}
            /></label>
            <label style={{ color: 'black' }}>Unit: 
              <select 
                value={weatherConfig.unit} 
                onChange={(e) => setWeatherConfig({...weatherConfig, unit: e.target.value as 'C' | 'F'})} 
                style={{ width: '100%' }}
              >
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
              </select>
            </label>
          </div>
        );
      case 'stock':
        return (
          <div style={{ marginTop: '10px' }}>
            <label style={{ color: 'black' }}>Select Stock: 
              <select 
                value={stockConfig.symbol} 
                onChange={(e) => {
                  const newSymbol = e.target.value;
                  setStockConfig({...stockConfig, symbol: newSymbol});
                  // If editing an existing widget, auto-update it
                  if (selectedWidget && selectedWidget.type === 'stock') {
                    onUpdateWidget?.({...selectedWidget, config: {...stockConfig, symbol: newSymbol}});
                  }
                }} 
                style={{ width: '100%' }}
              >
                <optgroup label="Large Cap">
                  <option value="RELIANCE">Reliance Industries (RELIANCE)</option>
                  <option value="TCS">Tata Consultancy Services (TCS)</option>
                  <option value="INFY">Infosys (INFY)</option>
                  <option value="HDFCBANK">HDFC Bank (HDFCBANK)</option>
                  <option value="ICICIBANK">ICICI Bank (ICICIBANK)</option>
                </optgroup>
                <optgroup label="Mid Cap">
                  <option value="WIPRO">Wipro (WIPRO)</option>
                  <option value="LT">Larsen & Toubro (LT)</option>
                  <option value="SBIN">State Bank of India (SBIN)</option>
                  <option value="BAJAJ-AUTO">Bajaj Auto (BAJAJ-AUTO)</option>
                  <option value="MARUTI">Maruti Suzuki (MARUTI)</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="ITC">ITC (ITC)</option>
                  <option value="TATASTEEL">Tata Steel (TATASTEEL)</option>
                  <option value="POWERGRID">Power Grid (POWERGRID)</option>
                </optgroup>
              </select>
            </label>
          </div>
        );
      case 'clock':
        return (
          <div style={{ marginTop: '10px' }}>
            <label style={{ color: 'black' }}>Format: 
              <select 
                value={clockConfig.format} 
                onChange={(e) => setClockConfig({...clockConfig, format: e.target.value as '12h' | '24h'})} 
                style={{ width: '100%' }}
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', width: '250px', color: 'black' }}>
      <h3 style={{ color: 'black' }}>{selectedWidget ? 'Edit Widget' : 'Add Widget'}</h3>
      <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)}>
        <option value="clock">Clock</option>
        <option value="weather">Weather</option>
        <option value="text">Text</option>
        <option value="stock">Stock</option>
      </select>
      {renderConfig()}
      <button onClick={handleAdd} style={{ marginTop: '10px', width: '100%' }}>
        {selectedWidget ? 'Update Widget' : 'Add Widget'}
      </button>
      <button onClick={onClearDisplay} style={{ marginTop: '10px', width: '100%', backgroundColor: '#ff4444', color: 'white' }}>Clear Display</button>
    </div>
  );
};

export default WidgetPanel;