import React from 'react'
import HumidityMessages from './components/humidityMessages'
import SurfacePressureMessages from './components/surfacepressureMessages'
import TemperatureMessages from './components/temperatureMessages'
import TideHeightMessages from './components/tideheightMessages'
import WarningMessages from './components/warningMessages'
import WaveHeightMessages from './components/waveheightMessages'
import WeatherMessages from './components/weatherMessages'
import WindMessages from './components/windMessages'
import Messages from './components/Messages'

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🌤 Streaming Dashboard Via WebSocket</h1>
      <Messages />
    </div>
  )
}

export default App
