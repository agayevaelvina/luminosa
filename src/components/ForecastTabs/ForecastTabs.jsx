import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getHourlyForecast, getDailyForecast } from '../../services/weatherService';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { formatTemp, getWeatherEmoji } from '../../utils/weatherHelpers';
import { useWeatherStore } from '../../context/WeatherContext';
import styles from './ForecastTabs.module.css';

/**
 * @param {{ cityName: string|null }} props
 */
export function ForecastTabs({ cityName }) {
  const [tab, setTab] = useState('hourly');
  const [hourly, setHourly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const unit = useWeatherStore((s) => s.unit);

  useEffect(() => {
    if (!cityName) {
      setHourly(null);
      setDaily(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [h, d] = await Promise.all([
          getHourlyForecast(cityName),
          getDailyForecast(cityName),
        ]);
        if (!cancelled) {
          setHourly(h);
          setDaily(d);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [cityName]);

  if (!cityName) {
    return (
      <section className={styles.section} aria-label="Proqnoz">
        <p className={styles.placeholder}>Şəhər seçin — proqnoz burada görünəcək</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Proqnoz">
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'hourly'}
          className={`${styles.tab} ${tab === 'hourly' ? styles.active : ''}`}
          onClick={() => setTab('hourly')}
        >
          Saatlıq
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'daily'}
          className={`${styles.tab} ${tab === 'daily' ? styles.active : ''}`}
          onClick={() => setTab('daily')}
        >
          7 Günlük
        </button>
      </div>

      {loading && <LoadingSkeleton variant="chart" />}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && tab === 'hourly' && hourly && (
        <div className={styles.scroll} role="tabpanel">
          {hourly.list.map((item, i) => {
            const hour = new Date(item.dt * 1000).getHours();
            const label = i === 0 ? 'İndi' : `${hour}:00`;
            return (
              <div key={item.dt} className={styles.item}>
                <span className={styles.itemTime}>{label}</span>
                <span className={styles.itemIcon} aria-hidden="true">
                  {getWeatherEmoji(item.weather[0].main)}
                </span>
                <span className={styles.itemTemp}>{formatTemp(item.main.temp, unit)}</span>
                <span className={styles.itemPop}>{Math.round(item.pop * 100)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && tab === 'daily' && daily && (
        <div className={styles.dailyList} role="tabpanel">
          {daily.list.map((day) => (
            <div key={day.dt} className={styles.dailyRow}>
              <span className={styles.dailyDay}>{day.dayLabel}</span>
              <span className={styles.itemIcon} aria-hidden="true">
                {getWeatherEmoji(day.weather[0].main)}
              </span>
              <span className={styles.dailyTemps}>
                <span className={styles.dailyMax}>{formatTemp(day.temp.max, unit)}</span>
                <span className={styles.dailyMin}>{formatTemp(day.temp.min, unit)}</span>
              </span>
              <span className={styles.itemPop}>{Math.round(day.pop * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

ForecastTabs.propTypes = {
  cityName: PropTypes.string,
};
