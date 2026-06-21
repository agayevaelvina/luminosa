/**
 * Weather data abstraction layer.
 * Currently uses mock data with simulated API delay.
 * Replace function bodies with real OpenWeatherMap fetch calls later.
 */

import {
  generateCurrentWeather,
  generateHourlyForecast,
  generateDailyForecast,
  generateHistoricalData,
  searchMockCities,
  findCity,
} from './mockData';

const MOCK_DELAY_MS = 700;
const SIMULATE_ERROR = false;

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} cityName */
export async function getCurrentWeather(cityName) {
  await delay(500 + Math.random() * 500);
  if (SIMULATE_ERROR) throw new Error('API xətası simulyasiya edildi');
  if (!findCity(cityName)) {
    const err = new Error(`Şəhər tapılmadı: ${cityName}`);
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }
  return generateCurrentWeather(cityName);
}

/** @param {string} cityName */
export async function getHourlyForecast(cityName) {
  await delay();
  if (!findCity(cityName)) {
    const err = new Error(`Şəhər tapılmadı: ${cityName}`);
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }
  return generateHourlyForecast(cityName);
}

/** @param {string} cityName */
export async function getDailyForecast(cityName) {
  await delay();
  if (!findCity(cityName)) {
    const err = new Error(`Şəhər tapılmadı: ${cityName}`);
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }
  return generateDailyForecast(cityName);
}

/** @param {string} cityName */
export async function getHistoricalData(cityName) {
  await delay();
  if (!findCity(cityName)) {
    const err = new Error(`Şəhər tapılmadı: ${cityName}`);
    err.code = 'CITY_NOT_FOUND';
    throw err;
  }
  return generateHistoricalData(cityName);
}

/** @param {string} query */
export async function searchCities(query) {
  await delay(300);
  return searchMockCities(query);
}
