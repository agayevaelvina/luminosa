/**
 * Realistic mock weather data generator.
 * Response shapes mirror OpenWeatherMap API for easy migration.
 */

/** @typedef {{ name: string; country: string; lat: number; lon: number; climate: object }} MockCity */

/** @type {MockCity[]} */
export const MOCK_CITIES = [
  { name: 'Bakı', country: 'AZ', lat: 40.4093, lon: 49.8671, climate: { base: 24, amplitude: 10, humidity: 62, pressure: 1013 } },
  { name: 'İstanbul', country: 'TR', lat: 41.0082, lon: 28.9784, climate: { base: 20, amplitude: 9, humidity: 68, pressure: 1015 } },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, climate: { base: 14, amplitude: 6, humidity: 75, pressure: 1012 } },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006, climate: { base: 18, amplitude: 12, humidity: 58, pressure: 1016 } },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, climate: { base: 22, amplitude: 8, humidity: 70, pressure: 1014 } },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708, climate: { base: 38, amplitude: 8, humidity: 45, pressure: 1008 } },
  { name: 'Moskva', country: 'RU', lat: 55.7558, lon: 37.6173, climate: { base: 8, amplitude: 14, humidity: 72, pressure: 1010 } },
  { name: 'Berlin', country: 'DE', lat: 52.52, lon: 13.405, climate: { base: 16, amplitude: 8, humidity: 65, pressure: 1013 } },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, climate: { base: 17, amplitude: 7, humidity: 70, pressure: 1014 } },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, climate: { base: 21, amplitude: 7, humidity: 60, pressure: 1015 } },
];

const WEATHER_TYPES = [
  { id: 800, main: 'Clear', description: 'açıq səma', icon: '01d' },
  { id: 801, main: 'Clouds', description: 'az buludlu', icon: '02d' },
  { id: 802, main: 'Clouds', description: 'parçalı buludlu', icon: '03d' },
  { id: 500, main: 'Rain', description: 'yüngül yağış', icon: '10d' },
  { id: 701, main: 'Mist', description: 'duman', icon: '50d' },
  { id: 600, main: 'Snow', description: 'qar', icon: '13d' },
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function findCity(cityName) {
  const normalized = cityName.trim().toLowerCase();
  return MOCK_CITIES.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.name.toLowerCase().replace('i̇', 'i') === normalized,
  );
}

function getCityOrThrow(cityName) {
  const city = findCity(cityName);
  if (!city) {
    const err = new Error(`Şəhər tapılmadı: ${cityName}`);
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }
  return city;
}

function hourTemp(city, hourOffset = 0) {
  const now = new Date();
  const hour = (now.getHours() + hourOffset) % 24;
  const dayWave = Math.sin(((hour - 6) / 24) * Math.PI * 2);
  const seed = hash(city.name + now.toDateString());
  const noise = (seededRandom(seed + hour) - 0.5) * 3;
  return Math.round((city.climate.base + dayWave * (city.climate.amplitude / 2) + noise) * 10) / 10;
}

function pickWeather(city, offset = 0) {
  const seed = hash(city.name + offset);
  const idx = seed % WEATHER_TYPES.length;
  const type = WEATHER_TYPES[idx];

  if (city.climate.base > 32 && type.main === 'Snow') return WEATHER_TYPES[0];
  if (city.climate.base < 5 && type.main === 'Clear' && seed % 3 === 0) return WEATHER_TYPES[5];

  return type;
}

function buildMain(city, temp) {
  return {
    temp,
    feels_like: Math.round((temp + (seededRandom(hash(city.name)) - 0.5) * 4) * 10) / 10,
    temp_min: Math.round((temp - 2) * 10) / 10,
    temp_max: Math.round((temp + 3) * 10) / 10,
    pressure: city.climate.pressure + Math.floor(seededRandom(hash(city.name + 'p')) * 6) - 3,
    humidity: Math.min(95, Math.max(20, city.climate.humidity + Math.floor(seededRandom(hash(city.name + 'h')) * 20) - 10)),
  };
}

