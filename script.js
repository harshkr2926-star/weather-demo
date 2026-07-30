/* =========================================================
   SKYCAST WEATHER APP
   OpenWeatherMap API
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

// IMPORTANT:
// Replace this with your REAL OpenWeatherMap API key.

const API_KEY = "YOUR_OPENWEATHER_API_KEY";


const WEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

const AIR_API =
    "https://api.openweathermap.org/data/2.5/air_pollution";


/* =========================================================
   GET HTML ELEMENTS
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

const recentSearches =
    document.getElementById("recentSearches");


/* Weather */

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


/* Air Quality */

const aqValue =
    document.getElementById("aqValue");

const aqStatus =
    document.getElementById("aqStatus");


/* =========================================================
   API KEY CHECK
========================================================= */

function checkAPIKey() {

    if (
        !API_KEY ||
        API_KEY === "YOUR_OPENWEATHER_API_KEY"
    ) {

        showError(
            "API key missing. Add your OpenWeatherMap API key inside script.js."
        );

        return false;
    }

    return true;
}


/* =========================================================
   SEARCH BUTTON
========================================================= */

searchBtn.addEventListener("click", function () {

    const city =
        inputBox.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    getWeatherByCity(city);

});


/* =========================================================
   ENTER KEY SEARCH
========================================================= */

inputBox.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const city =
            inputBox.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }

        getWeatherByCity(city);
    }

});


/* =========================================================
   CURRENT LOCATION
========================================================= */

