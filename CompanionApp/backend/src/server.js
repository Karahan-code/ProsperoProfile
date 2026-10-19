// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { downloadDatabase } = require('./services/ftpService');
const { getInstalledGames } = require('./db/parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend'in bu sunucuyla sorunsuz konuşabilmesi için CORS izni veriyoruz
app.use(cors());
app.use(express.json());

// İlk test rotamız (Endpoint)
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "success", 
        message: "ProsperoProfile Backend Aktif!",
        target_console: process.env.PS5_IP
    });
});

app.get('/api/games', async (req, res) => {
    try {
        await downloadDatabase();
        const games = await getInstalledGames();
        res.json({ status: 'success', count: games.length, games });
    } catch (error) {
        console.error('Failed to load games:', error);
        res.status(500).json({ status: 'error', message: 'Failed to load games from the PS5 database.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ProsperoProfile Sunucusu çalışıyor: http://localhost:${PORT}`);
    console.log(`🔌 Hedef PS5 IP: ${process.env.PS5_IP}:${process.env.PS5_FTP_PORT}`);
});