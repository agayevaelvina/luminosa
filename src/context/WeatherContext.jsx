import { create } from 'zustand';

/** @typedef {{ name: string; country: string; lat: number; lon: number }} TrackedCity */

export const useWeatherStore = create((set) => ({
  cities: [],
  activeCity: null,
  favorites: [],
  unit: 'metric',
  theme: 'dark',

  addCity: (city) =>
    set((state) => {
      if (state.cities.some((c) => c.name === city.name)) return state;
      return { cities: [...state.cities, city] };
    }),

  removeCity: (cityName) =>
    set((state) => ({
      cities: state.cities.filter((c) => c.name !== cityName),
      activeCity: state.activeCity === cityName ? null : state.activeCity,
    })),

  setActiveCity: (cityName) => set({ activeCity: cityName }),

  toggleFavorite: (cityName) =>
    set((state) => ({
      favorites: state.favorites.includes(cityName)
        ? state.favorites.filter((f) => f !== cityName)
        : [...state.favorites, cityName],
    })),

  setUnit: (unit) => set({ unit }),
  setTheme: (theme) => set({ theme }),
  setFavorites: (favorites) => set({ favorites }),
  setCities: (cities) => set({ cities }),
}));

/** @param {{ children: import('react').ReactNode }} props */
export function WeatherProvider({ children }) {
  return children;
}
