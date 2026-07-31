/* =========================================================
   SKYCAST WEATHER APP
   CORRECTED VERSION
   Celsius / Fahrenheit switching included
========================================================= */


/* =========================================================
   1. API
========================================================= */

// IMPORTANT:
// Put your NEW OpenWeather API key here.
const API_KEY = "a6ea71a71294e845a6d055fb92a11f42";

const WEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

const AIR_API =
    "https://api.openweathermap.org/data/2.5/air_pollution";


/* =========================================================
   2. GLOBAL VARIABLES
========================================================= */

let currentUnit = "celsius";

let currentWeatherData = null;
let currentForecastData = null;


/* =========================================================
   3. HTML ELEMENTS
========================================================= */

const inputBox =
    document.getElementById("input-box");

const searchBtn =
    document.getElementById("search-btn");

const locationBtn =
    document.getElementById("locationBtn");

const loading =
    document.getElementById("loading");

const weatherContent =
    document.getElementById("weatherContent");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const closeError =
    document.getElementById("closeError");

const recentSearches =
    document.getElementById("recentSearches");

const cityName =
    document.getElementById("cityName");

const currentDate =
    document.getElementById("currentDate");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon =
    document.getElementById("weatherIcon");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const visibility =
    document.getElementById("visibility");

const pressure =
    document.getElementById("pressure");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const forecastGrid =
    document.getElementById("forecastGrid");

const aqValue =
    document.getElementById("aqValue");

const aqStatus =
    document.getElementById("aqStatus");

const temperatureHighLow =
    document.getElementById("temperatureHighLow");

const rainChance =
    document.getElementById("rainChance");

const hourlyGrid =
    document.getElementById("hourlyGrid");

const uvValue =
    document.getElementById("uvValue");

const uvText =
    document.getElementById("uvText");

const precipValue =
    document.getElementById("precipValue");

const windDirection =
    document.getElementById("windDirection");

const windDetails =
    document.getElementById("windDetails");


/* =========================================================
   4. UNIT BUTTONS
========================================================= */

const unitButtons =
    document.querySelectorAll(".unit-btn");


unitButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedUnit =
            button.dataset.unit;

        if (selectedUnit === currentUnit) {
            return;
        }

        currentUnit =
            selectedUnit;

        updateUnitButtons();

        if (
            currentWeatherData &&
            currentForecastData
        ) {

            displayWeather(
                currentWeatherData,
                currentForecastData
            );

        }

    });

});


/* =========================================================
   5. UPDATE UNIT BUTTON UI
========================================================= */

function updateUnitButtons() {

    unitButtons.forEach(function (button) {

        button.classList.toggle(
            "active",
            button.dataset.unit === currentUnit
        );

    });

}


/* =========================================================
   6. TEMPERATURE CONVERSION
========================================================= */

function celsiusToFahrenheit(celsius) {

    return (
        (celsius * 9 / 5) + 32
    );

}


function formatTemperature(celsius) {

    if (currentUnit === "fahrenheit") {

        return Math.round(
            celsiusToFahrenheit(celsius)
        );

    }

    return Math.round(celsius);

}


function getTemperatureUnit() {

    return currentUnit === "fahrenheit"
        ? "°F"
        : "°C";

}


/* =========================================================
   7. API KEY CHECK
========================================================= */

function hasValidAPIKey() {

    if (
        !API_KEY ||
        API_KEY === "YOUR_NEW_OPENWEATHER_API_KEY" ||
        API_KEY === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE"
    ) {

        showError(
            "Please add your OpenWeather API key inside script.js."
        );

        return false;
    }

    return true;
}


/* =========================================================
   8. SEARCH BUTTON
========================================================= */

searchBtn.addEventListener(
    "click",
    function () {

        const city =
            inputBox.value.trim();

        if (city === "") {

            showError(
                "Please enter a city name."
            );

            inputBox.focus();

            return;
        }

        getWeatherByCity(city);

    }
);


/* =========================================================
   9. ENTER KEY SEARCH
========================================================= */

inputBox.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            const city =
                inputBox.value.trim();

            if (city === "") {

                showError(
                    "Please enter a city name."
                );

                return;
            }

            getWeatherByCity(city);

        }

    }
);


