import { useWeather } from "../context/WeatherContext";

const SearchBar = () => {
  const { currentCity, setCurrentCity, searchWeather, loading } = useWeather();

  const handleSearch = () => {
    const trimmedCity = currentCity.trim();
    if (trimmedCity) searchWeather(trimmedCity);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search a city..."
        value={currentCity}
        onChange={(e) => setCurrentCity(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        disabled={loading}
      />
      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={loading || !currentCity.trim()}
      >
        {loading ? "..." : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;
