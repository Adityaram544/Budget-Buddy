/**
 * Budget Buddy - Express Backend Server
 * Handles all API routes for expense management
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
// Allow multiple dev origins (e.g. localhost, 127.0.0.1) and file:// (null origin)
const allowedOrigins = [
  "https://budget--buddy-web.vercel.app"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / mobile apps

      // allow localhost (for testing)
      try {
        const url = new URL(origin);
        if (['localhost', '127.0.0.1'].includes(url.hostname)) {
          return callback(null, true);
        }
      } catch (e) {}

      // allow your frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Buddy API is running 🚀' });
});

app.get("/", (req, res) => {
  res.send("🚀 Budget Buddy Backend is Live");
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/expenses', expenseRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── MongoDB Connection + Server Start ────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Budget Buddy API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });