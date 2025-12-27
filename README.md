# Tidbyt Simulator

A web-based simulator for Tidbyt-like applications, allowing users to add and configure widgets on a virtual LED matrix display.

## Features

- **Virtual LED Matrix Display**: HTML5 Canvas rendering with pixelated LED panel appearance
- **Structured Layout**: Widgets positioned in specific locations (center top for text, left side for time, bottom left for weather)
- **Colorful Display**: Different colors for different widget types and weather conditions
- **Weather Emojis**: Visual weather indicators with appropriate emojis
- **Widget Customization**: Configure text, weather location/unit, and clock format before adding
- **Real-time Updates**: Clock updates every second, weather data cached for 10 minutes

## Layout

- **Center Top**: Custom text (white, centered)
- **Left Side**: Time and date (green)
- **Bottom Left**: Weather with emoji and condition (color-coded by weather type)

## Widget Types

### Text Widget
- Custom text input
- Adjustable font size (8-32px)
- Centered at top of display

### Clock Widget
- Time display (12h/24h format)
- Date display (day, month, date)
- Green color
- Updates in real-time

### Weather Widget
- Real weather data from wttr.in API
- Current location detection or custom city
- Temperature in Celsius/Fahrenheit
- Weather condition with emoji
- Color-coded by weather type:
  - ☀️ Sunny/Clear: Yellow
  - ☁️ Cloudy: Gray
  - 🌧️ Rain: Blue
  - ❄️ Snow: White
  - ⛈️ Thunder/Storm: Purple
  - 🌫️ Fog/Mist: Orange

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Select a widget type from the dropdown
2. Configure the widget settings in the panel
3. Click "Add Widget" to place it on the display
4. Widgets are automatically positioned in their designated locations

## Testing Without Hardware

All testing is done in the browser. The canvas simulates a 64x32 LED matrix with proper positioning and colors. No physical hardware required!

## Technical Details

- Built with React + TypeScript + Vite
- HTML5 Canvas for LED matrix rendering
- Real-time geolocation and weather API integration
- Responsive pixelated display with LED panel styling
