const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 9168;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const weatherData = {
    "seoul": { temp: 22, condition: "Sunny", detail: { humidity: 45, wind: { speed: 5 } } },
    "london": { temp: 15, condition: "Cloudy", detail: { humidity: 80, wind: { speed: 12 } } },
    "ghost-city": { temp: 0, condition: "Unknown", detail: null }
};

// API: Health
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: "site059", status: "healthy" });
});

// API: Current Weather
app.get('/api/weather/current', async (req, res) => {
    const { region } = req.query;
    
    // INTENTIONAL BACKEND BUG: site059-bug02
    // Type: api-timeout
    // Description: region=arctic 요청 시 의도적으로 6초 지연 발생.
    if (region === 'arctic') {
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: "site059-bug02", message: "Request Timeout" });
    }
    
    res.json({ ok: true, data: weatherData["seoul"] });
});

// API: Weather Detail
app.get('/api/weather/detail', (req, res) => {
    const { city } = req.query;
    const data = weatherData[city];
    
    if (!data) return res.status(404).json({ ok: false, message: "City not found" });

    try {
        if (city === 'ghost-city') {
            // INTENTIONAL BACKEND BUG: site059-bug01
            // Type: null-reference
            // Description: detail이 null인 도시 데이터에서 wind.speed 속성에 접근하여 에러 발생.
            const windSpeed = data.detail.wind.speed;
            return res.json({ ok: true, wind: windSpeed });
        }
        res.json({ ok: true, data });
    } catch (err) {
        res.status(500).json({ ok: false, bugId: "site059-bug01", message: "Internal Server Error" });
    }
});

// API: Coordinate Check
app.get('/api/weather/coords', (req, res) => {
    const { lat, lon } = req.query;
    
    // INTENTIONAL BACKEND BUG: site059-bug03
    // Type: type-parsing
    // Description: 좌표값이 숫자가 아닌 'N/A'일 때 422 에러를 반환함.
    if (lat === 'N/A' || lon === 'N/A') {
        return res.status(422).json({ ok: false, bugId: "site059-bug03", message: "Unprocessable Entity: Coordinates must be numeric" });
    }
    
    res.json({ ok: true, location: "Oceanic Point" });
});

app.listen(PORT, () => {
    console.log(`Site059 WeatherCast running on http://localhost:${PORT}`);
});
