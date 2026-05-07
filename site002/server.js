const express = require('express');
const path = require('path');

const app = express();
const port = 9111;

app.use(express.json());

// Mock Data
const weatherData = {
    current: {
        seoul: { city: 'Seoul', temp: 22, condition: 'Sunny', humidity: 45, wind: 3 },
        busan: { city: 'Busan', temp: 25, condition: 'Cloudy', humidity: 60, wind: 5 },
        jeju: { city: 'Jeju', temp: 28, condition: 'Clear', humidity: 70, wind: 8 },
        'slow-coast': { city: 'Slow Coast', temp: 20, condition: 'Foggy', humidity: 80, wind: 2 },
        'ghost-city': { city: 'Ghost City', temp: 0, condition: 'Unknown', humidity: 0, wind: 0 }
    },
    forecast: {
        seoul: [22, 23, 21, 24, 25, 22, 20],
        busan: [25, 26, 24, 23, 25, 26, 27],
        jeju: [28, 28, 29, 30, 29, 28, 27],
        'slow-coast': [20, 20, 19, 21, 20, 22, 21],
        'ghost-city': []
    },
    detail: {
        seoul: { feelsLike: { value: 24 }, aqi: 42 },
        busan: { feelsLike: { value: 27 }, aqi: 50 },
        jeju: { feelsLike: { value: 31 }, aqi: 30 },
        'slow-coast': { feelsLike: { value: 21 }, aqi: 20 }
        // ghost-city has no detail
    }
};

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, site: 'site002', status: 'healthy' });
});

// 1. Current Weather
app.get('/api/weather/current', (req, res) => {
    const city = req.query.city || 'seoul';
    const data = weatherData.current[city];
    if (!data) return res.status(404).json({ ok: false, error: 'City not found' });
    res.json({ ok: true, data });
});

// 2. Weather Detail (BUG 1)
app.get('/api/weather/detail', (req, res) => {
    const city = req.query.city || 'seoul';
    const detail = weatherData.detail[city];
    
    if (city === 'ghost-city') {
        // INTENTIONAL BACKEND BUG: site002-bug01
        // Type: null-reference
        // Description: ghost-city 요청 시 detail이 undefined/null인데 객체 필드를 참조하여 500 오류 발생
        try {
            const feelsLike = detail.feelsLike.value; 
            return res.json({ ok: true, data: { feelsLike } });
        } catch (error) {
            return res.status(500).json({ ok: false, bugId: 'site002-bug01', error: error.message });
        }
    }

    if (!detail) return res.status(404).json({ ok: false, error: 'Detail not found' });
    res.json({ ok: true, data: detail });
});

// 3. Weekly Forecast (BUG 2)
app.get('/api/weather/forecast', (req, res) => {
    const city = req.query.city || 'seoul';
    const daysRaw = req.query.days || '7';

    if (daysRaw === 'abc') {
        // INTENTIONAL BACKEND BUG: site002-bug02
        // Type: type-parsing
        // Description: days=abc일 때 숫자로 안전하게 파싱하지 않아 연산 시 문제가 생겨 422 반환
        const parsedDays = parseInt(daysRaw); // returns NaN
        if (isNaN(parsedDays)) {
            return res.status(422).json({ ok: false, bugId: 'site002-bug02', error: 'Invalid days parameter parsed as NaN' });
        }
    }

    const days = parseInt(daysRaw, 10);
    const forecast = weatherData.forecast[city] || [];
    res.json({ ok: true, data: forecast.slice(0, days) });
});

// 4. Region Weather List (BUG 3)
app.get('/api/weather/regions', async (req, res) => {
    const region = req.query.region || 'all';

    if (region === 'slow-coast') {
        // INTENTIONAL BACKEND BUG: site002-bug03
        // Type: api-timeout
        // Description: region=slow-coast 요청일 때만 API 응답을 6초 지연시켜 timeout 상황 재현 (HTTP 408)
        await new Promise(resolve => setTimeout(resolve, 6000));
        return res.status(408).json({ ok: false, bugId: 'site002-bug03', error: 'Request Timeout' });
    }

    const regions = ['seoul', 'busan', 'jeju'].map(c => weatherData.current[c]);
    res.json({ ok: true, data: regions });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