locationBtn.addEventListener("click", function () {

    if (!checkAPIKey()) {
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
                    "Your location could not be detected."
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

});


/* =========================================================
   GET WEATHER BY CITY
========================================================= */

async function getWeatherByCity(city) {

    if (!checkAPIKey()) {
        return;
    }


    showLoading();

    hideError();


    try {

        /* ================= CURRENT WEATHER ================= */

        const weatherURL =
            `${WEATHER_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        const weatherResponse =
            await fetch(weatherURL);


        const weatherData =
            await weatherResponse.json();


        /*
         * IMPORTANT:
         * Check response BEFORE displaying data.
         */

        if (!weatherResponse.ok) {

            throw new Error(
                getAPIError(
                    weatherResponse.status,
                    weatherData
                )
            );

        }


        /* ================= FORECAST ================= */

        const forecastURL =
            `${FORECAST_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        const forecastResponse =
            await fetch(forecastURL);


        const forecastData =
            await forecastResponse.json();


        if (!forecastResponse.ok) {

            throw new Error(
                getAPIError(
                    forecastResponse.status,
                    forecastData
                )
            );

        }


        /* ================= DISPLAY ================= */

        displayWeather(
            weatherData,
            forecastData
        );


        /* ================= AIR QUALITY ================= */

        getAirQuality(
            weatherData.coord.lat,
            weatherData.coord.lon
        );


        /* ================= SAVE SEARCH ================= */

        saveRecentSearch(city);


    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        showError(
            error.message ||
            "Unable to get weather data."
        );

    } finally {

        hideLoading();

    }

}


/* =========================================================
   GET WEATHER BY LOCATION
========================================================= */

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    if (!checkAPIKey()) {
        return;
    }


    try {

        /* Current Weather */

        const weatherURL =
            `${WEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;


        const weatherResponse =
            await fetch(weatherURL);


        const weatherData =
            await weatherResponse.json();


        if (!weatherResponse.ok) {

            throw new Error(
                getAPIError(
                    weatherResponse.status,
                    weatherData
                )
            );

        }


        /* Forecast */

        const forecastURL =
            `${FORECAST_API}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;


        const forecastResponse =
            await fetch(forecastURL);


        const forecastData =
            await forecastResponse.json();


        if (!forecastResponse.ok) {

            throw new Error(
                getAPIError(
                    forecastResponse.status,
                    forecastData
                )
            );

        }


        /* Display */

        displayWeather(
            weatherData,
            forecastData
        );


        /* Air Quality */

        getAirQuality(
            latitude,
            longitude
        );


        /* Save City */

        saveRecentSearch(
            weatherData.name
        );


    } catch (error) {

        console.error(
            "Location Weather Error:",
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
   DISPLAY WEATHER
========================================================= */

function displayWeather(
    data,
    forecastData
) {

    /* City */

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    /* Date */

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


    /* Temperature */

    temperature.textContent =
        Math.round(data.main.temp);


    /* Feels Like */

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


    /* Description */

    weatherDescription.textContent =
        data.weather[0].description;


    /* Humidity */

    humidity.textContent =
        `${data.main.humidity}%`;


    /* Wind */

    const windSpeed =
        data.wind.speed * 3.6;

    wind.textContent =
        `${Math.round(windSpeed)} km/h`;


    /* Visibility */

    if (data.visibility) {

        visibility.textContent =
            `${(data.visibility / 1000).toFixed(1)} km`;

    } else {

        visibility.textContent =
            "N/A";

    }


    /* Pressure */

    pressure.textContent =
        `${data.main.pressure} hPa`;


    /* Sunrise */

    sunrise.textContent =
        formatTime(
            data.sys.sunrise,
            data.timezone
        );


    /* Sunset */

    sunset.textContent =
        formatTime(
            data.sys.sunset,
            data.timezone
        );


    /* Weather Icon */

    updateWeatherIcon(
        data.weather[0].main
    );


    /* Background */

    updateBackground(
        data.weather[0].main
    );


    /* Forecast */

    generateForecast(
        forecastData
    );

}


/* =========================================================
   WEATHER ICON
========================================================= */

function updateWeatherIcon(condition) {

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
   GENERATE FORECAST
========================================================= */

function generateForecast(data) {

    forecastGrid.innerHTML = "";


    /*
     * OpenWeather gives data every 3 hours.
     *
     * We select one forecast per day.
     */

    const days = {};


    data.list.forEach(function (item) {

        const date =
            item.dt_txt.split(" ")[0];

        const time =
            item.dt_txt.split(" ")[1];


        /*
         * Prefer 12 PM forecast.
         */

        if (
            !days[date] ||
            time === "12:00:00"
        ) {

            days[date] = item;

        }

    });


    const forecastDays =
        Object.values(days).slice(0, 5);


    forecastDays.forEach(function (day, index) {

        const date =
            new Date(day.dt * 1000);


        const dayName =
            index === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


        const icon =
            getForecastIcon(
                day.weather[0].main
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
                ${Math.round(day.main.temp)}°
            </strong>

            <small>
                ${capitalize(
                    day.weather[0].description
                )}
            </small>

        `;


        forecastGrid.appendChild(card);

    });

}


/* =========================================================
   FORECAST ICON
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

        Fog:
            "fa-solid fa-smog"

    };


    return (
        icons[condition] ||
        "fa-solid fa-cloud-sun"
    );

}


/* =========================================================
   AIR QUALITY
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

            console.warn(
                "Air quality unavailable:",
                data
            );

            aqValue.textContent =
                "--";

            aqStatus.textContent =
                "Unavailable";

            return;
        }


        const aqi =
            data.list[0].main.aqi;


        /*
         * OpenWeather AQI:
         *
         * 1 = Good
         * 2 = Fair
         * 3 = Moderate
         * 4 = Poor
         * 5 = Very Poor
         */

        const status = {

            1: "Good",
            2: "Fair",
            3: "Moderate",
            4: "Poor",
            5: "Very Poor"

        };


        /*
         * Convert 1-5 into
         * simple 0-100 display.
         */

        aqValue.textContent =
            aqi * 20;


        aqStatus.textContent =
            status[aqi] || "Unknown";


    } catch (error) {

        console.warn(
            "Air quality error:",
            error
        );

    }

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    timestamp,
    timezone
) {

    /*
     * OpenWeather timestamp is UTC.
     *
     * timezone is seconds from UTC.
     */

    const localDate =
        new Date(
            (timestamp + timezone) * 1000
        );


    return localDate.toLocaleTimeString(
        "en-US",
        {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   DYNAMIC BACKGROUND
========================================================= */

function updateBackground(condition) {

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
   RECENT SEARCHES
========================================================= */

function saveRecentSearch(city) {

    let searches =
        JSON.parse(
            localStorage.getItem(
                "skycastSearches"
            )
        ) || [];


    /*
     * Remove duplicate
     */

    searches =
        searches.filter(function (item) {

            return (
                item.toLowerCase() !==
                city.toLowerCase()
            );

        });


    /*
     * Add newest first
     */

    searches.unshift(city);


    /*
     * Only keep last 5
     */

    searches =
        searches.slice(0, 5);


    localStorage.setItem(
        "skycastSearches",
        JSON.stringify(searches)
    );


    renderRecentSearches();

}


/* =========================================================
   SHOW RECENT SEARCHES
========================================================= */

function renderRecentSearches() {

    const searches =
        JSON.parse(
            localStorage.getItem(
                "skycastSearches"
            )
        ) || [];


    recentSearches.innerHTML = "";


    searches.forEach(function (city) {

        const button =
            document.createElement("button");


        button.innerHTML =
            `<i class="fa-solid fa-clock"></i> ${city}`;


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
   LOADING
========================================================= */

function showLoading() {

    loading.style.display =
        "flex";

    weatherContent.style.display =
        "none";

}


function hideLoading() {

    loading.style.display =
        "none";

    weatherContent.style.display =
        "grid";

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    errorMessage.textContent =
        message;

    errorBox.style.display =
        "flex";

}


function hideError() {

    errorBox.style.display =
        "none";

}


/* =========================================================
   API ERROR MESSAGE
========================================================= */

function getAPIError(
    status,
    data
) {

    if (status === 401) {

        return (
            "Invalid API key. Check your OpenWeatherMap API key."
        );

    }


    if (status === 404) {

        return (
            "City not found. Please check the spelling."
        );

    }


    if (status === 429) {

        return (
            "Too many requests. Please try again later."
        );

    }


    if (status === 400) {

        return (
            data.message ||
            "Invalid request."
        );

    }


    if (status >= 500) {

        return (
            "Weather server error. Please try again later."
        );

    }


    return (
        data.message ||
        `Weather request failed (${status}).`
    );

}


/* =========================================================
   CAPITALIZE
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
   INITIALIZE
========================================================= */

renderRecentSearches();


/*
 * IMPORTANT:
 *
 * We intentionally DON'T automatically
 * search for a city here.
 *
 * User searches manually.
 */

if (!checkAPIKey()) {

    console.log(
        "SkyCast: Please add your OpenWeatherMap API key."
    );

}