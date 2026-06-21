import { useState, useEffect } from 'react';

const DEFAULT_CITY = 'Bakı';

/**
 * Detect user location via Geolocation API.
 * Falls back to default city when permission denied or unavailable.
 */
export function useGeolocation() {
  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    city: DEFAULT_CITY,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation dəstəklənmir',
        city: DEFAULT_CITY,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: DEFAULT_CITY,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        setLocation({
          lat: null,
          lon: null,
          city: DEFAULT_CITY,
          loading: false,
          error: error.message,
          permissionDenied: error.code === error.PERMISSION_DENIED,
        });
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return location;
}
