import { useMemo } from 'react';

/**
 * Derive extreme weather alerts from current weather data.
 * @param {object|null} weather - OpenWeatherMap-style current weather object
 */
export function useWeatherAlerts(weather) {
  return useMemo(() => {
    if (!weather) return [];

    const alerts = [];
    const temp = weather.main?.temp;
    const uv = weather.uvi ?? weather.uvIndex;
    const windSpeed = weather.wind?.speed;

    if (temp > 40) {
      alerts.push({ type: 'heat', message: `Ekstremal isti: ${Math.round(temp)}°C` });
    }
    if (temp < -10) {
      alerts.push({ type: 'cold', message: `Ekstremal soyuq: ${Math.round(temp)}°C` });
    }
    if (uv >= 8) {
      alerts.push({ type: 'uv', message: `Yüksək UV indeksi: ${uv}` });
    }
    if (windSpeed > 15) {
      alerts.push({ type: 'wind', message: `Güclü külək: ${windSpeed} m/s` });
    }

    return alerts;
  }, [weather]);
}
