# 🌦️ Weather Forecast Pro — MERN Stack

A full-stack weather dashboard built with **MongoDB, Express, React, and Node.js**. Features live weather data, air quality, 5-day forecast, and search history saved to a database.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, CSS               |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB, Mongoose                 |
| Data      | Open-Meteo API (free, no key)     |

---

## Project Structure

```
weather-mern/
├── server/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Business logic
│   ├── middleware/      # Error handling, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── client/
│   └── src/
│       ├── components/  # React components
│       ├── context/     # Global state (React Context)
│       ├── hooks/       # Custom hooks
│       └── services/    # Axios API calls
└── docker-compose.yml
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas)

### 1. Clone and setup server

```bash
cd server
cp .env.example .env
# Edit .env → set your MONGO_URI
npm install
npm run dev
```

### 2. Setup client (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

---

## API Endpoints

| Method | Route                 | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/weather/:city`  | Fetch live weather for a city  |
| GET    | `/api/history`        | Get last 10 searches from DB   |
| DELETE | `/api/history/:id`    | Remove one history entry       |
| DELETE | `/api/history`        | Clear all history              |
| GET    | `/api/health`         | Server health check            |

---

## Features

- 🌤️ **Dynamic backgrounds** — changes with real weather conditions
- 🌧️ **Animated particles** — rain, snow, lightning by weather type
- 💨 **Current conditions** — temp, feels like, wind, humidity, pressure, UV
- 📅 **5-day forecast** — high/low temps, precipitation chance, sunrise/sunset
- 🫁 **Air quality** — PM2.5, PM10, US AQI with color-coded levels
- 🕐 **Search history** — saved to MongoDB, one click to re-search
- ⚡ **Rate limiting** — 100 requests per 15 minutes per IP

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/weatherapp
CLIENT_URL=http://localhost:5173
```

---

## Built by

Built with React + Express + MongoDB. Weather data from [Open-Meteo](https://open-meteo.com/) — free and no API key required.
