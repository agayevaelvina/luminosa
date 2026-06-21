import { useEffect } from 'react';
import { AddCitySearch } from '../AddCitySearch/AddCitySearch';
import { FavoritesList } from '../FavoritesList/FavoritesList';
import { CityCard } from '../CityCard/CityCard';
import { CurrentWeather } from '../CurrentWeather/CurrentWeather';
import { ForecastTabs } from '../ForecastTabs/ForecastTabs';
import { HistoricalChart } from '../HistoricalChart/HistoricalChart';
import { CityComparison } from '../CityComparison/CityComparison';
import { WeatherMap } from '../WeatherMap/WeatherMap';
import { NotificationBanner } from '../NotificationBanner/NotificationBanner';
import { useWeatherStore } from '../../context/WeatherContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useCityWeather } from '../../hooks/useCityWeather';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';
import { DEFAULT_TRACKED_CITIES } from '../../services/mockData';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const cities = useWeatherStore((s) => s.cities);
  const favorites = useWeatherStore((s) => s.favorites);
  const activeCity = useWeatherStore((s) => s.activeCity);
  const setActiveCity = useWeatherStore((s) => s.setActiveCity);
  const removeCity = useWeatherStore((s) => s.removeCity);
  const toggleFavorite = useWeatherStore((s) => s.toggleFavorite);
  const setCities = useWeatherStore((s) => s.setCities);
  const setFavorites = useWeatherStore((s) => s.setFavorites);

  const [storedFavorites, setStoredFavorites] = useLocalStorage('luminosa-favorites', []);
  const geo = useGeolocation();
  const { data: activeWeather } = useCityWeather(activeCity);
  const alerts = useWeatherAlerts(activeWeather);

  // İlk yükləmədə default şəhərləri göstər
  useEffect(() => {
    if (cities.length === 0) {
      setCities(DEFAULT_TRACKED_CITIES);
      setActiveCity(DEFAULT_TRACKED_CITIES[0].name);
    }
  }, [cities.length, setCities, setActiveCity]);

  // Geolocation icazəsi veriləndə yaxın şəhəri aktiv et
  useEffect(() => {
    if (!geo.loading && geo.city && cities.length > 0 && !activeCity) {
      setActiveCity(geo.city);
    }
  }, [geo.loading, geo.city, cities.length, activeCity, setActiveCity]);

  // localStorage ↔ store sinxronizasiyası
  useEffect(() => {
    if (storedFavorites.length > 0 && favorites.length === 0) {
      setFavorites(storedFavorites);
    }
  }, [storedFavorites, favorites.length, setFavorites]);

  useEffect(() => {
    setStoredFavorites(favorites);
  }, [favorites, setStoredFavorites]);

  return (
    <div className={styles.dashboard}>
      {geo.permissionDenied && (
        <p className={styles.geoNotice}>
          Məkan icazəsi rədd edildi — default şəhər: Bakı
        </p>
      )}

      <NotificationBanner alerts={alerts} />

      <div className={styles.toolbar}>
        <AddCitySearch />
        <span className={styles.cityCount}>{cities.length} şəhər izlənir</span>
      </div>

      <FavoritesList />

      <section className={styles.grid} aria-label="İzlənən şəhərlər">
        {cities.map((city) => (
          <CityCard
            key={city.name}
            city={city}
            isFavorite={favorites.includes(city.name)}
            isActive={activeCity === city.name}
            onSelect={setActiveCity}
            onRemove={removeCity}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </section>

      <div className={styles.detail}>
        <CurrentWeather cityName={activeCity} />
        <ForecastTabs cityName={activeCity} />
      </div>

      <div className={styles.analytics}>
        <HistoricalChart cityName={activeCity} />
        <CityComparison cities={cities} />
      </div>

      <WeatherMap cities={cities} activeCity={activeCity} onSelectCity={setActiveCity} />
    </div>
  );
}
