import { useWeather } from "../context/WeatherContext";

const AirQuality = () => {
  const { weather } = useWeather();
  if (!weather?.airQuality) return null;

  const { airQuality } = weather;
  const pct = airQuality.usAqi != null ? Math.min((airQuality.usAqi / 300) * 100, 100) : 0;

  return (
    <div className="glass-card">
      <h2 className="card-title">Air Quality</h2>

      <div className="aqi-score" style={{ color: airQuality.color }}>
        {airQuality.usAqi ?? "—"}
      </div>
      <div className="aqi-label" style={{ color: airQuality.color }}>
        {airQuality.label}
      </div>

      <div className="aqi-bar-wrap">
        <div className="aqi-bar">
          <div
            className="aqi-fill"
            style={{ width: `${pct}%`, background: airQuality.color }}
          />
        </div>
        <div className="aqi-scale">
          <span>Good</span>
          <span>Hazardous</span>
        </div>
      </div>

      <div className="aqi-details">
        <div className="aqi-detail-row">
          <span>PM2.5</span>
          <span>{airQuality.pm25?.toFixed(1) ?? "—"} µg/m³</span>
        </div>
        <div className="aqi-detail-row">
          <span>PM10</span>
          <span>{airQuality.pm10?.toFixed(1) ?? "—"} µg/m³</span>
        </div>
        <div className="aqi-detail-row">
          <span>CO</span>
          <span>{airQuality.carbonMonoxide?.toFixed(0) ?? "—"} µg/m³</span>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
