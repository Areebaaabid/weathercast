const https = require("https");
const http = require("http");

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Invalid JSON response")); }
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

const fetchWithTimeout = (url, options, timeout = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

let dbStatus = "not connected";
let dbErrMsg = null;

const queryDB = async (query_text, params) => {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) { dbErrMsg = "DATABASE_URL not set"; return null; }
  try {
    const dbUrl = new URL(DATABASE_URL);
    const auth = Buffer.from(
      encodeURIComponent(dbUrl.username) + ":" + encodeURIComponent(dbUrl.password)
    ).toString("base64");

    const resp = await fetchWithTimeout(
      `https://${dbUrl.host}/sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ query: query_text, params: params || [] }),
      }
    );

    if (!resp.ok) {
      dbErrMsg = `HTTP ${resp.status}: ${await resp.text().catch(() => "no body")}`;
      return null;
    }

    const data = await resp.json();
    dbStatus = "connected";
    dbErrMsg = null;
    return { rows: data.rows || data };
  } catch (e) {
    dbErrMsg = e.cause ? e.cause.message : e.message;
    dbStatus = "error";
    return null;
  }
};

queryDB(
  `CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    temperature INTEGER,
    "weatherCode" INTEGER,
    description VARCHAR(255),
    "searchedAt" TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
  )`
).catch(() => {});

module.exports = async (req, res) => {
  const url = req.url;

  if (url === "/api/health") {
    return send(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? "url set" : "url NOT set",
      dbStatus,
      dbError: dbErrMsg,
    });
  }

  if (url === "/api/history") {
    if (req.method === "DELETE") {
      await queryDB("DELETE FROM searches").catch(() => {});
      return send(res, 200, { message: "History cleared" });
    }
    const result = await queryDB(
      `SELECT id, city, country, temperature, description, "weatherCode", "searchedAt"
       FROM searches ORDER BY "searchedAt" DESC LIMIT 10`
    );
    return send(res, 200, (result && result.rows) || []);
  }

  const historyDelete = url.match(/^\/api\/history\/(\d+)$/);
  if (historyDelete && req.method === "DELETE") {
    await queryDB("DELETE FROM searches WHERE id = $1", [parseInt(historyDelete[1])]).catch(() => {});
    return send(res, 200, { message: "Deleted successfully" });
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

      queryDB(
        `INSERT INTO searches (city, country, latitude, longitude, temperature, "weatherCode", description, "searchedAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())`,
        [name, country, latitude, longitude, Math.round(current.temperature_2m), current.weather_code, description]
      ).catch(() => {});

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