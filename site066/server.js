const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 9285;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
const lunchboxes = [
    { 
        id: 'b1', name: '건강 가득 비빔밥 도시락', type: 'Healthy', calories: 450, price: 8500, 
        ingredients: ['보리밥', '나물 5종', '계란후라이', '고추장'], 
        allergies: ['Egg'], recommended: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
    },
    { 
        id: 'b2', name: '고단백 닭가슴살 샐러드', type: 'Protein', calories: 320, price: 9000, 
        ingredients: ['수비드 닭가슴살', '로메인', '방울토마토', '오리엔탈 드레싱'], 
        allergies: ['Soybean'], recommended: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    },
    { 
        id: 'b3', name: '매콤 제육볶음 도시락', type: 'Spicy', calories: 680, price: 7500, 
        ingredients: ['돼지불고기', '백미밥', '볶음김치', '멸치볶음'], 
        allergies: ['Pork', 'Fish'], recommended: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400&h=300&fit=crop'
    },
    { 
        id: 'b4', name: '베건 두부 스테이크 도시락', type: 'Vegan', calories: 410, price: 9500, 
        ingredients: ['두부패티', '구운 채소', '현미밥', '비건 소스'], 
        allergies: ['Soybean'], recommended: true, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'
    },
    { 
        id: 'b5', name: '불고기 파티 도시락', type: 'General', calories: 720, price: 11000, 
        ingredients: ['소불고기', '잡채', '전 2종', '흑미밥'], 
        allergies: ['Beef', 'Wheat'], recommended: false, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
    }
];

const nutrition = [
    { id: 'b1', carb: 65, protein: 15, fat: 12, sodium: 850 },
    { id: 'b2', carb: 10, protein: 35, fat: 8, sodium: 420 },
    { id: 'b3', carb: 80, protein: 25, fat: 22, sodium: 1200 },
    { id: 'b4', carb: 55, protein: 20, fat: 10, sodium: 580 },
    { id: 'b5', carb: 90, protein: 30, fat: 25, sodium: 1100 }
];

// Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/lunchboxes', (req, res) => {
    res.json(lunchboxes);
});

app.get('/api/nutrition', (req, res) => {
    res.json(nutrition);
});

app.listen(PORT, () => {
    console.log(`Lunchbox site running on http://localhost:${PORT}`);
});
