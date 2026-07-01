const https = require("https");

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    }).on("error", reject);
  });

const WEATHER_CODES = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy Fog",
  51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
  80: "Rain Showers", 81: "Rain Showers", 82: "Violent Showers",
  95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Hail",
};

const getAqiLabel = (aqi) => {
  if (aqi == null) return "—";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getAqiColor = (aqi) => {
  if (aqi == null) return "#6b7280";
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

const send = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
};

module.exports = async (req, res) => {
  const url = req.url;

  if (url === "/api/health") {
    return send(res, 200, { status: "ok", timestamp: new Date().toISOString() });
  }

  const weatherMatch = url.match(/^\/api\/weather\/(.+)$/);
  if (weatherMatch) {
    const city = decodeURIComponent(weatherMatch[1]);

    try {
      const geoRes = await fetchJson(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoRes.results?.length) {
        return send(res, 404, { error: `City "${city}" not found.` });
      }

      const place = geoRes.results[0];
      const { latitude, longitude, name, country, timezone } = place;

      const [weatherRes, aqiRes] = await Promise.all([
        fetchJson(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=${timezone || "auto"}&forecast_days=5`
        ),
        fetchJson(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10,us_aqi,carbon_monoxide`
        ),
      ]);

      const current = weatherRes.current;
      const daily = weatherRes.daily;
      const aqi = aqiRes.current;
      const description = WEATHER_CODES[current.weather_code] || "Unknown";

      return send(res, 200, {
        location: { name, country, latitude, longitude, timezone },
        current: {
          temperature: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          windDirection: current.wind_direction_10m,
          weatherCode: current.weather_code,
          description,
          pressure: current.surface_pressure,
          visibility: current.visibility,
          uvIndex: current.uv_index,
        },
        forecast: daily.time.map((date, i) => ({
          date,
          weatherCode: daily.weather_code[i],
          description: WEATHER_CODES[daily.weather_code[i]] || "Unknown",
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          precipitationChance: daily.precipitation_probability_max[i],
          windMax: Math.round(daily.wind_speed_10m_max[i]),
          sunrise: daily.sunrise[i],
          sunset: daily.sunset[i],
        })),
        airQuality: aqi
          ? {
              pm25: aqi.pm2_5,
              pm10: aqi.pm10,
              usAqi: aqi.us_aqi,
              carbonMonoxide: aqi.carbon_monoxide,
              label: getAqiLabel(aqi.us_aqi),
              color: getAqiColor(aqi.us_aqi),
            }
          : null,
      });
    } catch (err) {
      return send(res, 500, { error: "Something went wrong. Try again." });
    }
  }

  return send(res, 404, { error: "Route not found" });
};