/* =========================================================
   10. POPULAR CITY BUTTONS
========================================================= */

const popularCities =
    document.querySelectorAll(".popular-city");


popularCities.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            const city =
                button.dataset.city;

            inputBox.value =
                city;

            getWeatherByCity(city);

        }
    );

});


/* =========================================================
   11. GET WEATHER BY CITY
========================================================= */

async function getWeatherByCity(city) {

    if (!hasValidAPIKey()) {
        return;
    }

    showLoading();
    hideError();

    try {

        /* CURRENT WEATHER */

        const weatherURL =
            `${WEATHER_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const weatherResponse =
            await fetch(weatherURL);

        const weatherData =
            await weatherResponse.json();

        if (!weatherResponse.ok) {

            throw new Error(
                getErrorMessage(
                    weatherResponse.status,
                    weatherData
                )
            );

        }


        /* FORECAST */

        const forecastURL =
            `${FORECAST_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const forecastResponse =
            await fetch(forecastURL);

        const forecastData =
            await forecastResponse.json();

        if (!forecastResponse.ok) {

            throw new Error(
                getErrorMessage(
                    forecastResponse.status,
                    forecastData
                )
            );

        }


        /* SAVE DATA */

        currentWeatherData =
            weatherData;

        currentForecastData =
            forecastData;


        /* DISPLAY */

        displayWeather(
            weatherData,
            forecastData
        );


        /* AIR QUALITY */

        getAirQuality(
            weatherData.coord.lat,
            weatherData.coord.lon
        );


        /* SAVE SEARCH */

        saveRecentSearch(
            weatherData.name
        );


        inputBox.value =
            weatherData.name;


    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Unable to get weather information."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   12. DISPLAY WEATHER
========================================================= */

function displayWeather(
    data,
    forecastData
) {

    const unit =
        getTemperatureUnit();


    /* CITY */

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    /* DATE */

    currentDate.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    /* TEMPERATURE */

    temperature.textContent =
        formatTemperature(
            data.main.temp
        );


    /* UNIT */

    const temperatureUnitElement =
        document.querySelector(
            ".temperature sup"
        );

    if (temperatureUnitElement) {

        temperatureUnitElement.textContent =
            unit;

    }


    /* FEELS LIKE */

    feelsLike.textContent =
        `${formatTemperature(data.main.feels_like)}${unit}`;


    /* DESCRIPTION */

    weatherDescription.textContent =
        capitalize(
            data.weather[0].description
        );


    /* HUMIDITY */

    humidity.textContent =
        `${data.main.humidity}%`;


    /* WIND */

    const windKmh =
        data.wind.speed * 3.6;

    wind.textContent =
        `${Math.round(windKmh)} km/h`;


    if (windDetails) {

        windDetails.textContent =
            `${Math.round(windKmh)} km/h`;

    }


    /* WIND DIRECTION */

    if (windDirection) {

        windDirection.textContent =
            getWindDirection(
                data.wind.deg
            );

    }


    /* VISIBILITY */

    if (
        typeof data.visibility === "number"
    ) {

        visibility.textContent =
            `${(data.visibility / 1000).toFixed(1)} km`;

    } else {

        visibility.textContent =
            "N/A";

    }


    /* PRESSURE */

    pressure.textContent =
        `${data.main.pressure} hPa`;


    /* SUNRISE */

    sunrise.textContent =
        formatTime(
            data.sys.sunrise,
            data.timezone
        );


    /* SUNSET */

    sunset.textContent =
        formatTime(
            data.sys.sunset,
            data.timezone
        );


    /* ICON */

    setWeatherIcon(
        data.weather[0].main
    );


    /* BACKGROUND */

    changeBackground(
        data.weather[0].main
    );


    /* FORECAST */

    createForecast(
        forecastData
    );


    /* HOURLY */

    createHourlyForecast(
        forecastData
    );


    /* HIGH / LOW */

    updateHighLow(
        forecastData
    );


    /* RAIN */

    updateRainChance(
        forecastData
    );


    /* PRECIPITATION */

    if (precipValue) {

        updateRainChance(
            forecastData,
            precipValue
        );

    }

}


/* =========================================================
   13. HIGH / LOW
========================================================= */

function updateHighLow(data) {

    if (!temperatureHighLow) {
        return;
    }

    const today =
        data.list.slice(0, 8);

    if (!today.length) {
        return;
    }

    const temperatures =
        today.map(function (item) {

            return item.main.temp;

        });

    const high =
        Math.max(...temperatures);

    const low =
        Math.min(...temperatures);

    const unit =
        getTemperatureUnit();

    temperatureHighLow.textContent =
        `${formatTemperature(low)}${unit} / ${formatTemperature(high)}${unit}`;

}


/* =========================================================
   14. RAIN CHANCE
========================================================= */

function updateRainChance(
    data,
    targetElement = rainChance
) {

    if (!targetElement) {
        return;
    }

    const items =
        data.list.slice(0, 8);

    if (!items.length) {
        return;
    }

    const probabilities =
        items.map(function (item) {

            return (
                (item.pop || 0) * 100
            );

        });

    const highest =
        Math.max(...probabilities);

    targetElement.textContent =
        `${Math.round(highest)}%`;

}


/* =========================================================
   15. HOURLY FORECAST
========================================================= */

function createHourlyForecast(data) {

    if (!hourlyGrid) {
        return;
    }

    hourlyGrid.innerHTML = "";

    const hours =
        data.list.slice(0, 8);

    hours.forEach(function (item, index) {

        const time =
            new Date(
                item.dt * 1000
            ).toLocaleTimeString(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        const icon =
            getForecastIcon(
                item.weather[0].main
            );

        const card =
            document.createElement("div");

        card.className =
            "hour-card";

        card.innerHTML = `

            <span>
                ${index === 0 ? "Now" : time}
            </span>

            <i class="${icon}"></i>

            <strong>
                ${formatTemperature(item.main.temp)}°
            </strong>

            <small>
                ${Math.round(
                    item.pop * 100
                )}% rain
            </small>

        `;

        hourlyGrid.appendChild(card);

    });

}


/* =========================================================
   16. WEATHER ICON
========================================================= */

function setWeatherIcon(condition) {

    const icons = {

        Clear:
            "fa-solid fa-sun",

        Clouds:
            "fa-solid fa-cloud",

        Rain:
            "fa-solid fa-cloud-rain",

        Drizzle:
            "fa-solid fa-cloud-showers-heavy",

        Thunderstorm:
            "fa-solid fa-cloud-bolt",

        Snow:
            "fa-solid fa-snowflake",

        Mist:
            "fa-solid fa-smog",

        Smoke:
            "fa-solid fa-smog",

        Haze:
            "fa-solid fa-smog",

        Dust:
            "fa-solid fa-smog",

        Fog:
            "fa-solid fa-smog",

        Sand:
            "fa-solid fa-smog",

        Ash:
            "fa-solid fa-smog",

        Squall:
            "fa-solid fa-wind",

        Tornado:
            "fa-solid fa-tornado"

    };

    weatherIcon.className =
        icons[condition] ||
        "fa-solid fa-cloud-sun";

}


/* =========================================================
   17. 5-DAY FORECAST
========================================================= */

function createForecast(data) {

    if (!forecastGrid) {
        return;
    }

    forecastGrid.innerHTML = "";

    const dailyForecast = {};

    data.list.forEach(function (item) {

        const date =
            item.dt_txt.split(" ")[0];

        const time =
            item.dt_txt.split(" ")[1];

        if (
            !dailyForecast[date] ||
            time === "12:00:00"
        ) {

            dailyForecast[date] =
                item;

        }

    });


    const days =
        Object.values(dailyForecast)
            .slice(0, 5);


    days.forEach(function (item, index) {

        const date =
            new Date(
                item.dt * 1000
            );

        let dayName;

        if (index === 0) {

            dayName =
                "Today";

        } else {

            dayName =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        }


        const icon =
            getForecastIcon(
                item.weather[0].main
            );


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `

            <span>
                ${dayName}
            </span>

            <i class="${icon}"></i>

            <strong>
                ${formatTemperature(item.main.temp)}°
            </strong>

            <small>
                ${capitalize(
                    item.weather[0].description
                )}
            </small>

        `;


        forecastGrid.appendChild(card);

    });

}


/* =========================================================
   18. FORECAST ICON
========================================================= */

function getForecastIcon(condition) {

    const icons = {

        Clear:
            "fa-solid fa-sun",

        Clouds:
            "fa-solid fa-cloud",

        Rain:
            "fa-solid fa-cloud-rain",

        Drizzle:
            "fa-solid fa-cloud-showers-heavy",

        Thunderstorm:
            "fa-solid fa-cloud-bolt",

        Snow:
            "fa-solid fa-snowflake",

        Mist:
            "fa-solid fa-smog",

        Smoke:
            "fa-solid fa-smog",

        Haze:
            "fa-solid fa-smog",

        Dust:
            "fa-solid fa-smog",

        Fog:
            "fa-solid fa-smog",

        Squall:
            "fa-solid fa-wind",

        Tornado:
            "fa-solid fa-tornado"

    };

    return (
        icons[condition] ||
        "fa-solid fa-cloud-sun"
    );

}


/* =========================================================
   19. AIR QUALITY
========================================================= */

async function getAirQuality(
    latitude,
    longitude
) {

    try {

        const url =
            `${AIR_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!response.ok) {

            aqValue.textContent =
                "--";

            aqStatus.textContent =
                "Unavailable";

            return;

        }

        if (
            !data.list ||
            !data.list.length
        ) {

            aqValue.textContent =
                "--";

            aqStatus.textContent =
                "Unavailable";

            return;

        }

        const aqi =
            data.list[0].main.aqi;

        const status = {

            1: "Good",
            2: "Fair",
            3: "Moderate",
            4: "Poor",
            5: "Very Poor"

        };

        aqValue.textContent =
            aqi * 20;

        aqStatus.textContent =
            status[aqi] || "Unknown";

    } catch (error) {

        console.warn(
            "Air Quality Error:",
            error
        );

        aqValue.textContent =
            "--";

        aqStatus.textContent =
            "Unavailable";

    }

}


/* =========================================================
   20. MY LOCATION
========================================================= */

locationBtn.addEventListener(
    "click",
    function () {

        if (!hasValidAPIKey()) {
            return;
        }

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }

        showLoading();
        hideError();

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                getWeatherByCoordinates(
                    latitude,
                    longitude
                );

            },

            function (error) {

                hideLoading();

                if (error.code === 1) {

                    showError(
                        "Location permission denied. Please allow location access."
                    );

                } else if (error.code === 2) {

                    showError(
                        "Unable to determine your location."
                    );

                } else if (error.code === 3) {

                    showError(
                        "Location request timed out."
                    );

                } else {

                    showError(
                        "Unable to get your location."
                    );

                }

            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    }
);


/* =========================================================
   21. WEATHER BY COORDINATES
========================================================= */

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        const weatherURL =
            `${WEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        const weatherResponse =
            await fetch(weatherURL);

        const weatherData =
            await weatherResponse.json();

        if (!weatherResponse.ok) {

            throw new Error(
                getErrorMessage(
                    weatherResponse.status,
                    weatherData
                )
            );

        }


        const forecastURL =
            `${FORECAST_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        const forecastResponse =
            await fetch(forecastURL);

        const forecastData =
            await forecastResponse.json();

        if (!forecastResponse.ok) {

            throw new Error(
                getErrorMessage(
                    forecastResponse.status,
                    forecastData
                )
            );

        }


        currentWeatherData =
            weatherData;

        currentForecastData =
            forecastData;


        displayWeather(
            weatherData,
            forecastData
        );


        getAirQuality(
            latitude,
            longitude
        );


        saveRecentSearch(
            weatherData.name
        );


        inputBox.value =
            weatherData.name;


    } catch (error) {

        console.error(
            "Location Error:",
            error
        );

        showError(
            error.message ||
            "Unable to get location weather."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   22. WIND DIRECTION
========================================================= */

function getWindDirection(degrees) {

    if (typeof degrees !== "number") {
        return "--";
    }

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index =
        Math.round(degrees / 45) % 8;

    return directions[index];

}


/* =========================================================
   23. FORMAT TIME
========================================================= */

function formatTime(
    timestamp,
    timezoneOffset
) {

    const date =
        new Date(
            (timestamp + timezoneOffset) * 1000
        );

    return date.toLocaleTimeString(
        "en-US",
        {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   24. RECENT SEARCHES
========================================================= */

function saveRecentSearch(city) {

    let searches =
        JSON.parse(
            localStorage.getItem(
                "skycastSearches"
            )
        ) || [];


    searches =
        searches.filter(function (item) {

            return (
                item.toLowerCase() !==
                city.toLowerCase()
            );

        });


    searches.unshift(city);


    searches =
        searches.slice(0, 5);


    localStorage.setItem(
        "skycastSearches",
        JSON.stringify(searches)
    );


    displayRecentSearches();

}


/* =========================================================
   25. DISPLAY RECENT SEARCHES
========================================================= */

function displayRecentSearches() {

    if (!recentSearches) {
        return;
    }

    const searches =
        JSON.parse(
            localStorage.getItem(
                "skycastSearches"
            )
        ) || [];


    recentSearches.innerHTML =
        "";


    searches.forEach(function (city) {

        const button =
            document.createElement("button");


        button.innerHTML =
            `<i class="fa-solid fa-clock"></i> ${escapeHTML(city)}`;


        button.addEventListener(
            "click",
            function () {

                inputBox.value =
                    city;

                getWeatherByCity(
                    city
                );

            }
        );


        recentSearches.appendChild(
            button
        );

    });

}


/* =========================================================
   26. BACKGROUND
========================================================= */

function changeBackground(condition) {

    const backgrounds = {

        Clear:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(250,204,21,.18),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #07111f,
                #172554
            )
            `,

        Clouds:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(148,163,184,.18),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #07111f,
                #1e293b
            )
            `,

        Rain:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(56,189,248,.18),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #020617,
                #0c4a6e
            )
            `,

        Thunderstorm:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(139,92,246,.20),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #020617,
                #1e1b4b
            )
            `,

        Snow:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(255,255,255,.15),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #0f172a,
                #334155
            )
            `,

        Mist:
            `
            radial-gradient(
                circle at 15% 15%,
                rgba(148,163,184,.16),
                transparent 30%
            ),
            linear-gradient(
                135deg,
                #111827,
                #374151
            )
            `

    };


    document.body.style.background =
        backgrounds[condition] ||
        backgrounds.Clouds;

}


/* =========================================================
   27. LOADING
========================================================= */

function showLoading() {

    if (loading) {

        loading.style.display =
            "flex";

    }

    if (weatherContent) {

        weatherContent.style.display =
            "none";

    }

}


function hideLoading() {

    if (loading) {

        loading.style.display =
            "none";

    }

    if (weatherContent) {

        weatherContent.style.display =
            "block";

    }

}


/* =========================================================
   28. ERROR
========================================================= */

function showError(message) {

    if (!errorBox) {

        alert(message);

        return;

    }

    errorMessage.textContent =
        message;

    errorBox.style.display =
        "flex";

}


function hideError() {

    if (!errorBox) {
        return;
    }

    errorBox.style.display =
        "none";

}


if (closeError) {

    closeError.addEventListener(
        "click",
        hideError
    );

}


/* =========================================================
   29. API ERROR
========================================================= */

function getErrorMessage(
    status,
    data
) {

    if (status === 401) {

        return (
            "Invalid API key. Check your OpenWeather API key. If you just created it, wait for activation."
        );

    }


    if (status === 404) {

        return (
            "City not found. Please check the spelling."
        );

    }


    if (status === 429) {

        return (
            "Too many requests. Please wait a moment and try again."
        );

    }


    if (status === 400) {

        return (
            data.message ||
            "Invalid weather request."
        );

    }


    if (status >= 500) {

        return (
            "OpenWeather server error. Please try again later."
        );

    }


    return (
        data.message ||
        `Weather request failed. Error code: ${status}`
    );

}


/* =========================================================
   30. CAPITALIZE
========================================================= */

function capitalize(text) {

    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   31. ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   32. START APP
========================================================= */

updateUnitButtons();

displayRecentSearches();

console.log(
    "SkyCast Weather App Loaded Successfully."
);