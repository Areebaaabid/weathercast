import { createContext, useContext, useState, useCallback } from "react";
import { fetchWeather, fetchHistory, deleteHistoryItem, clearHistory } from "../services/api";

const WeatherContext = createContext(null);

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCity, setCurrentCity] = useState("");

  const searchWeather = useCallback(async (city) => {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setCurrentCity(trimmedCity);
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWeather(trimmedCity);
      setWeather(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchHistory();
      setHistory(res.data);
    } catch {
      // History is non-critical
    }
  }, []);

  const removeHistoryItem = useCallback(async (id) => {
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((h) => h._id !== id));
  }, []);

  const clearAllHistory = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        history,
        loading,
        error,
        currentCity,
        setCurrentCity,
        searchWeather,
        loadHistory,
        removeHistoryItem,
        clearAllHistory,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used inside WeatherProvider");
  return ctx;
};
