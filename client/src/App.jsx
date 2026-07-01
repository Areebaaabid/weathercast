import { useEffect } from "react";
import { WeatherProvider, useWeather } from "./context/WeatherContext";
import { useBackground } from "./hooks/useBackground";
import ErrorBoundary from "./components/ErrorBoundary";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import AirQuality from "./components/AirQuality";
import SearchHistory from "./components/SearchHistory";
import WeatherScene from "./components/WeatherScene";

const Dashboard = () => {
  const { weather, loading, error, loadHistory } = useWeather();
  const theme = useBackground(weather?.current?.weatherCode);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <div className={`app bg-${theme}`}>
      <WeatherScene theme={theme} />
      <div className="overlay" />
      <div className="container">
        <header className="app-header">
          <div className="app-logo">⛅</div>
          <h1 className="app-title">SkyCast</h1>
          <p className="app-sub">Live weather, anywhere on Earth</p>
        </header>

        <SearchBar />

        {error && <div className="error-banner">{error}</div>}
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <span>Fetching weather data...</span>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeather />
            <div className="grid-two">
              <AirQuality />
              <SearchHistory />
            </div>
            <Forecast />
          </>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <span className="empty-icon">🌍</span>
            <p>Search any city to see live weather.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <WeatherProvider>
      <Dashboard />
    </WeatherProvider>
  </ErrorBoundary>
);

export default App;
