import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCityWeather } from '../../hooks/useCityWeather';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { formatTemp, getWeatherEmoji } from '../../utils/weatherHelpers';
import { useWeatherStore } from '../../context/WeatherContext';
import styles from './CityCard.module.css';

/**
 * @param {{ city: object; onSelect: Function; onRemove: Function; onToggleFavorite: Function; isFavorite: boolean; isActive: boolean }} props
 */
export function CityCard({ city, onSelect, onRemove, onToggleFavorite, isFavorite, isActive }) {
  const unit = useWeatherStore((s) => s.unit);
  const { data, loading, error } = useCityWeather(city.name);
  const temp = data?.main?.temp;
  const weatherMain = data?.weather?.[0]?.main;
  const description = data?.weather?.[0]?.description;

  return (
    <article
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect?.(city.name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(city.name)}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.name}>{city.name}</h3>
          <span className={styles.country}>{city.country}</span>
        </div>
        <button
          type="button"
          className={`${styles.favorite} ${isFavorite ? styles.favActive : ''}`}
          aria-label={isFavorite ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(city.name);
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {loading && <LoadingSkeleton variant="text" />}

      {error && <p className={styles.error}>{error}</p>}

      {data && !loading && (
        <div className={styles.body}>
          <span className={styles.icon} aria-hidden="true">
            {getWeatherEmoji(weatherMain)}
          </span>
          <div className={styles.tempBlock}>
            <span className={styles.temp}>{formatTemp(temp, unit)}</span>
            <span className={styles.desc}>{description}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.remove}
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(city.name);
        }}
        aria-label={`${city.name} sil`}
      >
        ×
      </button>
    </article>
  );
}

CityCard.propTypes = {
  city: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func,
  onRemove: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  isFavorite: PropTypes.bool,
  isActive: PropTypes.bool,
};
