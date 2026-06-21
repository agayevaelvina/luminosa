import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getCurrentWeather } from '../../services/weatherService';
import { MOCK_CITIES } from '../../services/mockData';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { formatTemp, getWeatherEmoji, mpsToKmh } from '../../utils/weatherHelpers';
import styles from './CityComparison.module.css';

const MAX_COMPARE = 3;
const METRICS = [
  { key: 'temp', label: 'Temperatur (°C)', color: '#3b9eff' },
  { key: 'humidity', label: 'Rütubət (%)', color: '#51cf66' },
  { key: 'wind', label: 'Külək (km/s)', color: '#ff922b' },
];

/**
 * @param {{ cities?: Array }} props - tracked cities (fallback, all MOCK_CITIES used)
 */
export function CityComparison({ cities = [] }) {
  const availableCities = MOCK_CITIES.map(({ name, country, lat, lon }) => ({
    name,
    country,
    lat,
    lon,
  }));
  
  const [selected, setSelected] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('temp');

  const toggleCity = (name) => {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, name];
    });
  };

  useEffect(() => {
    if (selected.length < 2) {
      setWeatherData([]);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          selected.map(async (name) => {
            const data = await getCurrentWeather(name);
            return {
              name: data.name,
              temp: Math.round(data.main.temp),
              humidity: data.main.humidity,
              wind: mpsToKmh(data.wind.speed),
              feelsLike: Math.round(data.main.feels_like),
              pressure: data.main.pressure,
              description: data.weather[0].description,
              main: data.weather[0].main,
            };
          }),
        );
        if (!cancelled) setWeatherData(results);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selected]);

  if (availableCities.length < 2) {
    return (
      <section className={styles.section} aria-label="Şəhər müqayisəsi">
        <h3 className={styles.title}>Şəhər Müqayisəsi</h3>
        <p className={styles.placeholder}>Müqayisə üçün ən azı 2 şəhər əlavə edin</p>
      </section>
    );
  }

  const chartData = weatherData.map((w) => ({
    name: w.name,
    temp: w.temp,
    humidity: w.humidity,
    wind: w.wind,
  }));

  const activeMetric = METRICS.find((m) => m.key === metric);

  return (
    <section className={styles.section} aria-label="Şəhər müqayisəsi">
      <h3 className={styles.title}>Şəhər Müqayisəsi</h3>
      <p className={styles.placeholder}>
        {cities.length < 2
          ? 'Müqayisə üçün ən azı 2 şəhər əlavə edin'
          : `${cities.length} şəhər — müqayisə paneli tezliklə`}
      </p>
      <p className={styles.hint}>Maksimum {MAX_COMPARE} şəhər seçin</p>

      <div className={styles.selector}>
        {availableCities.map((city) => {
          const isSelected = selected.includes(city.name);
          const disabled = !isSelected && selected.length >= MAX_COMPARE;
          return (
            <button
              key={city.name}
              type="button"
              className={`${styles.chip} ${isSelected ? styles.chipActive : ''}`}
              disabled={disabled}
              onClick={() => toggleCity(city.name)}
            >
              {isSelected ? '✓ ' : ''}{city.name}
            </button>
          );
        })}
      </div>

      {selected.length < 2 && (
        <p className={styles.placeholder}>Müqayisə üçün ən azı 2 şəhər seçin</p>
      )}

      {loading && <LoadingSkeleton variant="chart" />}
      {error && <p className={styles.error}>{error}</p>}

      {weatherData.length >= 2 && !loading && (
        <>
          <div className={styles.metricTabs}>
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`${styles.metricTab} ${metric === m.key ? styles.metricActive : ''}`}
                onClick={() => setMetric(m.key)}
              >
                {m.label.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                  }}
                  formatter={(value) => [value, activeMetric?.label.split(' (')[0]]}
                />
                <Legend />
                <Bar
                  dataKey={metric}
                  name={activeMetric?.label}
                  fill={activeMetric?.color}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Şəhər</th>
                  <th>Temp</th>
                  <th>Hiss</th>
                  <th>Rütubət</th>
                  <th>Külək</th>
                  <th>Təzyiq</th>
                  <th>Şərait</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{formatTemp(row.temp)}</td>
                    <td>{formatTemp(row.feelsLike)}</td>
                    <td>{row.humidity}%</td>
                    <td>{row.wind} km/s</td>
                    <td>{row.pressure} hPa</td>
                    <td>
                      <span className={styles.weatherCell}>
                        {getWeatherEmoji(row.main)} {row.description}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