/** OpenWeatherMap-style current weather */
export function generateCurrentWeather(cityName) {
  const city = getCityOrThrow(cityName);
  const temp = hourTemp(city, 0);
  const weather = pickWeather(city, 0);
  const windDeg = (hash(city.name + 'wind') % 360);
  const windSpeed = Math.round((2 + seededRandom(hash(city.name + 'ws')) * 12) * 10) / 10;
  const uvIndex = city.climate.base > 30
    ? Math.round(8 + seededRandom(hash(city.name + 'uv')) * 3)
    : Math.round(1 + seededRandom(hash(city.name + 'uv')) * 7);

  return {
    coord: { lon: city.lon, lat: city.lat },
    weather: [{ ...weather }],
    base: 'stations',
    main: buildMain(city, temp),
    visibility: Math.round(8000 + seededRandom(hash(city.name + 'vis')) * 12000),
    wind: { speed: windSpeed, deg: windDeg },
    clouds: { all: weather.main === 'Clear' ? 5 : 40 + (hash(city.name) % 50) },
    dt: Math.floor(Date.now() / 1000),
    sys: { country: city.country, sunrise: 0, sunset: 0 },
    timezone: 0,
    id: hash(city.name),
    name: city.name,
    cod: 200,
    uvi: uvIndex,
  };
}

/** OpenWeatherMap One Call-style hourly list (24 items) */
export function generateHourlyForecast(cityName) {
  const city = getCityOrThrow(cityName);

  const list = Array.from({ length: 24 }, (_, i) => {
    const temp = hourTemp(city, i);
    const weather = pickWeather(city, i);
    return {
      dt: Math.floor(Date.now() / 1000) + i * 3600,
      main: { temp, feels_like: temp - 1 + seededRandom(hash(city.name + i)) },
      weather: [{ ...weather }],
      clouds: { all: 30 + (i % 40) },
      wind: { speed: 2 + seededRandom(hash(city.name + 'h' + i)) * 8, deg: (windDeg(city, i)) },
      pop: weather.main === 'Rain' ? 0.4 + seededRandom(hash(city.name + 'pop' + i)) * 0.5 : seededRandom(hash(city.name + 'pop' + i)) * 0.25,
      dt_txt: '',
    };
  });

  return { cod: '200', message: 0, cnt: 24, list, city: { name: city.name, country: city.country } };
}

function windDeg(city, i) {
  return (hash(city.name + 'wd' + i) % 360);
}

/** 7-day daily forecast */
export function generateDailyForecast(cityName) {
  const city = getCityOrThrow(cityName);
  const dayNames = ['Bazar', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'];

  const daily = Array.from({ length: 7 }, (_, i) => {
    const baseTemp = city.climate.base + Math.sin(i * 0.8) * 3;
    const min = Math.round((baseTemp - city.climate.amplitude / 2 + seededRandom(hash(city.name + 'dmin' + i)) * 2) * 10) / 10;
    const max = Math.round((baseTemp + city.climate.amplitude / 2 + seededRandom(hash(city.name + 'dmax' + i)) * 2) * 10) / 10;
    const weather = pickWeather(city, i + 10);
    const date = new Date();
    date.setDate(date.getDate() + i);

    return {
      dt: Math.floor(date.getTime() / 1000),
      temp: { day: (min + max) / 2, min, max, night: min - 2, eve: max - 1, morn: min + 1 },
      weather: [{ ...weather }],
      pop: weather.main === 'Rain' ? 0.5 : 0.1 + seededRandom(hash(city.name + 'dp' + i)) * 0.3,
      humidity: city.climate.humidity,
      wind_speed: 2 + seededRandom(hash(city.name + 'dw' + i)) * 6,
      dayLabel: i === 0 ? 'Bu gün' : dayNames[date.getDay()],
    };
  });

  return { cod: '200', city: { name: city.name, country: city.country }, list: daily };
}

/** Last 7 days temperature history for charts */
export function generateHistoricalData(cityName) {
  const city = getCityOrThrow(cityName);
  const data = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const trend = Math.sin((6 - i) * 0.9) * 4;
    const temp = Math.round((city.climate.base + trend + (seededRandom(hash(city.name + 'hist' + i)) - 0.5) * 3) * 10) / 10;
    const min = Math.round((temp - 4) * 10) / 10;
    const max = Math.round((temp + 5) * 10) / 10;

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('az-AZ', { weekday: 'short', day: 'numeric', month: 'short' }),
      temp,
      min,
      max,
      humidity: city.climate.humidity + Math.floor(seededRandom(hash(city.name + 'hh' + i)) * 15) - 7,
    });
  }

  return { city: city.name, list: data };
}

/** Search cities by name */
export function searchMockCities(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  return MOCK_CITIES.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({
    name: c.name,
    country: c.country,
    lat: c.lat,
    lon: c.lon,
    state: undefined,
  }));
}

export const DEFAULT_TRACKED_CITIES = MOCK_CITIES.slice(0, 4).map(({ name, country, lat, lon }) => ({
  name,
  country,
  lat,
  lon,
}));
