/**
 * Budget Buddy – Dashboard Controller
 * Main app logic: auth guard, expense CRUD, UI rendering, navigation
 */

// ─── Category Meta ────────────────────────────────────────────────────────────
const CATEGORY_META = {
  'Food & Dining':      { emoji: '🍽️',  color: '#14c4b2' },
  'Transportation':     { emoji: '🚗',  color: '#f5a623' },
  'Shopping':           { emoji: '🛍️',  color: '#8b5cf6' },
  'Entertainment':      { emoji: '🎬',  color: '#f43f5e' },
  'Health & Fitness':   { emoji: '💪',  color: '#22d3ee' },
  'Housing':            { emoji: '🏠',  color: '#fb923c' },
  'Education':          { emoji: '📚',  color: '#a3e635' },
  'Travel':             { emoji: '✈️',  color: '#e879f9' },
  'Bills & Utilities':  { emoji: '📃',  color: '#38bdf8' },
  'Other':              { emoji: '📦',  color: '#4ade80' }
};

// ─── State ────────────────────────────────────────────────────────────────────
let currentUser   = null;
let allExpenses   = [];       // full unfiltered list
let filtered      = [];       // currently displayed list
let editingId     = null;     // ID of expense being edited
let deletingId    = null;     // ID of expense to be deleted
let summaryData   = null;     // cached summary from API

// ─── Firebase Auth Guard ──────────────────────────────────────────────────────
const auth = firebase.auth(); // OR just use global auth

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }
  currentUser = user;
  initUI();
  await loadData();
});

// ─── Init UI ──────────────────────────────────────────────────────────────────
function initUI() {
  // User avatar & info
  const initial = (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase();
  document.getElementById('user-avatar').textContent = initial;
  document.getElementById('user-name').textContent = currentUser.displayName || 'User';
  document.getElementById('user-email').textContent = currentUser.email || '';

  // Current month/year labels
  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  document.getElementById('current-month-label').textContent = monthLabel;
  document.getElementById('current-year-label').textContent = String(now.getFullYear());

  // Populate year filter
  const yearSelect = document.getElementById('filter-year');
  for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  // Set default date in modal
  document.getElementById('exp-date').value = now.toISOString().split('T')[0];
}

// ─── Load All Data ────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [expRes, sumRes] = await Promise.all([
      API.getExpenses(currentUser.uid),
      API.getSummary(currentUser.uid)
    ]);

    allExpenses = expRes.data || [];
    summaryData = sumRes.data || {};

    filtered = [...allExpenses];
    renderAll();
  } catch (err) {
    console.error('Load data error:', err);
    showToast('Failed to load expenses. Is the backend running?', 'error');
    // Render empty state gracefully
    renderAll();
  }
}

// ─── Render Everything ────────────────────────────────────────────────────────
function renderAll() {
  renderSummaryCards();
  renderExpensesTable(filtered);
  renderRecentExpenses();
  renderCharts();
  renderAnalytics();
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function renderSummaryCards() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear  = now.getFullYear();

  const total      = allExpenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = allExpenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear;
  }).reduce((s, e) => s + e.amount, 0);
  const yearTotal  = allExpenses.filter(e => new Date(e.date).getFullYear() === thisYear)
                                .reduce((s, e) => s + e.amount, 0);

  document.getElementById('total-all').textContent   = formatCurrency(total);
  document.getElementById('total-month').textContent = formatCurrency(monthTotal);
  document.getElementById('total-year').textContent  = formatCurrency(yearTotal);
  document.getElementById('total-count').textContent = allExpenses.length;

  // Store for PDF
  window._summaryTotals = { total, thisMonth: monthTotal, thisYear: yearTotal, count: allExpenses.length };
}

