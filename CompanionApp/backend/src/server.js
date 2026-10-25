// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const { connectToConsole, downloadDatabase, setConsoleHost } = require('./services/ftpService');
const { addGameAssets, getGameAssets } = require('./services/imageService');
const { getGames } = require('./db/parser');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const PROFILE_DIRECTORY = path.join(__dirname, 'profile');
const FRONTEND_URL = 'http://localhost:3000';

// Frontend'in bu sunucuyla sorunsuz konuşabilmesi için CORS izni veriyoruz
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.type('html').send(`
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>ProsperoProfile</title>
            <style>
                body {
                    margin: 0;
                    min-height: 100vh;
                    display: grid;
                    place-items: center;
                    font-family: Arial, sans-serif;
                    background: #0b1020;
                    color: #e5eefb;
                }
                .card {
                    width: min(680px, 90vw);
                    background: rgba(17, 24, 39, 0.9);
                    border: 1px solid rgba(148, 163, 184, 0.3);
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.35);
                }
                h1 { margin-top: 0; }
                a {
                    color: #7dd3fc;
                    text-decoration: none;
                }
                code {
                    background: rgba(148, 163, 184, 0.12);
                    padding: 2px 6px;
                    border-radius: 6px;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>ProsperoProfile backend is running.</h1>
                <p>The app UI is served by the frontend on <a href="${FRONTEND_URL}">${FRONTEND_URL}</a>.</p>
                <p>Use the API status endpoint: <code>http://localhost:${PORT}/api/status</code></p>
                <p>If the frontend is not running yet, start it with:</p>
                <pre>cd CompanionApp/frontend
npm install
npm run dev</pre>
            </div>
        </body>
        </html>
    `);
});

// İlk test rotamız (Endpoint)
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "success", 
        message: "ProsperoProfile Backend Aktif!",
        target_console: process.env.PS5_IP
    });
});

app.post('/api/connect', async (req, res) => {
    const { ipAddress } = req.body || {};
    if (typeof ipAddress !== 'string' || !ipAddress.trim()) {
        return res.status(400).json({
            success: false,
            error: 'A PS5 private IPv4 address is required.',
        });
    }

    try {
        const connection = await connectToConsole(ipAddress.trim());
        res.json({ success: true, message: 'Connected', port: connection.port });
    } catch (error) {
        console.error(`Failed to connect to console at ${ipAddress}:`, error.message);
        const invalidAddress = error.message === 'Enter a valid private IPv4 address for your console.';
        res.status(invalidAddress ? 400 : 502).json({
            success: false,
            error: invalidAddress
                ? error.message
                : 'Connection timed out. Check IP and Payload.',
        });
    }
});

app.get('/api/game-assets', async (req, res) => {
    const { titleName } = req.query;
    if (typeof titleName !== 'string' || !titleName.trim()) {
        return res.status(400).json({ status: 'error', message: 'A game title is required.' });
    }

    res.json({ assets: await getGameAssets(titleName) });
});

app.get('/api/game-cover', async (req, res) => {
    const { titleName } = req.query;
    if (typeof titleName !== 'string' || !titleName.trim()) {
        return res.status(400).json({ status: 'error', message: 'A game title is required.' });
    }

    const assets = await getGameAssets(titleName);
    res.json({ coverUrl: assets.coverUrl, assets });
});

app.post('/api/profile', async (req, res) => {
    const profile = req.body;
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)
        || typeof profile.username !== 'string'
        || !/^[a-zA-Z0-9_-]{1,32}$/.test(profile.username)
        || !Array.isArray(profile.games)) {
        return res.status(400).json({
            status: 'error',
            message: 'Profile requires a valid username and games array.',
        });
    }

    try {
        await fs.mkdir(PROFILE_DIRECTORY, { recursive: true });
        const profilePath = path.join(PROFILE_DIRECTORY, `${profile.username}.json`);
        await fs.writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
        res.json({ status: 'success', message: 'Profile saved.' });
    } catch (error) {
        console.error('Failed to save profile:', error);
        res.status(500).json({ status: 'error', message: 'Failed to save profile.' });
    }
});

app.get('/api/profile/:username', async (req, res) => {
    const { username } = req.params;
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
        return res.status(400).json({ status: 'error', message: 'Invalid username.' });
    }

    try {
        const profilePath = path.join(PROFILE_DIRECTORY, `${username}.json`);
        const contents = await fs.readFile(profilePath, 'utf8');
        const profile = JSON.parse(contents);
        if (!Array.isArray(profile.games)) {
            return res.status(500).json({ status: 'error', message: 'Saved profile has an invalid games list.' });
        }
        if (profile.connectionMode === 'console') {
            try {
                setConsoleHost(profile.consoleIp);
            } catch (error) {
                console.error(`Saved profile "${username}" has an invalid console IP:`, error.message);
                return res.status(500).json({ status: 'error', message: 'Saved profile has an invalid console IP.' });
            }
        }
        profile.games = await addGameAssets(profile.games);
        res.json(profile);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ status: 'error', message: 'Profile not found.' });
        }
        console.error(`Failed to read profile "${username}":`, error);
        res.status(500).json({ status: 'error', message: 'Failed to read profile.' });
    }
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