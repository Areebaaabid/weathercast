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

const SearchHistory = () => {
  const { history, searchWeather, removeHistoryItem, clearAllHistory } = useWeather();

  if (!history.length) return (
    <div className="glass-card">
      <h2 className="card-title">Recent Searches</h2>
      <p className="empty-history">No searches yet.</p>
    </div>
  );

  return (
    <div className="glass-card">
      <div className="history-header">
        <h2 className="card-title">Recent Searches</h2>
        <button className="clear-btn" onClick={clearAllHistory}>Clear all</button>
      </div>

      <ul className="history-list">
        {history.map((item) => (
          <li key={item._id} className="history-item">
            <button
              className="history-city-btn"
              onClick={() => searchWeather(item.city)}
            >
              <span className="history-emoji">{EMOJI[item.weatherCode] || "🌡️"}</span>
              <div className="history-info">
                <span className="history-city">{item.city}, {item.country}</span>
                <span className="history-temp">{item.temperature}°C · {item.description}</span>
              </div>
            </button>
            <button
              className="history-delete"
              onClick={() => removeHistoryItem(item._id)}
              aria-label="Remove"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;
