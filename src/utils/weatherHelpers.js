/**
 * Weather utility helpers — unit conversion, UV labels, wind direction, etc.
 * Full implementation in later steps.
 */

export function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

export function getUvLevel(uvIndex) {
  if (uvIndex < 3) return { label: 'Aşağı', color: '#51cf66' };
  if (uvIndex < 6) return { label: 'Orta', color: '#ffd43b' };
  if (uvIndex < 8) return { label: 'Yüksək', color: '#ff922b' };
  return { label: 'Çox yüksək', color: '#ff6b6b' };
}

export function getWindDirection(deg) {
  const directions = ['Ş', 'Ş-Ş', 'Ş', 'C-Ş', 'C', 'C-Q', 'Q', 'Q-Q'];
  return directions[Math.round(deg / 45) % 8];
}

export function getTempColor(temp) {
  if (temp >= 35) return '#ff6b6b';
  if (temp >= 25) return '#ff922b';
  if (temp >= 15) return '#ffd43b';
  if (temp >= 5) return '#51cf66';
  if (temp >= 0) return '#3b9eff';
  return '#748ffc';
}

const WEATHER_EMOJI = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
};

export function getWeatherEmoji(main) {
  return WEATHER_EMOJI[main] || '🌡️';
}

export function formatTemp(temp, unit = 'metric') {
  const value = unit === 'imperial' ? celsiusToFahrenheit(temp) : temp;
  const suffix = unit === 'imperial' ? '°F' : '°C';
  return `${Math.round(value)}${suffix}`;
}

export function mpsToKmh(mps) {
  return Math.round(mps * 3.6);
}
