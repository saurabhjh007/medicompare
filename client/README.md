# 🏥 MediCompare – Healthcare Price Comparison Platform

MediCompare is a full-stack MERN application that helps users compare healthcare service prices across hospitals, view hospital locations, and book appointments online.

## 🚀 Live Demo

Frontend: https://medicompare-xi.vercel.app

Backend API: https://medicompare-7rv1.onrender.com

---

## 📌 Features

### User Features
- User Registration & Login
- JWT Authentication
- Search Healthcare Services
- Compare Prices Across Hospitals
- View Hospital Details
- Google Maps Integration
- Book Appointments
- User Profile Management
- View Personal Appointment History
- Secure User-Specific Data Access

### Admin Features
- Add Hospitals
- Update Hospital Information
- Delete Hospitals
- Manage Healthcare Services & Prices

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- JWT Authentication
- REST APIs

### Database
- MongoDB Atlas
- Mongoose

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure

```
MediCompare
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── assets
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication

MediCompare uses JWT (JSON Web Tokens) for secure authentication.

Features:
- User Registration
- User Login
- Protected Routes
- Persistent Sessions
- Secure API Access

---

## 🏥 Healthcare Services Supported

Examples:

- MRI Scan
- CT Scan
- Blood Test
- X-Ray
- Ultrasound
- ECG
- General Consultation

Hospitals can add more services dynamically.

---

## 📍 Google Maps Integration

Users can directly open hospital locations through Google Maps.

Benefits:
- Easy Navigation
- Location-Based Decisions
- Better User Experience

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/saurabhjh007/medicompare.git
```

---

### Backend Setup

```bash
cd server
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm start
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌐 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Hospitals

```http
GET /api/hospitals
GET /api/hospitals/search
POST /api/hospitals
PUT /api/hospitals/:id
DELETE /api/hospitals/:id
```

### Appointments

```http
POST /api/appointments
GET /api/appointments
```

---

## 📸 Screenshots

### Login Page
- Secure authentication interface

### Dashboard
- Search and compare healthcare services

### Hospital Results
- View pricing and hospital information

### Profile Page
- User information and appointment history

---

## 🎯 Future Enhancements

- Hospital Reviews & Ratings
- Payment Gateway Integration
- Doctor Appointment Scheduling
- Nearby Hospital Recommendations
- Healthcare Cost Analytics
- Email Notifications
- Appointment Reminders

---

## 👨‍💻 Author

**Saurabh Jha**

GitHub: https://github.com/saurabhjh007

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

⭐ Star the repository to support the project.