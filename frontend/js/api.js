/**
 * Budget Buddy – API Service
 * Centralised fetch wrapper for backend expense endpoints
 */

const API = {
  baseUrl: CONFIG.apiBaseUrl,

  /**
   * Generic fetch with error handling
   * @param {string} endpoint
   * @param {object} options
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error ||
          (Array.isArray(data.errors) ? data.errors.map(e => e.msg).join(', ') : null) ||
          `HTTP error ${response.status}`;
        const err = new Error(message);
        err.response = { status: response.status, data };
        throw err;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // ── Expenses ────────────────────────────────────────────────────────────────

  /** Get all expenses for a user, with optional month/year filter */
  getExpenses(uid, { month, year } = {}) {
    let query = `?uid=${encodeURIComponent(uid)}`;
    if (month) query += `&month=${month}`;
    if (year)  query += `&year=${year}`;
    return this.request(`/expenses${query}`);
  },

  /** Add a new expense */
  addExpense(payload) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /** Update an expense by ID */
  updateExpense(id, payload) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /** Delete an expense by ID */
  deleteExpense(id, uid) {
    return this.request(`/expenses/${id}?uid=${encodeURIComponent(uid)}`, {
      method: 'DELETE'
    });
  },

  /** Get aggregated summary (category + monthly breakdown) */
  getSummary(uid) {
    return this.request(`/expenses/summary?uid=${encodeURIComponent(uid)}`);
  }
};