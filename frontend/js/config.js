/**
 * Budget Buddy - Environment Configuration
 * Replace all placeholder values with your actual Firebase & API config.
 * IMPORTANT: Never commit real API keys to version control.
 */

const CONFIG = {
  // ─── Firebase Configuration ─────────────────────────────────────────────────
  // Get these from: Firebase Console → Project Settings → Your Apps → Web App
  firebase: {
    apiKey: "AIzaSyC82GtvLtH-1UutPzC4qtDom_RBeo7X0gI",
    authDomain: "budget-buddy-auth-252ac.firebaseapp.com",
    projectId: "budget-buddy-auth-252ac",
    storageBucket: "budget-buddy-auth-252ac.firebasestorage.app",
    messagingSenderId: "1003433445524",
    appId: "1:1003433445524:web:670ca99f010dfbcf1c8c81"
  },

  // ─── Backend API Base URL ────────────────────────────────────────────────────
  // Change this to your deployed backend URL in production
  apiBaseUrl: "http://localhost:5000/api"
};

// 🔥 ADD THIS (IMPORTANT)
firebase.initializeApp(CONFIG.firebase);

// make auth global
window.auth = firebase.auth();

// Freeze to prevent accidental mutation
Object.freeze(CONFIG);
Object.freeze(CONFIG.firebase);

