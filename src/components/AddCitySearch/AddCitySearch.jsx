import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../../services/weatherService';
import { useWeatherStore } from '../../context/WeatherContext';
import styles from './AddCitySearch.module.css';

export function AddCitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const addCity = useWeatherStore((s) => s.addCity);
  const cities = useWeatherStore((s) => s.cities);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchCities(query);
        setResults(found);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    const exists = cities.some((c) => c.name === city.name);
    if (!exists) {
      addCity({ name: city.name, country: city.country, lat: city.lat, lon: city.lon });
    }
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.search}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          type="search"
          className={styles.input}
          placeholder="Şəhər əlavə et (Bakı, London, Tokyo...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Şəhər axtar"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {loading && <span className={styles.spinner} aria-hidden="true" />}
      </div>

      {open && results.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {results.map((city) => (
            <li key={city.name}>
              <button
                type="button"
                className={styles.option}
                role="option"
                onClick={() => handleSelect(city)}
              >
                <span className={styles.optionName}>{city.name}</span>
                <span className={styles.optionCountry}>{city.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.length > 0 && !loading && results.length === 0 && (
        <div className={styles.noResults}>Şəhər tapılmadı</div>
      )}
    </div>
  );
}
