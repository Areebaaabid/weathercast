const axios = require("axios");
const Search = require("../models/Search");

const WEATHER_CODES = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy Fog",
  51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
  80: "Rain Showers", 81: "Rain Showers", 82: "Violent Showers",
  95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Hail",
};

const getWeather = async (req, res) => {
  const { city } = req.params;

  if (!city || city.trim().length < 1) {
    return res.status(400).json({ error: "City name is required" });
  }

  // 1. Geocode
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search`,
    { params: { name: city.trim(), count: 1, language: "en", format: "json" } }
  );

  if (!geoRes.data.results?.length) {
    return res.status(404).json({ error: `City "${city}" not found. Check the spelling.` });
  }

  const place = geoRes.data.results[0];
  const { latitude, longitude, name, country, timezone } = place;

  // 2. Fetch weather + air quality in parallel
  const [weatherRes, aqiRes] = await Promise.all([
    axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude, longitude,
        current: [
          "temperature_2m", "apparent_temperature", "relative_humidity_2m",
          "wind_speed_10m", "wind_direction_10m", "weather_code",
          "surface_pressure", "visibility", "uv_index",
        ].join(","),
        daily: [
          "weather_code", "temperature_2m_max", "temperature_2m_min",
          "precipitation_probability_max", "wind_speed_10m_max", "sunrise", "sunset",
        ].join(","),
        timezone: timezone || "auto",
        forecast_days: 5,
      },
    }),
    axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality`, {
      params: {
        latitude, longitude,
        current: ["pm2_5", "pm10", "us_aqi", "carbon_monoxide"].join(","),
      },
    }),
  ]);

  const current = weatherRes.data.current;
  const daily = weatherRes.data.daily;
  const aqi = aqiRes.data.current;
  const description = WEATHER_CODES[current.weather_code] || "Unknown";

  // 3. Upsert into PostgreSQL (non-critical — skip on failure)
  try {
    await Search.upsert({
      city: name,
      country,
      latitude,
      longitude,
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      description,
      searchedAt: new Date(),
    });

    const allSearches = await Search.findAll({ order: [["searchedAt", "DESC"]] });
    if (allSearches.length > 20) {
      const toDelete = allSearches.slice(20).map((s) => s.id);
      await Search.destroy({ where: { id: toDelete } });
    }
  } catch {
    // DB unavailable — weather data still returned
  }

  // 4. Send response
  res.json({
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
    airQuality: aqi ? {
      pm25: aqi.pm2_5,
      pm10: aqi.pm10,
      usAqi: aqi.us_aqi,
      carbonMonoxide: aqi.carbon_monoxide,
      label: getAqiLabel(aqi.us_aqi),
      color: getAqiColor(aqi.us_aqi),
    } : null,
  });
};

function getAqiLabel(aqi) {
  if (aqi == null) return "—";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getAqiColor(aqi) {
  if (aqi == null) return "#6b7280";
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
}

module.exports = { getWeather };
