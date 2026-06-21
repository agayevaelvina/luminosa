import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { Dashboard } from './components/Dashboard/Dashboard';
import { WeatherProvider, useWeatherStore } from './context/WeatherContext';
import styles from './App.module.css';

function AppHeader() {
  const theme = useWeatherStore((s) => s.theme);
  const setTheme = useWeatherStore((s) => s.setTheme);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            ☀
          </span>
          <h1 className={styles.title}>Luminosa</h1>
          <span className={styles.subtitle}>Hava Proqnozu & Analitika</span>
        </div>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'İşıqlı rejim' : 'Qaranlıq rejim'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}

function App() {
  const theme = useWeatherStore((s) => s.theme);

  return (
    <WeatherProvider>
      <div className={styles.app} data-theme={theme}>
        <ErrorBoundary>
          <AppHeader />
          <main className={styles.main}>
            <Dashboard />
          </main>
        </ErrorBoundary>
      </div>
    </WeatherProvider>
  );
}

export default App;
