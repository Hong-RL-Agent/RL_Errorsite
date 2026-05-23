const express = require('express');
const app = express();
const PORT = 5001;

app.get('/api/products', (req, res) => {
    res.json([
        { id: 1, name: "강화학습 입문서", price: 25000 },
        { id: 2, name: "AI 모델링 가이드", price: 32000 }
    ]);
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});