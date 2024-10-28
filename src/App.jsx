import React, { useState } from "react";

function App() {
  const [city, setCity] = useState(""); // To hold the user input for city
  const [airData, setAirData] = useState(null); // To hold air pollution data
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // For error handling

  const apiKey = "e22012acf969a46237037adf10e263ce"; // Replace with your actual API key

  // Function to handle search
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch lat/lon using Geocoding API
      const geoResponse = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );

      if (!geoResponse.ok) {
        throw new Error("Error fetching geocoding data");
      }

      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
        throw new Error("City not found");
      }

      const { lat, lon } = geoData[0];

      // Fetch air pollution data using lat/lon
      const airResponse = await fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );

      if (!airResponse.ok) {
        throw new Error("Error fetching air pollution data");
      }

      const airData = await airResponse.json();
      setAirData(airData); // Update state with pollution data
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to categorize AQI levels
  const getAQICategory = (aqi) => {
    switch (aqi) {
      case 1:
        return {
          level: "Good",
          description: "Air quality is healthy",
          color: "green",
        };
      case 2:
        return {
          level: "Fair",
          description: "Air quality is moderate",
          color: "yellow",
        };
      case 3:
        return {
          level: "Moderate",
          description: "Some pollutants present",
          color: "orange",
        };
      case 4:
        return {
          level: "Poor",
          description: "Air quality is unhealthy",
          color: "red",
        };
      case 5:
        return {
          level: "Very Poor",
          description: "Very unhealthy air",
          color: "purple",
        };
      default:
        return {
          level: "Unknown",
          description: "No data available",
          color: "gray",
        };
    }
  };

  // OpenWeatherMap Air Pollution API structure
  const pollution = airData?.list[0].components;
  const AQI = airData?.list[0].main.aqi; // Air Quality Index (1 - 5)
  const AQICategory = getAQICategory(AQI); // Get AQI level and description

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-green-600 shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">
          Air Pollution Checker
        </h1>

        {/* Search Field */}
        <div className="mb-6">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="w-full p-3 border rounded-lg text-lg"
          />
          <button
            onClick={handleSearch}
            className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg"
          >
            Search
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && <div className="text-center">Loading...</div>}

        {/* Error Message */}
        {error && <div className="text-red-600 text-center">{error}</div>}

        {/* Display Pollution Data */}
        {airData && (
          <>
            <div
              className={`flex justify-between items-center p-3 bg-${AQICategory.color}-100 rounded-lg`}
            >
              <span className="text-lg font-semibold">
                Air Quality Index (AQI):
              </span>
              <span className={`text-lg text-${AQICategory.color}-600`}>
                {AQICategory.level}
              </span>
            </div>
            <p className="text-center text-sm mt-2 text-gray-600">
              {AQICategory.description}
            </p>

            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Pollutant Levels</h2>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>PM2.5:</span>
                  <span>{pollution.pm2_5} µg/m³</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>PM10:</span>
                  <span>{pollution.pm10} µg/m³</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>CO (Carbon Monoxide):</span>
                  <span>{pollution.co} µg/m³</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>NO₂ (Nitrogen Dioxide):</span>
                  <span>{pollution.no2} µg/m³</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>O₃ (Ozone):</span>
                  <span>{pollution.o3} µg/m³</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
