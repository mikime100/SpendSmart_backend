const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, period, startDate } = req.body;

    const budget = new Budget({
      userId: req.user._id,
      category: category || 'Other',
      amount,
      period: period || 'Monthly',
      startDate: startDate ? new Date(startDate) : new Date()
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { category, amount, period, startDate } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { category, amount, period, startDate: startDate ? new Date(startDate) : undefined },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/status', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const now = new Date();
    let startDate = new Date(budget.startDate);
    let endDate = new Date(startDate);

    switch (budget.period) {
      case 'Weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'Monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'Yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      category: budget.category,
      date: { $gte: startDate, $lte: endDate }
    });

    const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    res.json({
      budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget: spent > budget.amount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



