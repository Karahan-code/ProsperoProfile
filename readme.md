![ProsperoProfile Banner](/CompanionApp/images/wide.jpg)

# ProsperoProfile 
**The Ultimate PS5 Companion App & Library Manager**

<img align="right" src="/CompanionApp/images/logo.jpg"

ProsperoProfile is a sleek, modern companion application designed for homebrew-enabled PlayStation 5 consoles. It bridges the gap between your console's raw data and a premium user experience, pulling your local game library, playtime statistics, and trophy data directly from the PS5's internal databases. 

Built with a futuristic, dark-themed glassmorphism aesthetic, it transforms static data into a dynamic, personalized gaming dashboard—combining the detailed profile statistics of Steam with the customizable collection tracking of MyAnimeList.

---

## 🌌 Vision & Features

* **Smart Console Connection:** Automatically scans and connects to your PS5 via FTP or HTTP depending on your active payload (etaHEN, Standalone FTP, or Web File Manager). No complex configurations needed.
* **First-Launch Onboarding:** Set up your local profile with a custom avatar and username before diving into your collection.
* **Steam-Style Dashboard:** A comprehensive header displaying your global statistics, total hours played, and overall trophy progress at a glance.
* **MyAnimeList-Style Tracking:** Take control of your backlog. Categorize your games into custom lists: *Playing*, *Completed*, *Planning to play*, or *Dropped*, complete with color-coded visual indicators.
* **Console-Specific Badging:** Dynamic UI elements that automatically detect and badge your titles with iconic "PS5" or "PS4" tags.
* **Premium UI/UX:** Crafted with Tailwind CSS and Framer Motion for a dark, neon-accented, TV-ready interface optimized for both desktop and D-pad navigation.

---

## 🏗️ Architecture (Companion App Model)

Currently, ProsperoProfile operates as a **Companion App**. This means the application runs on a PC (or Raspberry Pi) on the same local network as your PS5. 

1. **The Backend (Node.js/Express):** Acts as a bridge. It connects to the PS5's open network ports, securely fetches the `app.db` SQLite database, parses the binary data into clean JSON, and serves it locally.
2. **The Frontend (React/Vite):** Consumes this JSON API to render the beautiful, responsive UI in your web browser or directly via the PS5's internal WebKit browser.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Framer Motion
* **Backend:** Node.js, Express.js, `basic-ftp` (for payload communication), `sqlite3` (for database parsing)
* **Design Language:** Dark Mode, Glassmorphism, Neon Highlights

---

## 🚀 Getting Started

Follow these steps to set up the development environment on your local machine.

### Prerequisites
* Node.js (v18 or LTS)
* A homebrew-enabled PS5 running a payload with FTP or HTTP file access (e.g., etaHEN, Web File Manager).

### 1. Backend Setup (The Bridge)
Open your terminal and navigate to the backend directory:
```bash
cd CompanionApp/backend
npm install
```

Create a `.env` file in the `backend` directory and add your PS5's local IP address:
```env
PORT=3000
PS5_IP=192.168.1.XXX
```
*(Note: The Smart Fetcher will automatically detect the correct port: 1337, 2121, 21, or 8080).*

Start the backend server:
```bash
node src/server.js
```

### 2. Frontend Setup (The Dashboard)
Open a new terminal window and navigate to the frontend directory:
```bash
cd CompanionApp/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Complete the initial profile setup and watch your PS5 library come to life!

---

## 🔮 Roadmap & Future Goals

While V1 operates flawlessly as a Companion App, the vision for ProsperoProfile expands far beyond the PC:

* **[V1.5] Executable Packaging:** Wrapping the Node/React stack in Electron/Tauri to provide users with a simple, one-click `.exe` or `.app` file without needing the terminal.
* **[V2.0] Native PS5 Payload (.elf / .pkg):** Porting the backend logic to C/C++ using the PS5 SDK. This will allow ProsperoProfile to run entirely natively on the console, eliminating the need for a companion PC.
* **[Feature] Cloud Syncing:** Optional encrypted backups of your profile data to restore across different firmware versions.

---

*Disclaimer: ProsperoProfile is a local library manager and tracking tool. It does not distribute, host, or link to copyrighted game files or unauthorized software.*