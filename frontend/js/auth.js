/**
 * Budget Buddy – Authentication Logic
 * Handles Firebase signup, login, validation, and tab switching
 */

// ─── Auth State Observer ──────────────────────────────────────────────────────
// If user is already logged in, redirect to dashboard
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = 'pages/dashboard.html';
  }
});

// ─── Tab Switching ────────────────────────────────────────────────────────────
function showTab(tab) {
  const loginForm  = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');
  const indicator  = document.getElementById('tab-indicator');

  clearErrors();

  if (tab === 'login') {
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    indicator.classList.add('right');
  }
}

// ─── Toggle Password Visibility ───────────────────────────────────────────────
function togglePassword(inputId, btn) {
  console.log('togglePassword called for', inputId);
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

// ─── Password Strength Indicator ─────────────────────────────────────────────
document.getElementById('signup-password').addEventListener('input', function () {
  const pw = this.value;
  const container = document.getElementById('pw-strength');
  container.innerHTML = '';

  // Create 4 bars
  const bars = [document.createElement('div'), document.createElement('div'),
                document.createElement('div'), document.createElement('div')];
  bars.forEach(b => { b.className = 'bar'; container.appendChild(b); });

  let strength = 0;
  if (pw.length >= 6)  strength++;
  if (pw.length >= 10) strength++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) strength++;
  if (/[^A-Za-z0-9]/.test(pw)) strength++;

  const cls = strength <= 1 ? 'weak' : strength <= 2 ? 'medium' : 'strong';
  for (let i = 0; i < strength; i++) bars[i].classList.add(cls);
});

// ─── Show Error ───────────────────────────────────────────────────────────────
function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearErrors() {
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('signup-error').classList.add('hidden');
}

// ─── Loading State ────────────────────────────────────────────────────────────
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  text.classList.toggle('hidden', loading);
  loader.classList.toggle('hidden', !loading);
}

// ─── Firebase Error Messages ──────────────────────────────────────────────────
function parseFirebaseError(code) {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/too-many-requests':    'Too many attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':   'Invalid email or password.'
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ─── Login Handler ────────────────────────────────────────────────────────────
async function handleLogin() {
  clearErrors();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // Client-side validation
  if (!email)    return showError('login-error', 'Please enter your email.');
  if (!password) return showError('login-error', 'Please enter your password.');
  if (!/\S+@\S+\.\S+/.test(email)) return showError('login-error', 'Enter a valid email address.');

  setLoading('btn-login', true);

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged will handle redirect
  } catch (err) {
    showError('login-error', parseFirebaseError(err.code));
    setLoading('btn-login', false);
  }
}

// ─── Signup Handler ───────────────────────────────────────────────────────────
async function handleSignup() {
  clearErrors();
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;

  // Validation
  if (!name)    return showError('signup-error', 'Please enter your full name.');
  if (!email)   return showError('signup-error', 'Please enter your email.');
  if (!/\S+@\S+\.\S+/.test(email)) return showError('signup-error', 'Enter a valid email address.');
  if (!password) return showError('signup-error', 'Please enter a password.');
  if (password.length < 6) return showError('signup-error', 'Password must be at least 6 characters.');
  if (password !== confirm)  return showError('signup-error', 'Passwords do not match.');

  setLoading('btn-signup', true);

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Update display name
    await cred.user.updateProfile({ displayName: name });
    // onAuthStateChanged will redirect
  } catch (err) {
    showError('signup-error', parseFirebaseError(err.code));
    setLoading('btn-signup', false);
  }
}

// ─── Enter key support ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const activeForm = document.querySelector('.form-section.active').id;
  if (activeForm === 'form-login')  handleLogin();
  if (activeForm === 'form-signup') handleSignup();
});