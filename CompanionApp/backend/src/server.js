// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { downloadDatabase } = require('./services/ftpService');
const { getGames } = require('./db/parser');

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
        const games = await getGames();
        res.json(games);
    } catch (error) {
        console.error('Failed to load games:', error);
        const connectionFailure = ['ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'ENETUNREACH'].includes(error.code);
        const message = connectionFailure
            ? `Cannot reach PS5 FTP at ${process.env.PS5_IP}:${process.env.PS5_FTP_PORT}. Check that the console is online, FTP is enabled, and its address and port are correct.`
            : 'Failed to load games from the PS5 database.';
        res.status(500).json({ status: 'error', message });
    }
});

console.log("OKUNAN IP: >" + process.env.PS5_IP + "< PORT: >" + process.env.PS5_FTP_PORT + "<");

app.listen(PORT, () => {
    console.log(` ProsperoProfile Sunucusu çalışıyor: http://localhost:${PORT}`);
    console.log(` Hedef PS5 IP: ${process.env.PS5_IP}:${process.env.PS5_FTP_PORT}`);
});