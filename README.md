# 🚌 Ghost Bus Detector

A real-time bus tracking and anomaly detection system that helps identify *ghost buses* (buses that appear on schedules but don’t actually arrive) and other irregularities. This project uses *FastAPI, Redis, React, and WebSockets* to fetch, process, and visualize bus data on an interactive map.

This is my *first project*, built to learn how backend, frontend, and live data pipelines work together in real-world applications.

---

## ✨ Features

* 🔴 Detect *ghost buses* in real-time
* 📡 Live bus tracking on an interactive *Leaflet map*
* 📊 *Bus trend chart* to visualize activity patterns
* ⚠ *Alerts & notifications* when anomalies occur
* 🔍 Filters to view specific buses and statuses
* 📌 Click on a bus to see detailed information

---

## 🛠 Tech Stack

*Frontend:*

* React.js
* Leaflet (Map visualization)
* WebSockets (real-time updates)

*Backend:*

* FastAPI (Python)
* Redis (Data caching)
* GTFS-Realtime (Bus feed integration)

*Other Tools:*

* NPM / Node.js
* Git & GitHub

---

## 📂 Project Structure


Ghost-Bus-Detector/
│── backend/        # FastAPI server & Redis integration
│── frontend/       # React frontend with map and charts
│── README.md       # Project documentation


---

## ⚡ Getting Started

Follow these steps to set up and run the project locally.

### ⿡ Clone the repository

bash
git clone https://github.com/AkhilAnand5218/ghost-bus-detector

cd Ghost-Bus-Detector


### ⿢ Backend Setup (FastAPI + Redis)

1. Navigate to backend folder:

   bash
   cd backend
   

2. (Optional) Create a virtual environment:

   bash
   python -m venv venv
   source venv/bin/activate    # On Mac/Linux
   venv\Scripts\activate       # On Windows
   

3. Install dependencies:

   bash
   pip install -r requirements.txt
   

4. Start the FastAPI server:

   bash
   uvicorn main:app --reload
   

The backend will now run on:
👉 http://127.0.0.1:8000

### ⿣ Frontend Setup (React)

1. Open a new terminal and go to the frontend folder:

   bash
   cd frontend
   

2. Install dependencies:

   bash
   npm install
   

3. Start the React app:

   bash
   npm start
   

The frontend will now run on:
👉 http://localhost:3000

---

## 🚀 How It Works

1. The backend fetches bus data using *GTFS-Realtime API*.
2. Data is processed and anomalies (ghost buses, missing buses, delays) are detected.
3. The data is stored in *Redis* and served to the frontend via *WebSockets*.
4. The React app displays buses on a *map*, along with alerts and trend charts.

---

## 📜 License

This project is licensed under the *MIT License*.

---
