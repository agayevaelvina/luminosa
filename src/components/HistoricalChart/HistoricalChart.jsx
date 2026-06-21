import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getHistoricalData } from '../../services/weatherService';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import styles from './HistoricalChart.module.css';

/**
 * @param {{ cityName: string|null }} props
 */
export function HistoricalChart({ cityName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cityName) {
      setData(null);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getHistoricalData(cityName);
        if (!cancelled) setData(result);
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
      <section className={styles.section} aria-label="Tarixi qrafik">
        <h3 className={styles.title}>Son 7 gün — Temperatur</h3>
        <p className={styles.placeholder}>Şəhər seçin</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Tarixi qrafik">
      <h3 className={styles.title}>Son 7 gün — {cityName}</h3>

      {loading && <LoadingSkeleton variant="chart" />}
      {error && <p className={styles.error}>{error}</p>}

      {data && !loading && (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.list} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b9eff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b9eff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} unit="°" />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                }}
                formatter={(value) => [`${value}°C`, 'Temperatur']}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#3b9eff"
                strokeWidth={2}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

HistoricalChart.propTypes = {
  cityName: PropTypes.string,
};
