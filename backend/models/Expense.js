/**
 * Expense Model
 * Defines the schema for user expense documents in MongoDB
 */

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    // Firebase UID of the logged-in user
    uid: {
      type: String,
      required: [true, 'User UID is required'],
      index: true
    },

    // User email for reference
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true
    },

    // Expense title / description
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // Amount in user currency (stored as float)
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },

    // Expense category
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Health & Fitness',
        'Housing',
        'Education',
        'Travel',
        'Bills & Utilities',
        'Other'
      ]
    },

    // Date of the expense
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },

    // Optional notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

// Index for fast per-user queries sorted by date
expenseSchema.index({ uid: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);