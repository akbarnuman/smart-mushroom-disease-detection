<<<<<<< HEAD
# Smart Mushroom Disease Detection (SMDD)

SMDD is a full-stack AI-powered web application designed to detect diseases in mushrooms using deep learning (MobileNetV2). It provides real-time analysis, treatment recommendations, and a historical tracking dashboard.

## 🌐 Live Demo

Frontend: https://smart-mushroom-disease-detection.vercel.app

Backend API: https://smart-mushroom-disease-detection.onrender.com

ML API: https://smart-mushroom-disease-detection-1.onrender.com

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (Local or Atlas)

---

### 1. ML API (Flask)
The ML API serves the MobileNetV2 model.

```bash
cd ml-api
pip install -r requirements.txt
# To train the model (requires dataset in data/dataset)
python train_model.py
# To start the API
python app.py
```
*The API runs on `http://localhost:5000`*

### 2. Backend (Node.js/Express)
The backend handles user auth and database storage.

```bash
cd backend
npm install
# Create a .env file (template provided)
# Update MONGO_URI and JWT_SECRET
npm start
```
*The Backend runs on `https://http://127.0.0.1:5000`*

### 3. Frontend (React + Vite)
The dashboard and user interface.

```bash
cd frontend
npm install
npm run dev
```
*The Frontend runs on `http://localhost:5173`*

---

## 🛠 Tech Stack
- **Frontend**: React, Vite, Bootstrap, Recharts, Lucide-React
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Multer
- **ML**: TensorFlow/Keras, Flask, MobileNetV2, OpenCV

## 🍄 Features
- **Instant Detection**: Upload images and get disease names with confidence scores.
- **Visual Analytics**: View probability distributions via bar charts.
- **Treatment Advice**: Get specific prevention and treatment steps for each disease.
- **History Tracking**: Keep a log of all previous scans for monitoring.
- **Secure Auth**: JWT-based login and registration system.

## 📁 Project Structure
- `ml-api/`: Flask API and model training scripts.
- `backend/`: Express server, controllers, and database models.
- `frontend/`: React source code and UI components.
- `data/`: Placeholder for your mushroom disease dataset.
=======
