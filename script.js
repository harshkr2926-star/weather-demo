/* =========================================================
   SKYCAST - FRONTEND
   API key is kept on the Node/Express backend.
========================================================= */

let currentUnit = "celsius";
let currentWeatherData = null;
let currentForecastData = null;

const inputBox = document.getElementById("input-box");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("locationBtn");
const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const closeError = document.getElementById("closeError");
const recentSearches = document.getElementById("recentSearches");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const forecastGrid = document.getElementById("forecastGrid");
const aqValue = document.getElementById("aqValue");
const aqStatus = document.getElementById("aqStatus");
const temperatureHighLow = document.getElementById("temperatureHighLow");
const rainChance = document.getElementById("rainChance");
const hourlyGrid = document.getElementById("hourlyGrid");
const uvValue = document.getElementById("uvValue");
const uvText = document.getElementById("uvText");
const precipValue = document.getElementById("precipValue");
const windDirection = document.getElementById("windDirection");
const windDetails = document.getElementById("windDetails");

const unitButtons = document.querySelectorAll(".unit-btn");
const popularCities = document.querySelectorAll(".popular-city");


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(url) {
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}


/* =========================================================
   UNIT SWITCHING
========================================================= */

unitButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedUnit = button.dataset.unit;

        if (selectedUnit === currentUnit) return;

        currentUnit = selectedUnit;
        updateUnitButtons();

        if (currentWeatherData && currentForecastData) {
            displayWeather(currentWeatherData, currentForecastData);
        }
    });
});

function updateUnitButtons() {
    unitButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.unit === currentUnit
        );
    });
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function formatTemperature(celsius) {
    const value =
        currentUnit === "fahrenheit"
            ? celsiusToFahrenheit(celsius)
            : celsius;

    return Math.round(value);
}

function getTemperatureUnit() {
    return currentUnit === "fahrenheit" ? "°F" : "°C";
}


/* =========================================================
   SEARCH
========================================================= */

searchBtn.addEventListener("click", () => {
    searchCity();
});

inputBox.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchCity();
    }
});

function searchCity() {
    const city = inputBox.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        inputBox.focus();
        return;
    }

    getWeatherByCity(city);
}

popularCities.forEach(button => {
    button.addEventListener("click", () => {
        const city = button.dataset.city;
        inputBox.value = city;
        getWeatherByCity(city);
    });
});


/* =========================================================
   WEATHER BY CITY
========================================================= */

async function getWeatherByCity(city) {
    showLoading();
    hideError();

    try {
        const encodedCity = encodeURIComponent(city);

        const [weatherData, forecastData] = await Promise.all([
            apiRequest(`/api/weather?city=${encodedCity}`),
            apiRequest(`/api/forecast?city=${encodedCity}`)
        ]);

        currentWeatherData = weatherData;
        currentForecastData = forecastData;

        displayWeather(weatherData, forecastData);

        getAirQuality(
            weatherData.coord.lat,
            weatherData.coord.lon
        );

        saveRecentSearch(weatherData.name);
        inputBox.value = weatherData.name;

    } catch (error) {
        console.error("Weather Error:", error);
        showError(error.message || "Unable to get weather information.");
    } finally {
        hideLoading();
    }
}


/* =========================================================
   DISPLAY WEATHER
========================================================= */

function displayWeather(data, forecastData) {
    const unit = getTemperatureUnit();

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    currentDate.textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    temperature.textContent =
        formatTemperature(data.main.temp);

    const unitElement =
        document.querySelector(".temperature sup");

    if (unitElement) {
        unitElement.textContent = unit;
    }

    feelsLike.textContent =
        `${formatTemperature(data.main.feels_like)}${unit}`;

    weatherDescription.textContent =
        capitalize(data.weather[0].description);

    humidity.textContent =
        `${data.main.humidity}%`;

    const windKmh =
        data.wind.speed * 3.6;

    wind.textContent =
        `${Math.round(windKmh)} km/h`;

    if (windDetails) {
        windDetails.textContent =
            `${Math.round(windKmh)} km/h`;
    }

    if (windDirection) {
        windDirection.textContent =
            getWindDirection(data.wind.deg);
    }

    visibility.textContent =
        typeof data.visibility === "number"
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "N/A";

    pressure.textContent =
        `${data.main.pressure} hPa`;

    sunrise.textContent =
        formatTime(data.sys.sunrise, data.timezone);

    sunset.textContent =
        formatTime(data.sys.sunset, data.timezone);

    setWeatherIcon(data.weather[0].main);
    changeBackground(data.weather[0].main);

    createForecast(forecastData);
    createHourlyForecast(forecastData);
    updateHighLow(forecastData);
    updateRainChance(forecastData);

    if (precipValue) {
        updateRainChance(forecastData, precipValue);
    }

    if (uvValue) {
        uvValue.textContent = "N/A";
        uvText.textContent = "Not provided by current API";
    }
}


