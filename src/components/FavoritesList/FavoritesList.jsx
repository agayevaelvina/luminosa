import { useWeatherStore } from '../../context/WeatherContext';
import styles from './FavoritesList.module.css';

export function FavoritesList() {
  const favorites = useWeatherStore((s) => s.favorites);
  const setActiveCity = useWeatherStore((s) => s.setActiveCity);
  const activeCity = useWeatherStore((s) => s.activeCity);

  if (favorites.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Sevimli şəhərlər">
      <h3 className={styles.title}>Sevimlilər</h3>
      <div className={styles.list}>
        {favorites.map((name) => (
          <button
            key={name}
            type="button"
            className={`${styles.chip} ${activeCity === name ? styles.active : ''}`}
            onClick={() => setActiveCity(name)}
          >
            ★ {name}
          </button>
        ))}
      </div>
    </section>
  );
}
