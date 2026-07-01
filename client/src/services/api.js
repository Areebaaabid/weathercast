import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export const fetchWeather = (city) => api.get(`/weather/${encodeURIComponent(city)}`);
export const fetchHistory = () => api.get("/history");
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`);
export const clearHistory = () => api.delete("/history");

export default api;
