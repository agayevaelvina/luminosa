import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { getCurrentWeather } from '../../services/weatherService';
import { MOCK_CITIES } from '../../services/mockData';
import { formatTemp, getTempColor } from '../../utils/weatherHelpers';
import { useWeatherStore } from '../../context/WeatherContext';
import styles from './WeatherMap.module.css';

function tempIcon(temp, isActive, isTracked) {
  const color = getTempColor(temp);
  const size = isActive ? 18 : 14;
  
  const ring = isActive
    ? '0 0 0 3px rgba(59,158,255,.6)'
    : isTracked
      ? '0 0 0 2px rgba(255,179,71,.5)'
      : '0 2px 6px rgba(0,0,0,.4)';

  return L.divIcon({
    className: styles.customMarker,
    html: `<div style="background:${color}; width:${size}px; height:${size}px; border-radius:50%; border:2px solid #fff; box-shadow:${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ cities }) {
  const map = useMap();

  useEffect(() => {
    if (cities.length > 0) {
      const bounds = cities.map((c) => [c.lat, c.lon]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 3 });
    }
  }, [cities, map]);

  return null;
}

FitBounds.propTypes = {
  cities: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    })
  ).isRequired,
};

function CityMarker({ city, isActive, isTracked, onSelect }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getCurrentWeather(city.name)
      .then(setWeather)
      .catch(() => {});
  }, [city.name]);

  const temp = weather?.main?.temp ?? city.climate?.base ?? 15;

  return (
    <Marker
      position={[city.lat, city.lon]}
      icon={tempIcon(temp, isActive, isTracked)}
      eventHandlers={{ click: () => onSelect?.(city) }}
    >
      <Popup>
        <strong>{city.name}</strong>
        <span className={styles.popupCountry}> ({city.country})</span>
        {weather ? (
          <>
            <p>{formatTemp(weather.main.temp)} — {weather.weather[0].description}</p>
            {!isTracked && (
              <p className={styles.popupHint}>Klik edərək izləməyə əlavə edin</p>
            )}
          </>
        ) : (
          <p>Yüklənir...</p>
        )}
      </Popup>
    </Marker>
  );
}

CityMarker.propTypes = {
  city: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
  isTracked: PropTypes.bool,
  onSelect: PropTypes.func,
};

export function WeatherMap({ activeCity }) {
  const trackedCities = useWeatherStore((s) => s.cities);
  const addCity = useWeatherStore((s) => s.addCity);
  const setActiveCity = useWeatherStore((s) => s.setActiveCity);

  const trackedNames = new Set(trackedCities.map((c) => c.name));

  const handleSelect = (city) => {
    setActiveCity(city.name);
    if (!trackedNames.has(city.name)) {
      addCity({ name: city.name, country: city.country, lat: city.lat, lon: city.lon });
    }
  };

  return (
    <section className={styles.section} aria-label="Hava xəritəsi">
      <div className={styles.header}>
        <h3 className={styles.title}>Xəritə — Bütün şəhərlər</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendActive}`} /> Aktiv
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendTracked}`} /> İzlənir
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} /> Mövcud
          </span>
        </div>
      </div>

      <div className={styles.cityList}>
        {MOCK_CITIES.map((city) => {
          const isActive = activeCity === city.name;
          const isTracked = trackedNames.has(city.name);
          return (
            <button
              key={city.name}
              type="button"
              className={`${styles.cityBtn} ${isActive ? styles.cityBtnActive : ''} ${isTracked ? styles.cityBtnTracked : ''}`}
              onClick={() => handleSelect(city)}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      <div className={styles.mapWrap}>
        <MapContainer center={[30, 20]} zoom={2} className={styles.map} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds cities={MOCK_CITIES} />
          {MOCK_CITIES.map((city) => (
            <CityMarker
              key={city.name}
              city={city}
              isActive={activeCity === city.name}
              isTracked={trackedNames.has(city.name)}
              onSelect={handleSelect}
            />
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

WeatherMap.propTypes = {
  activeCity: PropTypes.string,
};