/* =========================================================
   HIGH / LOW
========================================================= */

function updateHighLow(data) {
    if (!temperatureHighLow || !data.list?.length) return;

    const today = data.list.slice(0, 8);
    const temperatures = today.map(item => item.main.temp);

    const high = Math.max(...temperatures);
    const low = Math.min(...temperatures);
    const unit = getTemperatureUnit();

    temperatureHighLow.textContent =
        `${formatTemperature(low)}${unit} / ${formatTemperature(high)}${unit}`;
}


/* =========================================================
   RAIN
========================================================= */

function updateRainChance(data, targetElement = rainChance) {
    if (!targetElement || !data.list?.length) return;

    const items = data.list.slice(0, 8);

    const probabilities =
        items.map(item => (item.pop || 0) * 100);

    const highest = Math.max(...probabilities);

    targetElement.textContent =
        `${Math.round(highest)}%`;
}


/* =========================================================
   HOURLY
========================================================= */

function createHourlyForecast(data) {
    if (!hourlyGrid) return;

    hourlyGrid.innerHTML = "";

    const hours = data.list.slice(0, 8);

    hours.forEach((item, index) => {
        const time = new Date(item.dt * 1000)
            .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
            });

        const card = document.createElement("div");
        card.className = "hour-card";

        const icon = getForecastIcon(item.weather[0].main);
        const rain = Math.round((item.pop || 0) * 100);

        card.innerHTML = `
            <span>${index === 0 ? "Now" : escapeHTML(time)}</span>
            <i class="${icon}"></i>
            <strong>${formatTemperature(item.main.temp)}°</strong>
            <small>${rain}% rain</small>
        `;

        hourlyGrid.appendChild(card);
    });
}


/* =========================================================
   5 DAY FORECAST
========================================================= */

function createForecast(data) {
    if (!forecastGrid) return;

    forecastGrid.innerHTML = "";

    const dailyForecast = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        const time = item.dt_txt.split(" ")[1];

        if (!dailyForecast[date] || time === "12:00:00") {
            dailyForecast[date] = item;
        }
    });

    const days =
        Object.values(dailyForecast).slice(0, 5);

    days.forEach((item, index) => {
        const date = new Date(item.dt * 1000);

        const dayName =
            index === 0
                ? "Today"
                : date.toLocaleDateString("en-US", {
                    weekday: "short"
                });

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <span>${dayName}</span>
            <i class="${getForecastIcon(item.weather[0].main)}"></i>
            <strong>${formatTemperature(item.main.temp)}°</strong>
            <small>${capitalize(item.weather[0].description)}</small>
        `;

        forecastGrid.appendChild(card);
    });
}


/* =========================================================
   ICONS
========================================================= */

function getForecastIcon(condition) {
    const icons = {
        Clear: "fa-solid fa-sun",
        Clouds: "fa-solid fa-cloud",
        Rain: "fa-solid fa-cloud-rain",
        Drizzle: "fa-solid fa-cloud-showers-heavy",
        Thunderstorm: "fa-solid fa-cloud-bolt",
        Snow: "fa-solid fa-snowflake",
        Mist: "fa-solid fa-smog",
        Smoke: "fa-solid fa-smog",
        Haze: "fa-solid fa-smog",
        Dust: "fa-solid fa-smog",
        Fog: "fa-solid fa-smog",
        Sand: "fa-solid fa-smog",
        Ash: "fa-solid fa-smog",
        Squall: "fa-solid fa-wind",
        Tornado: "fa-solid fa-tornado"
    };

    return icons[condition] || "fa-solid fa-cloud-sun";
}

function setWeatherIcon(condition) {
    weatherIcon.className =
        getForecastIcon(condition);
}


/* =========================================================
   AIR QUALITY
========================================================= */

async function getAirQuality(latitude, longitude) {
    try {
        const data = await apiRequest(
            `/api/air?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
        );

        if (!data.list?.length) {
            aqValue.textContent = "--";
            aqStatus.textContent = "Unavailable";
            return;
        }

        const aqi = data.list[0].main.aqi;

        const status = {
            1: "Good",
            2: "Fair",
            3: "Moderate",
            4: "Poor",
            5: "Very Poor"
        };

        aqValue.textContent = aqi * 20;
        aqStatus.textContent = status[aqi] || "Unknown";

    } catch (error) {
        console.warn("Air Quality Error:", error);
        aqValue.textContent = "--";
        aqStatus.textContent = "Unavailable";
    }
}