// ─── Render Expense Table ─────────────────────────────────────────────────────
function renderExpensesTable(expenses) {
  const tbody = document.getElementById('expense-tbody');
  const footer = document.getElementById('table-footer');

  if (!expenses || expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">
      No expenses found. <a href="#" onclick="openExpenseModal()" style="color:var(--teal-light)">Add your first one →</a>
    </td></tr>`;
    footer.innerHTML = '';
    return;
  }

  tbody.innerHTML = expenses.map(exp => {
    const meta = CATEGORY_META[exp.category] || CATEGORY_META['Other'];
    const date = new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:1.2rem">${meta.emoji}</span>
            <div>
              <div style="font-weight:500">${escHtml(exp.title)}</div>
              ${exp.notes ? `<div style="font-size:0.75rem;color:var(--text-muted)">${escHtml(exp.notes.slice(0,40))}${exp.notes.length>40?'…':''}</div>` : ''}
            </div>
          </div>
        </td>
        <td><span class="cat-badge"><span>${meta.emoji}</span>${escHtml(exp.category)}</span></td>
        <td style="color:var(--text-muted);font-size:0.875rem">${date}</td>
        <td class="amount-cell">${formatCurrency(exp.amount)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" onclick="openEditModal('${exp._id}')">✏️ Edit</button>
            <button class="btn-delete" onclick="openDeleteModal('${exp._id}')">🗑 Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  footer.innerHTML = `
    <span style="color:var(--text-muted);font-size:0.875rem">
      Showing <strong>${expenses.length}</strong> expense${expenses.length !== 1 ? 's' : ''}
      · Total: <strong style="color:var(--rose)">${formatCurrency(total)}</strong>
    </span>
  `;
}

// ─── Recent Expenses (Dashboard) ─────────────────────────────────────────────
function renderRecentExpenses() {
  const container = document.getElementById('recent-expenses-list');
  const recent = [...allExpenses].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state">No expenses yet. Start adding some!</div>';
    return;
  }

  container.innerHTML = recent.map(exp => {
    const meta = CATEGORY_META[exp.category] || CATEGORY_META['Other'];
    const date = new Date(exp.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    return `
      <div class="expense-row">
        <div class="exp-info">
          <div class="exp-emoji">${meta.emoji}</div>
          <div>
            <div class="exp-title-text">${escHtml(exp.title)}</div>
            <div class="exp-meta">${escHtml(exp.category)} · ${date}</div>
          </div>
        </div>
        <div class="amount-cell">${formatCurrency(exp.amount)}</div>
      </div>
    `;
  }).join('');
}

// ─── Render Charts ────────────────────────────────────────────────────────────
function renderCharts() {
  const catData  = summaryData?.categoryBreakdown || buildCategoryData(allExpenses);
  const monthData = summaryData?.monthlyBreakdown || buildMonthlyData(allExpenses);

  renderPieChart(catData);
  renderBarChart(monthData);
  renderLineChart(monthData);
}

function buildCategoryData(expenses) {
  const map = {};
  expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
  return Object.entries(map).map(([_id, total]) => ({ _id, total })).sort((a,b) => b.total - a.total);
}

function buildMonthlyData(expenses) {
  const map = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()+1}`;
    map[key] = { _id: { year: d.getFullYear(), month: d.getMonth()+1 }, total: (map[key]?.total || 0) + e.amount };
  });
  return Object.values(map);
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function renderAnalytics() {
  renderCategoryRanking();
  renderMonthlySummaryList();
}

