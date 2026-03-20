<div align="center">

<img src="https://img.shields.io/badge/Budget-Buddy-7c3aed?style=for-the-badge&logo=money&logoColor=white" alt="Budget Buddy" />

# 💰 Budget Buddy — Expense Tracker

**A full-stack personal finance tracker with real-time analytics, PDF reports, and dark/light mode.**

[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-API-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Charts-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://chartjs.org/)
[![jsPDF](https://img.shields.io/badge/jsPDF-Reports-EC1C24?style=flat-square)](https://github.com/parallax/jsPDF)

<br/>

> Track every rupee. Visualise your spending. Download clean PDF reports.  
> Built with vanilla HTML/CSS/JS on the frontend and Node.js + MongoDB on the backend.

<br/>

![dark](https://img.shields.io/badge/Theme-Dark%20%7C%20Light-7c3aed?style=flat-square)
![responsive](https://img.shields.io/badge/Responsive-Mobile%20%2B%20Desktop-0891b2?style=flat-square)
![license](https://img.shields.io/badge/License-MIT-059669?style=flat-square)

</div>

---

## 📸 Screenshots

| Sign In (Auth) | Dashboard (Light) |
|:---:|:---:|
| ![Sign In](your-image-link-1) | ![Light Dashboard](your-image-link-2) |

| Dashboard (Dark) | Expense Manager |
|:---:|:---:|
| ![Dark Dashboard](your-image-link-3) | ![Expenses](your-image-link-4) |

| Analytics | PDF Report |
|:---:|:---:|
| ![Analytics](your-image-link-5) | ![PDF](your-image-link-6) |
---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Firebase Auth** | Email & password signup/login with real-time validation and error messages |
| 📊 **Dashboard** | Summary cards for total, monthly, and yearly spending + transaction count |
| 🍩 **Pie Chart** | Category-wise expense breakdown using Chart.js doughnut chart |
| 📈 **Bar & Line Charts** | Monthly spending trend — 6-month bar and 12-month line overview |
| 💸 **Expense CRUD** | Add, edit, delete expenses with title, amount, category, date and notes |
| 🔍 **Search & Filter** | Filter by month, year, category — global search across title/category/notes |
| 📄 **PDF Export** | One-click professional report with category bars, monthly table, expense details |
| 🌙 **Dark / Light Mode** | Toggle with preference saved to localStorage — chart colours adapt too |
| 📱 **Fully Responsive** | Collapsible sidebar on mobile, fluid grid on all screen sizes |
| 🔒 **Secure Config** | Firebase keys stored in backend `.env` — never exposed in frontend source |

---

## 🗂️ Project Structure

```
budget-buddy/
│
├── 📄 README.md
│
├── 🖥️ frontend/
│   ├── index.html              # Login / Signup page
│   ├── pages/
│   │   └── dashboard.html      # Main app (protected route)
│   ├── css/
│   │   ├── auth.css            # Auth page — Obsidian Violet theme
│   │   └── dashboard.css       # Dashboard — Dark + Light themes
│   └── js/
│       ├── config.js           # Fetches Firebase config from backend
│       ├── auth.js             # Firebase login/signup logic
│       ├── api.js              # Backend API service layer (all CRUD)
│       ├── charts.js           # Chart.js — pie, bar, line renderers
│       ├── pdf.js              # jsPDF professional report generator
│       └── dashboard.js        # Main controller — state, CRUD, UI, filters
│
└── ⚙️ backend/
    ├── server.js               # Express app + MongoDB connection
    ├── .env.example            # Environment variable template
    ├── package.json
    ├── models/
    │   └── Expense.js          # Mongoose schema
    └── routes/
        └── expenses.js         # REST API — CRUD + /summary endpoint
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Firebase](https://firebase.google.com/) project with Email/Password auth enabled

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/budget-buddy.git
cd budget-buddy
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/budget-buddy

PORT=5000

CORS_ORIGIN=http://127.0.0.1:5500

FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

Start the backend:

```bash
npm run dev      # development (hot reload)
# or
npm start        # production
```

Your API will be live at `http://localhost:5000`

---

### 3. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → **Add Web App**
3. Go to **Authentication → Sign-in method → Email/Password → Enable**
4. Go to **Project Settings → Your Apps → Web App** and copy the config values into your `.env`

---

### 4. Run the frontend

Open `frontend/index.html` with any local server:

```bash
# Option A — Python (no install needed)
python3 -m http.server 5500 --directory frontend

# Option B — Node
npx serve frontend

# Option C — VS Code
# Right-click index.html → "Open with Live Server"
```

Then open **http://127.0.0.1:5500** in your browser.

---

### 5. Verify everything is working

```bash
curl http://localhost:5000/api/health
# {"status":"ok","message":"Budget Buddy API is running 🚀"}
```

✅ Backend running → ✅ Frontend opens → ✅ Sign up → ✅ Add expenses → ✅ See charts

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/config` | Serves Firebase config to frontend |
| `GET` | `/expenses?uid=xxx` | Get all expenses for a user |
| `GET` | `/expenses?uid=xxx&month=3&year=2026` | Filter by month/year |
| `POST` | `/expenses` | Add a new expense |
| `PUT` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id?uid=xxx` | Delete an expense |
| `GET` | `/expenses/summary?uid=xxx` | Category + monthly aggregates |

### Example — Add Expense

```json
POST /api/expenses
{
  "uid": "firebase_user_uid",
  "userEmail": "user@example.com",
  "title": "Lunch",
  "amount": 350,
  "category": "Food & Dining",
  "date": "2026-03-20",
  "notes": "Team lunch"
}
```

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | UI, routing, state management |
| **Auth** | Firebase Authentication v10 | Secure email/password auth |
| **Charts** | Chart.js v4 | Pie, bar, line visualisations |
| **PDF** | jsPDF + AutoTable | Professional downloadable reports |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB + Mongoose | Expense data storage |
| **Validation** | express-validator | Server-side input validation |
| **Fonts** | Syne + DM Sans | Display + body typography |

---

## 🎨 Design System

### Colour Themes

**🌑 Dark — Obsidian Violet**

| Role | Colour | Hex |
|------|--------|-----|
| Background | Deep navy-violet | `#0e0b1a` |
| Primary accent | Violet | `#7c3aed` |
| Secondary | Sky blue | `#38bdf8` |
| Warning | Gold | `#facc15` |
| Danger | Hot pink | `#f472b6` |
| Text | Soft white | `#f0ebff` |

**☀️ Light — Pearl & Sage**

| Role | Colour | Hex |
|------|--------|-----|
| Background | Lavender white | `#f0edf9` |
| Primary accent | Deep violet | `#7c3aed` |
| Secondary | Teal | `#0891b2` |
| Warning | Amber | `#d97706` |
| Danger | Crimson | `#dc2626` |
| Text | Indigo ink | `#1e1b4b` |

---

## 🔒 Security

- Firebase API keys are stored in `backend/.env` — never hardcoded in frontend files
- All expense queries are scoped to the authenticated user's Firebase UID
- Server-side validation on every POST/PUT via `express-validator`
- CORS configured to only allow requests from your frontend origin
- `.env` is `.gitignore`d — secrets never reach version control

---

## 🚢 Deployment

> **Stack:** Frontend on **Vercel** (free) · Backend on **Render** (free)

---

### Step 1 — Deploy Backend on Render

1. Push your project to GitHub if you haven't already
2. Go to [render.com](https://render.com) and sign up / log in
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `budget-buddy-api` |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Instance Type** | Free |

6. Scroll down to **Environment Variables** and add all your secrets:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `PORT` | `10000` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` *(add this after Vercel deploy)* |
   | `FIREBASE_API_KEY` | your Firebase API key |
   | `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
   | `FIREBASE_PROJECT_ID` | your Firebase project ID |
   | `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
   | `FIREBASE_MESSAGING_SENDER_ID` | your sender ID |
   | `FIREBASE_APP_ID` | your app ID |

7. Click **Create Web Service** — Render will build and deploy automatically
8. Once deployed, copy your Render URL → it will look like:
   ```
   https://budget-buddy-api.onrender.com
   ```

> ⚠️ **Free tier note:** Render free services spin down after 15 minutes of inactivity. The first request after idle may take ~30 seconds to wake up. This is normal.

---

### Step 2 — Update Frontend API URL

Before deploying the frontend, open `frontend/js/config.js` and update the API URL to your Render backend:

```js
// frontend/js/config.js
const API_BASE_URL = 'https://budget-buddy-api.onrender.com/api';
```

Save and commit this change to GitHub.

---

### Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with GitHub
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Other` |
   | **Root Directory** | `frontend` |
   | **Build Command** | *(leave empty)* |
   | **Output Directory** | *(leave empty)* |

5. Click **Deploy** — Vercel will deploy in under a minute
6. Once deployed, copy your Vercel URL → it will look like:
   ```
   https://budget-buddy.vercel.app
   ```

---

### Step 4 — Update CORS on Render

Now that you have your Vercel URL, go back to Render:

1. Open your **budget-buddy-api** service
2. Go to **Environment**
3. Update `CORS_ORIGIN` to your actual Vercel URL:
   ```
   CORS_ORIGIN=https://budget-buddy.vercel.app
   ```
4. Click **Save Changes** — Render will auto-redeploy

---

### Step 5 — Update Firebase Authorised Domains

Firebase blocks auth requests from unknown domains by default:

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. Go to **Authentication → Settings → Authorised domains**
3. Click **Add domain** and add your Vercel URL:
   ```
   budget-buddy.vercel.app
   ```
4. Save — Firebase will now allow login from your deployed app

---

### ✅ Deployment Checklist

```
□ Backend deployed on Render — green status
□ API_BASE_URL updated in frontend/js/config.js to Render URL
□ Frontend deployed on Vercel
□ CORS_ORIGIN on Render updated to Vercel URL
□ Vercel domain added to Firebase Authorised Domains
□ Test signup → login → add expense → download PDF
```

---

### 🌐 Live URLs (after deployment)

| Service | URL |
|---------|-----|
| Frontend | `https://budget-buddy.vercel.app` |
| Backend API | `https://budget-buddy-api.onrender.com/api` |
| Health Check | `https://budget-buddy-api.onrender.com/api/health` |

---

## 📦 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Frontend URL | `http://127.0.0.1:5500` |
| `FIREBASE_API_KEY` | Firebase Web API key | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `my-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using Firebase, MongoDB, Node.js and Chart.js

⭐ **Star this repo if you found it helpful!**

</div>
