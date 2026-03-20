/**
 * Expense Routes
 * CRUD endpoints for expense management, scoped per Firebase user (UID)
 */

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Expense = require('../models/Expense');

// ─── Validation Helper ────────────────────────────────────────────────────────
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// ─── Expense Validation Rules ─────────────────────────────────────────────────
const expenseValidation = [
  body('uid').notEmpty().withMessage('User UID is required'),
  body('userEmail').isEmail().withMessage('Valid email is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// ─── GET /api/expenses?uid=xxx ────────────────────────────────────────────────
// Get all expenses for a user (with optional month/year filter)
router.get('/', async (req, res) => {
  try {
    const { uid, month, year } = req.query;

    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    // Build date filter
    let dateFilter = {};
    if (year) {
      const startYear = new Date(`${year}-01-01`);
      const endYear = new Date(`${parseInt(year) + 1}-01-01`);
      dateFilter = { date: { $gte: startYear, $lt: endYear } };
    }
    if (month && year) {
      const startMonth = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const endMonth = new Date(startMonth);
      endMonth.setMonth(endMonth.getMonth() + 1);
      dateFilter = { date: { $gte: startMonth, $lt: endMonth } };
    }

    const expenses = await Expense.find({ uid, ...dateFilter }).sort({ date: -1 });

    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    console.error('GET /expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// ─── POST /api/expenses ───────────────────────────────────────────────────────
// Add a new expense
router.post('/', expenseValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { uid, userEmail, title, amount, category, date, notes } = req.body;

    const expense = new Expense({ uid, userEmail, title, amount, category, date, notes });
    const saved = await expense.save();

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('POST /expenses error:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// ─── PUT /api/expenses/:id ────────────────────────────────────────────────────
// Update an existing expense
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  ...expenseValidation
], async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { uid, title, amount, category, date, notes } = req.body;

    // Ensure the expense belongs to the requesting user
    const expense = await Expense.findOne({ _id: req.params.id, uid });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, date, notes },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /expenses/:id error:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// ─── DELETE /api/expenses/:id ─────────────────────────────────────────────────
// Delete an expense
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID')
], async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'User UID required' });

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, uid });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('DELETE /expenses/:id error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ─── GET /api/expenses/summary?uid=xxx ───────────────────────────────────────
// Get aggregated summary (totals by category, month)
router.get('/summary', async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'User UID required' });

    const [categoryBreakdown, monthlyBreakdown] = await Promise.all([
      // Group by category
      Expense.aggregate([
        { $match: { uid } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Group by year-month
      Expense.aggregate([
        { $match: { uid } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({ success: true, data: { categoryBreakdown, monthlyBreakdown } });
  } catch (err) {
    console.error('GET /expenses/summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;