/* =========================================================
   SKYCAST WEATHER APP
   COMPLETE CORRECTED script.js
========================================================= */


/* =========================================================
   1. API KEY
========================================================= */

/*
   GET YOUR KEY FROM:
   https://openweathermap.org/api

   Replace ONLY the text inside the quotes.

   Example:
   const API_KEY = "abc123xyz...";
*/

const API_KEY = "a6ea71a71294e845a6d055fb92a11f42";


const WEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";

const AIR_API =
    "https://api.openweathermap.org/data/2.5/air_pollution";


/* =========================================================
   2. HTML ELEMENTS
========================================================= */

const inputBox = document.getElementById("input-box");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("locationBtn");

const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");

const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

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


/* =========================================================
   3. CHECK API KEY
========================================================= */

function hasValidAPIKey() {

    if (
        !API_KEY ||
        API_KEY === "PASTE_YOUR_OPENWEATHER_API_KEY_HERE"
    ) {

        showError(
            "OpenWeather API key is missing. Open script.js and paste your real API key."
        );

        return false;
    }

    return true;
}


/* =========================================================
   4. SEARCH BUTTON
========================================================= */

searchBtn.addEventListener("click", function () {

    const city = inputBox.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        inputBox.focus();

        return;
    }

    getWeatherByCity(city);

});


/* =========================================================
   5. ENTER KEY
========================================================= */

inputBox.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const city = inputBox.value.trim();

        if (city === "") {

            showError("Please enter a city name.");

            return;
        }

        getWeatherByCity(city);
    }

});


/* =========================================================
   6. GET WEATHER BY CITY
========================================================= */

async function getWeatherByCity(city) {

    if (!hasValidAPIKey()) {
        return;
    }

    showLoading();
    hideError();

    try {

        /* -----------------------------------------------
           CURRENT WEATHER
        ------------------------------------------------ */

        const weatherURL =
            `${WEATHER_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const weatherResponse =
            await fetch(weatherURL);

        const weatherData =
            await weatherResponse.json();


        /* -----------------------------------------------
           CHECK CURRENT WEATHER RESPONSE
        ------------------------------------------------ */

        if (!weatherResponse.ok) {

            throw new Error(
                getErrorMessage(
                    weatherResponse.status,
                    weatherData
                )
            );
        }


        /* -----------------------------------------------
           5 DAY FORECAST
        ------------------------------------------------ */

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


        /* -----------------------------------------------
           SHOW WEATHER
        ------------------------------------------------ */

        displayWeather(
            weatherData,
            forecastData
        );


        /* -----------------------------------------------
           AIR QUALITY
        ------------------------------------------------ */

        getAirQuality(
            weatherData.coord.lat,
            weatherData.coord.lon
        );


        /* -----------------------------------------------
           SAVE CITY
        ------------------------------------------------ */

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
   7. DISPLAY CURRENT WEATHER
========================================================= */

function displayWeather(
    data,
    forecastData
) {

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
        Math.round(data.main.temp);


    /* FEELS LIKE */

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


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


    /* WEATHER ICON */

    setWeatherIcon(
        data.weather[0].main
    );


    /* CHANGE BACKGROUND */

    changeBackground(
        data.weather[0].main
    );


    /* FORECAST */

    createForecast(
        forecastData
    );

}


/* =========================================================
   8. WEATHER ICON
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
   9. CREATE 5 DAY FORECAST
========================================================= */

function createForecast(data) {

    forecastGrid.innerHTML = "";


    const dailyForecast = {};


    /*
       OpenWeather returns forecast every 3 hours.

       We select one forecast for each date.
    */

    data.list.forEach(function (item) {

        const date =
            item.dt_txt.split(" ")[0];

        const time =
            item.dt_txt.split(" ")[1];


        /*
           Prefer the 12:00 PM forecast.
        */

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
            new Date(item.dt * 1000);


        let dayName;


        if (index === 0) {

            dayName = "Today";

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

            <span>${dayName}</span>

            <i class="${icon}"></i>

            <strong>
                ${Math.round(item.main.temp)}°
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
   10. FORECAST ICON
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
   11. AIR QUALITY
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

            aqValue.textContent = "--";
            aqStatus.textContent = "Unavailable";

            return;
        }


        if (
            !data.list ||
            !data.list.length
        ) {

            aqValue.textContent = "--";
            aqStatus.textContent = "Unavailable";

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

        aqValue.textContent = "--";
        aqStatus.textContent = "Unavailable";

    }

}


/* =========================================================
   12. MY LOCATION
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
   13. WEATHER BY COORDINATES
========================================================= */

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        /* CURRENT WEATHER */

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


        /* FORECAST */

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


        /* DISPLAY */

        displayWeather(
            weatherData,
            forecastData
        );


        /* AIR */

        getAirQuality(
            latitude,
            longitude
        );


        /* SAVE */

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
   14. FORMAT TIME
========================================================= */

function formatTime(
    timestamp,
    timezoneOffset
) {

    /*
       OpenWeather gives timestamp in UTC.
       timezoneOffset is in seconds.
    */

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
   15. RECENT SEARCHES
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
   16. DISPLAY RECENT SEARCHES
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


    recentSearches.innerHTML = "";


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
   17. CHANGE BACKGROUND
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
   18. LOADING
========================================================= */

function showLoading() {

    if (loading) {
        loading.style.display = "flex";
    }

    if (weatherContent) {
        weatherContent.style.display = "none";
    }

}


function hideLoading() {

    if (loading) {
        loading.style.display = "none";
    }

    if (weatherContent) {
        weatherContent.style.display = "grid";
    }

}


/* =========================================================
   19. ERROR
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


/* =========================================================
   20. API ERROR HANDLING
========================================================= */

function getErrorMessage(
    status,
    data
) {

    if (status === 401) {

        return (
            "Invalid API key. Check your OpenWeather API key. If you just created it, wait for the key to activate."
        );

    }


    if (status === 404) {

        return (
            "City not found. Please check the city spelling and try again."
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
   21. CAPITALIZE TEXT
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
   22. BASIC HTML ESCAPE
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   23. INITIALIZE APP
========================================================= */

displayRecentSearches();


/*
   Do NOT automatically call weather here.
   The user can search for any city.
*/

console.log(
    "SkyCast Weather App Loaded Successfully."
);