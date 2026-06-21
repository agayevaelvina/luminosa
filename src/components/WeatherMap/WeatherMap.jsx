import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCurrentWeather } from '../../services/weatherService';
import { formatTemp, getTempColor } from '../../utils/weatherHelpers';
import styles from './WeatherMap.module.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function tempIcon(temp) {
  const color = getTempColor(temp);
  return L.divIcon({
    className: styles.customMarker,
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ cities }) {
  const map = useMap();
  useEffect(() => {
    if (cities.length > 0) {
      const bounds = cities.map((c) => [c.lat, c.lon]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }, [cities, map]);
  return null;
}

function CityMarker({ city, onSelect }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getCurrentWeather(city.name).then(setWeather).catch(() => {});
  }, [city.name]);

  const temp = weather?.main?.temp ?? 15;

  return (
    <Marker
      position={[city.lat, city.lon]}
      icon={tempIcon(temp)}
      eventHandlers={{ click: () => onSelect?.(city.name) }}
    >
      <Popup>
        <strong>{city.name}</strong>
        {weather ? (
          <p>{formatTemp(weather.main.temp)} — {weather.weather[0].description}</p>
        ) : (
          <p>Yüklənir...</p>
        )}
      </Popup>
    </Marker>
  );
}

/**
 * @param {{ cities: Array; activeCity: string|null; onSelectCity: Function }} props
 */
export function WeatherMap({ cities = [], onSelectCity }) {
  if (cities.length === 0) {
    return (
      <section className={styles.section} aria-label="Hava xəritəsi">
        <h3 className={styles.title}>Xəritə</h3>
        <p className={styles.placeholder}>Şəhər əlavə edin</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Hava xəritəsi">
      <h3 className={styles.title}>Xəritə</h3>
      <div className={styles.mapWrap}>
        <MapContainer center={[30, 20]} zoom={2} className={styles.map} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds cities={cities} />
          {cities.map((city) => (
            <CityMarker key={city.name} city={city} onSelect={onSelectCity} />
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

WeatherMap.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.object),
  activeCity: PropTypes.string,
  onSelectCity: PropTypes.func,
};
