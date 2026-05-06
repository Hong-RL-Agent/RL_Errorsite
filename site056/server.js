const express = require('express');
const path = require('path');
const app = express();
const PORT = 9275;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data: Artifacts
const artifacts = [
    {
        id: 1,
        title: '투탕카멘의 황금 마스크',
        artist: '고대 이집트 장인',
        gallery: '고대 이집트관',
        year: '기원전 1323년경',
        description: '이집트 제18왕조의 파라오 투탕카멘의 미라에서 발견된 황금 마스크입니다. 정교한 금 세공 기술과 상징적인 의미를 담고 있습니다.',
        image: 'assets/main_artifact.jpg'
    },
    {
        id: 2,
        title: '로제타 스톤',
        artist: '미상',
        gallery: '고대 문명관',
        year: '기원전 196년',
        description: '이집트 상형문자 해독의 열쇠가 된 비석입니다. 세 가지 다른 문자로 기록되어 있어 고대 언어 연구에 결정적인 역할을 했습니다.',
        image: 'https://images.unsplash.com/photo-1599733589046-10c005739ef0?q=80&w=800'
    },
    {
        id: 3,
        title: '밀로의 비너스',
        artist: '안티오크의 알렉산드로스',
        gallery: '고대 그리스/로마관',
        year: '기원전 100년경',
        description: '그리스 신화의 사랑과 미의 여신인 아프로디테를 묘사한 대리석 조각상입니다. 고전주의 조각의 걸작으로 평가받습니다.',
        image: 'https://images.unsplash.com/photo-1549883340-c23986f7fdb7?q=80&w=800'
    },
    {
        id: 4,
        title: '함무라비 법전',
        artist: '미상',
        gallery: '고대 문명관',
        year: '기원전 1750년경',
        description: '고대 바빌로니아의 법전이 새겨진 석비입니다. 인류 역사상 가장 오래된 성문법 중 하나로 "눈에는 눈, 이에는 이"로 유명합니다.',
        image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800'
    }
];

// Mock Data: Audio Tracks
const audioTracks = [
    {
        id: 101,
        artifactId: 1,
        title: '황금 마스크의 상징과 의미',
        duration: '04:25',
        language: 'Korean',
        available: true
    },
    {
        id: 102,
        artifactId: 2,
        title: '로제타 스톤과 상형문자 해독',
        duration: '03:50',
        language: 'Korean',
        available: true
    },
    {
        id: 103,
        artifactId: 3,
        title: '아프로디테 조각의 미학',
        duration: '05:10',
        language: 'Korean',
        available: true
    },
    {
        id: 104,
        artifactId: 4,
        title: '메소포타미아의 정의: 함무라비 법전',
        duration: '04:45',
        language: 'Korean',
        available: true
    }
];

// API: Artifacts
app.get('/api/artifacts', (req, res) => {
    res.json(artifacts);
});

// API: Audio Tracks
app.get('/api/audio-tracks', (req, res) => {
    res.json(audioTracks);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
