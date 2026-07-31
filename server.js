require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.OPENWEATHER_API_KEY;

const OPENWEATHER_API =
    "https://api.openweathermap.org/data/2.5";

if (!API_KEY) {
    console.error("ERROR: OPENWEATHER_API_KEY is missing from backend/.env");
    process.exit(1);
}

app.use(express.json());

app.use(express.static(__dirname ));

async function openWeatherRequest(endpoint, params = {}) {
    const url =
        new URL(`${OPENWEATHER_API}/${endpoint}`);

    Object.entries({
        ...params,
        appid: API_KEY
    }).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(
            data.message || "OpenWeather API error"
        );
        error.status = response.status;
        throw error;
    }

    return data;
}

function sendApiError(res, error) {
    const status = error.status || 500;

    res.status(status).json({
        message:
            error.message ||
            "Weather service error."
    });
}


/* Current weather by city */
app.get("/api/weather", async (req, res) => {
    const city = String(req.query.city || "").trim();

    if (!city) {
        return res.status(400).json({
            message: "City is required."
        });
    }

    try {
        const data = await openWeatherRequest("weather", {
            q: city,
            units: "metric"
        });

        res.json(data);
    } catch (error) {
        console.error("Weather error:", error.message);
        sendApiError(res, error);
    }
});


/* 5-day forecast by city */
app.get("/api/forecast", async (req, res) => {
    const city = String(req.query.city || "").trim();

    if (!city) {
        return res.status(400).json({
            message: "City is required."
        });
    }

    try {
        const data = await openWeatherRequest("forecast", {
            q: city,
            units: "metric"
        });

        res.json(data);
    } catch (error) {
        console.error("Forecast error:", error.message);
        sendApiError(res, error);
    }
});


/* Current weather by coordinates */
app.get("/api/weather/coordinates", async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({
            message: "Valid latitude and longitude are required."
        });
    }

    try {
        const data = await openWeatherRequest("weather", {
            lat,
            lon,
            units: "metric"
        });

        res.json(data);
    } catch (error) {
        sendApiError(res, error);
    }
});


/* Forecast by coordinates */
app.get("/api/forecast/coordinates", async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({
            message: "Valid latitude and longitude are required."
        });
    }

    try {
        const data = await openWeatherRequest("forecast", {
            lat,
            lon,
            units: "metric"
        });

        res.json(data);
    } catch (error) {
        sendApiError(res, error);
    }
});


/* Air quality */
app.get("/api/air", async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({
            message: "Valid coordinates are required."
        });
    }

    try {
        const data = await openWeatherRequest("air_pollution", {
            lat,
            lon
        });

        res.json(data);
    } catch (error) {
        sendApiError(res, error);
    }
});


/* Frontend */
app.use( (req, res) => {
    res.sendFile(
        path.join(
            __dirname,"index.html"
        )
    );
});


app.listen(PORT, () => {
    console.log(
        `SkyCast running at http://localhost:${PORT}`
    );
});
