import { useState, useEffect } from 'react';
import { getCurrentWeather } from '../services/weatherService';

/**
 * Fetch and cache current weather for a city.
 * @param {string|null} cityName
 */
export function useCityWeather(cityName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cityName) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setData(null);
    setLoading(true);
    setError(null);

    getCurrentWeather(cityName)
      .then((weather) => {
        if (!cancelled) setData(weather);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [cityName]);

  return { data, loading, error, refetch: () => {} };
}
