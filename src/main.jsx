import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import App from './App.jsx';
import { useWeatherStore } from './context/WeatherContext';

function ThemeSync() {
  const theme = useWeatherStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeSync />
    <App />
  </StrictMode>,
);