/* =========================================================
   MY LOCATION
========================================================= */

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    showLoading();
    hideError();

    navigator.geolocation.getCurrentPosition(
        position => {
            getWeatherByCoordinates(
                position.coords.latitude,
                position.coords.longitude
            );
        },
        error => {
            hideLoading();

            if (error.code === 1) {
                showError("Location permission denied. Please allow location access.");
            } else if (error.code === 2) {
                showError("Unable to determine your location.");
            } else if (error.code === 3) {
                showError("Location request timed out.");
            } else {
                showError("Unable to get your location.");
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});


/* =========================================================
   WEATHER BY COORDINATES
========================================================= */

async function getWeatherByCoordinates(latitude, longitude) {
    try {
        const query =
            `lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

        const [weatherData, forecastData] = await Promise.all([
            apiRequest(`/api/weather/coordinates?${query}`),
            apiRequest(`/api/forecast/coordinates?${query}`)
        ]);

        currentWeatherData = weatherData;
        currentForecastData = forecastData;

        displayWeather(weatherData, forecastData);

        getAirQuality(latitude, longitude);

        saveRecentSearch(weatherData.name);
        inputBox.value = weatherData.name;

    } catch (error) {
        console.error("Location Error:", error);
        showError(error.message || "Unable to get location weather.");
    } finally {
        hideLoading();
    }
}


/* =========================================================
   TIME
========================================================= */

function formatTime(timestamp, timezoneOffset) {
    const date =
        new Date((timestamp + timezoneOffset) * 1000);

    return date.toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   WIND
========================================================= */

function getWindDirection(degrees) {
    if (typeof degrees !== "number") return "--";

    const directions =
        ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

    return directions[
        Math.round(degrees / 45) % 8
    ];
}


/* =========================================================
   RECENT SEARCHES
========================================================= */

function saveRecentSearch(city) {
    let searches =
        JSON.parse(localStorage.getItem("skycastSearches")) || [];

    searches =
        searches.filter(item =>
            item.toLowerCase() !== city.toLowerCase()
        );

    searches.unshift(city);
    searches = searches.slice(0, 5);

    localStorage.setItem(
        "skycastSearches",
        JSON.stringify(searches)
    );

    displayRecentSearches();
}

function displayRecentSearches() {
    if (!recentSearches) return;

    const searches =
        JSON.parse(localStorage.getItem("skycastSearches")) || [];

    recentSearches.innerHTML = "";

    searches.forEach(city => {
        const button = document.createElement("button");

        button.type = "button";
        button.innerHTML =
            `<i class="fa-solid fa-clock"></i> ${escapeHTML(city)}`;

        button.addEventListener("click", () => {
            inputBox.value = city;
            getWeatherByCity(city);
        });

        recentSearches.appendChild(button);
    });
}


/* =========================================================
   BACKGROUND
========================================================= */

function changeBackground(condition) {
    const backgrounds = {
        Clear: `
            radial-gradient(circle at 15% 15%, rgba(250,204,21,.18), transparent 30%),
            linear-gradient(135deg,#07111f,#172554)
        `,
        Clouds: `
            radial-gradient(circle at 15% 15%, rgba(148,163,184,.18), transparent 30%),
            linear-gradient(135deg,#07111f,#1e293b)
        `,
        Rain: `
            radial-gradient(circle at 15% 15%, rgba(56,189,248,.18), transparent 30%),
            linear-gradient(135deg,#020617,#0c4a6e)
        `,
        Thunderstorm: `
            radial-gradient(circle at 15% 15%, rgba(139,92,246,.20), transparent 30%),
            linear-gradient(135deg,#020617,#1e1b4b)
        `,
        Snow: `
            radial-gradient(circle at 15% 15%, rgba(255,255,255,.15), transparent 30%),
            linear-gradient(135deg,#0f172a,#334155)
        `,
        Mist: `
            radial-gradient(circle at 15% 15%, rgba(148,163,184,.16), transparent 30%),
            linear-gradient(135deg,#111827,#374151)
        `
    };

    document.body.style.background =
        backgrounds[condition] || backgrounds.Clouds;
}


/* =========================================================
   UI STATE
========================================================= */

function showLoading() {
    if (loading) loading.style.display = "flex";
    if (weatherContent) weatherContent.style.display = "none";
}

function hideLoading() {
    if (loading) loading.style.display = "none";
    if (weatherContent) weatherContent.style.display = "block";
}

function showError(message) {
    if (!errorBox) {
        alert(message);
        return;
    }

    errorMessage.textContent = message;
    errorBox.style.display = "flex";
}

function hideError() {
    if (errorBox) errorBox.style.display = "none";
}

if (closeError) {
    closeError.addEventListener("click", hideError);
}


/* =========================================================
   HELPERS
========================================================= */

function capitalize(text) {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


/* =========================================================
   START
========================================================= */

updateUnitButtons();
displayRecentSearches();

console.log("SkyCast frontend loaded.");
