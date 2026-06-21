import PropTypes from 'prop-types';
import { useCityWeather } from '../../hooks/useCityWeather';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import {
  formatTemp,
  getWeatherEmoji,
  getUvLevel,
  getWindDirection,
  mpsToKmh,
} from '../../utils/weatherHelpers';
import { useWeatherStore } from '../../context/WeatherContext';
import styles from './CurrentWeather.module.css';

/**
 * @param {{ cityName: string|null }} props
 */
export function CurrentWeather({ cityName }) {
  const unit = useWeatherStore((s) => s.unit);
  const { data, loading, error } = useCityWeather(cityName);
  const alerts = useWeatherAlerts(data);

  if (!cityName) {
    return (
      <section className={styles.section} aria-label="Cari hava">
        <p className={styles.placeholder}>Detallı məlumat üçün şəhər kartına klik edin</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.section} aria-label="Cari hava">
        <LoadingSkeleton variant="detail" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className={styles.section} aria-label="Cari hava">
        <p className={styles.error}>{error || 'Məlumat yüklənə bilmədi'}</p>
      </section>
    );
  }

  const main = data.main;
  const weather = data.weather[0];
  const uv = getUvLevel(data.uvi);
  const windDir = getWindDirection(data.wind.deg);

  return (
    <section className={styles.section} aria-label="Cari hava">
      <div className={styles.top}>
        <div>
          <h2 className={styles.city}>{data.name}</h2>
          <p className={styles.desc}>{weather.description}</p>
        </div>
        <span className={styles.bigIcon} aria-hidden="true">
          {getWeatherEmoji(weather.main)}
        </span>
      </div>

      <p className={styles.mainTemp}>{formatTemp(main.temp, unit)}</p>
      <p className={styles.feels}>
        Hiss olunur: {formatTemp(main.feels_like, unit)}
      </p>

      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>💧</span>
          <span className={styles.statLabel}>Rütubət</span>
          <span className={styles.statValue}>{main.humidity}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>💨</span>
          <span className={styles.statLabel}>Külək</span>
          <span className={styles.statValue}>
            {mpsToKmh(data.wind.speed)} km/s {windDir}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>☀</span>
          <span className={styles.statLabel}>UV indeks</span>
          <span className={styles.statValue} style={{ color: uv.color }}>
            {data.uvi} — {uv.label}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>👁</span>
          <span className={styles.statLabel}>Görünürlük</span>
          <span className={styles.statValue}>{(data.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>🌡</span>
          <span className={styles.statLabel}>Təzyiq</span>
          <span className={styles.statValue}>{main.pressure} hPa</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className={styles.alerts}>
          {alerts.map((a) => (
            <span key={a.type} className={styles.alertBadge}>⚠ {a.message}</span>
          ))}
        </div>
      )}
    </section>
  );
}

CurrentWeather.propTypes = {
  cityName: PropTypes.string,
};
