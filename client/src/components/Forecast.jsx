import { useWeather } from "../context/WeatherContext";

const EMOJI = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "⛈️",
  71: "🌨️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

const Forecast = () => {
  const { weather } = useWeather();
  if (!weather?.forecast) return null;

  return (
    <div className="forecast-section">
      <h2 className="section-title">5-Day Forecast</h2>
      <div className="forecast-grid">
        {weather.forecast.map((day, i) => {
          const date = new Date(day.date);
          const dayName = i === 0
            ? "Today"
            : date.toLocaleDateString("en-US", { weekday: "short" });
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <div key={day.date} className="glass-card forecast-card">
              <div className="forecast-day">{dayName}</div>
              <div className="forecast-date">{dateStr}</div>
              <div className="forecast-emoji">{EMOJI[day.weatherCode] || "🌡️"}</div>
              <div className="forecast-desc">{day.description}</div>
              <div className="forecast-temps">
                <span className="temp-hi">{day.tempMax}°</span>
                <span className="temp-lo">{day.tempMin}°</span>
              </div>
              {day.precipitationChance > 0 && (
                <div className="precip">💧 {day.precipitationChance}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;
