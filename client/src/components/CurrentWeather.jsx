import { useWeather } from "../context/WeatherContext";

const WEATHER_EMOJI = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "⛈️",
  71: "🌨️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const StatItem = ({ label, value }) => (
  <div className="stat-item">
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const CurrentWeather = () => {
  const { weather } = useWeather();
  if (!weather) return null;

  const { location, current } = weather;
  const emoji = WEATHER_EMOJI[current.weatherCode] || "🌡️";

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const today = weather.forecast?.[0];

  return (
    <div className="glass-card current-weather">
      <div className="current-top">
        <div className="current-left">
          <div className="location-name">
            {location.name}, {location.country}
          </div>
          <div className="current-temp">{current.temperature}°C</div>
          <div className="current-desc">{current.description}</div>
          <div className="feels-like">Feels like {current.feelsLike}°C</div>
        </div>
        <div className="weather-emoji">{emoji}</div>
      </div>

      <div className="current-stats">
        <StatItem label="Humidity" value={`${current.humidity}%`} />
        <StatItem label="Wind" value={`${current.windSpeed} km/h`} />
        <StatItem label="Pressure" value={`${Math.round(current.pressure)} hPa`} />
        <StatItem label="UV Index" value={current.uvIndex ?? "—"} />
        {today && (
          <>
            <StatItem label="Sunrise" value={formatTime(today.sunrise)} />
            <StatItem label="Sunset" value={formatTime(today.sunset)} />
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentWeather;