function renderCategoryRanking() {
  const container = document.getElementById('category-ranking');
  const catData   = summaryData?.categoryBreakdown || buildCategoryData(allExpenses);
  const maxTotal  = catData[0]?.total || 1;

  if (catData.length === 0) {
    container.innerHTML = '<div class="empty-state">No data yet</div>';
    return;
  }

  container.innerHTML = catData.map((item, i) => {
    const meta = CATEGORY_META[item._id] || CATEGORY_META['Other'];
    const pct  = ((item.total / maxTotal) * 100).toFixed(0);
    return `
      <div class="category-item">
        <div class="cat-icon" style="background:${meta.color}22">${meta.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="cat-name">${item._id}</span>
            <span class="cat-amount-col">${formatCurrency(item.total)}</span>
          </div>
          <div class="cat-bar-wrap">
            <div class="cat-bar" style="width:${pct}%;background:${meta.color}"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMonthlySummaryList() {
  const container = document.getElementById('monthly-summary-list');
  const monthData = summaryData?.monthlyBreakdown || buildMonthlyData(allExpenses);
  const sorted    = [...monthData].sort((a,b) => {
    if (a._id.year !== b._id.year) return b._id.year - a._id.year;
    return b._id.month - a._id.month;
  }).slice(0, 8);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state">No data yet</div>';
    return;
  }

  container.innerHTML = sorted.map(item => `
    <div class="month-item">
      <span class="month-name">${MONTHS[item._id.month-1]} ${item._id.year}</span>
      <span class="month-amt">${formatCurrency(item.total)}</span>
    </div>
  `).join('');
}

// ─── Section Navigation ───────────────────────────────────────────────────────
function switchSection(name, clickedEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`section-${name}`).classList.add('active');
  document.getElementById('page-title').textContent =
    { dashboard: 'Dashboard', expenses: 'Expense Manager', analytics: 'Analytics' }[name] || name;

  if (clickedEl) clickedEl.classList.add('active');
  else {
    const el = document.querySelector(`[data-section="${name}"]`);
    if (el) el.classList.add('active');
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) closeSidebar();
}

// ─── Sidebar Toggle ───────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const isOpen   = sidebar.classList.toggle('open');
  overlay.style.display = isOpen ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').style.display = 'none';
}

// ─── Dark/Light Mode ─────────────────────────────────────────────────────────
// FIX: reads current theme from attribute (defaults to 'dark' if not set)
//      so the toggle always works correctly on first click and after reload
// FIXED — re-renders charts after theme switch so new colours apply
function toggleDarkMode() {
  const html        = document.documentElement;
  const current     = html.getAttribute('data-theme') || 'dark';
  const next        = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  const btn = document.querySelector('.icon-btn[title="Toggle Dark Mode"]');
  if (btn) btn.textContent = next === 'light' ? '☀️' : '🌙';
  localStorage.setItem('bb-theme', next);
  renderCharts(); // ← ADD THIS LINE
}

// FIX: apply saved theme + icon immediately without waiting for DOMContentLoaded
//      (by the time this script runs the DOM is already parsed)
(function () {
  const saved = localStorage.getItem('bb-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    // DOM is ready at this point (script is at bottom of body)
    const btn = document.querySelector('.icon-btn[title="Toggle Dark Mode"]');
    if (btn) btn.textContent = saved === 'light' ? '☀️' : '🌙';
  }
})();

// ─── Logout ───────────────────────────────────────────────────────────────────
async function handleLogout() {
  try {
    await auth.signOut();
    window.location.href = '../index.html';
  } catch (err) {
    showToast('Logout failed. Please try again.', 'error');
  }
}

// ─── Filters ─────────────────────────────────────────────────────────────────
function applyFilters() {
  const month    = document.getElementById('filter-month').value;
  const year     = document.getElementById('filter-year').value;
  const category = document.getElementById('filter-category').value;

  filtered = allExpenses.filter(exp => {
    const d = new Date(exp.date);
    if (month && String(d.getMonth() + 1) !== month) return false;
    if (year  && String(d.getFullYear()) !== year)   return false;
    if (category && exp.category !== category)        return false;
    return true;
  });

  renderExpensesTable(filtered);
}

function clearFilters() {
  document.getElementById('filter-month').value    = '';
  document.getElementById('filter-year').value     = '';
  document.getElementById('filter-category').value = '';
  filtered = [...allExpenses];
  renderExpensesTable(filtered);
}

// ─── Search ───────────────────────────────────────────────────────────────────
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    filtered = [...allExpenses];
  } else {
    filtered = allExpenses.filter(exp =>
      exp.title.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      (exp.notes || '').toLowerCase().includes(q)
    );
  }
  renderExpensesTable(filtered);
  // Switch to expenses section to show results
  switchSection('expenses', null);
}

// ─── Expense Modal: Open (Add) ────────────────────────────────────────────────
function openExpenseModal() {
  editingId = null;
  document.getElementById('modal-title').textContent   = 'Add Expense';
  document.getElementById('btn-save-expense').textContent = 'Save Expense';
  document.getElementById('exp-title').value    = '';
  document.getElementById('exp-amount').value   = '';
  document.getElementById('exp-date').value     = new Date().toISOString().split('T')[0];
  document.getElementById('exp-category').value = '';
  document.getElementById('exp-notes').value    = '';
  document.getElementById('modal-error').classList.add('hidden');
  document.getElementById('expense-modal-backdrop').classList.remove('hidden');
  document.getElementById('exp-title').focus();
}

// ─── Expense Modal: Open (Edit) ───────────────────────────────────────────────
function openEditModal(id) {
  const exp = allExpenses.find(e => e._id === id);
  if (!exp) return;

  editingId = id;
  document.getElementById('modal-title').textContent      = 'Edit Expense';
  document.getElementById('btn-save-expense').textContent = 'Update Expense';
  document.getElementById('exp-title').value    = exp.title;
  document.getElementById('exp-amount').value   = exp.amount;
  document.getElementById('exp-date').value     = new Date(exp.date).toISOString().split('T')[0];
  document.getElementById('exp-category').value = exp.category;
  document.getElementById('exp-notes').value    = exp.notes || '';
  document.getElementById('modal-error').classList.add('hidden');
  document.getElementById('expense-modal-backdrop').classList.remove('hidden');
}

function closeExpenseModal() {
  document.getElementById('expense-modal-backdrop').classList.add('hidden');
  editingId = null;
}

// ─── Save Expense (Add / Update) ─────────────────────────────────────────────
async function saveExpense() {
  console.log('saveExpense called');
  const title    = document.getElementById('exp-title').value.trim();
  const amount   = parseFloat(document.getElementById('exp-amount').value);
  const date     = document.getElementById('exp-date').value;
  const category = document.getElementById('exp-category').value;
  const notes    = document.getElementById('exp-notes').value.trim();
  const errEl    = document.getElementById('modal-error');

  // Validation
  if (!title)    return showModalError('Please enter a title.');
  if (!amount || amount <= 0) return showModalError('Please enter a valid amount.');
  if (!date)     return showModalError('Please select a date.');
  if (!category) return showModalError('Please select a category.');

  errEl.classList.add('hidden');
  const btn = document.getElementById('btn-save-expense');
  btn.disabled = true;
  btn.textContent = editingId ? 'Updating…' : 'Saving…';

  const payload = {
    uid: currentUser.uid,
    userEmail: currentUser.email,
    title, amount, date, category, notes
  };

  try {
    if (editingId) {
      await API.updateExpense(editingId, payload);
      showToast('Expense updated successfully! ✅', 'success');
    } else {
      await API.addExpense(payload);
      showToast('Expense added successfully! ✅', 'success');
    }
    closeExpenseModal();
    await loadData();
  } catch (err) {
    console.error('Save expense error:', err);
    const message = err.message || 'Failed to save expense. Please try again.';
    showModalError(`Failed to save expense: ${message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Update Expense' : 'Save Expense';
  }
}

function showModalError(msg) {
  const el = document.getElementById('modal-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ─── Delete Modal ────────────────────────────────────────────────────────────
function openDeleteModal(id) {
  deletingId = id;
  document.getElementById('delete-modal-backdrop').classList.remove('hidden');
}
function closeDeleteModal() {
  document.getElementById('delete-modal-backdrop').classList.add('hidden');
  deletingId = null;
}
async function confirmDelete() {
  if (!deletingId) return;
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Deleting…';

  try {
    await API.deleteExpense(deletingId, currentUser.uid);
    showToast('Expense deleted.', 'success');
    closeDeleteModal();
    await loadData();
  } catch (err) {
    showToast('Failed to delete expense.', 'error');
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}

// ─── PDF Download ─────────────────────────────────────────────────────────────
function downloadPDFReport() {
  if (!window._summaryTotals) renderSummaryCards();

  generatePDFReport(
    filtered.length > 0 ? filtered : allExpenses,
    currentUser,
    window._summaryTotals
  );

  showToast('PDF report downloaded! 📄', 'success');
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Close modals on backdrop click ──────────────────────────────────────────
document.getElementById('expense-modal-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeExpenseModal();
});
document.getElementById('delete-modal-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeExpenseModal(); closeDeleteModal(); }
});