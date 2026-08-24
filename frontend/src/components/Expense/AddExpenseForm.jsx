import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import toast from 'react-hot-toast';

const AddExpenseForm = ({ onSubmit, onClose }) => {
  const { selectedCurrency, getCurrencySymbol } = useCurrency();
  
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    icon: '💸',
    category: 'General'
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'General', icon: '💸' },
    { value: 'Food', icon: '🍔' },
    { value: 'Transport', icon: '🚗' },
    { value: 'Shopping', icon: '🛒' },
    { value: 'Bills', icon: '📄' },
    { value: 'Entertainment', icon: '🎬' },
    { value: 'Health', icon: '💊' },
    { value: 'Education', icon: '📚' },
    { value: 'Others', icon: '📦' }
  ];

  const handleCategoryChange = (category) => {
    const selectedCat = categories.find(c => c.value === category);
    setFormData({
      ...formData,
      category,
      icon: selectedCat?.icon || '💸'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.source.trim()) {
      toast.error('Please enter expense description');
      return;
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);

    try {
      await axiosInstances.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        source: formData.source,
        amount: Number(formData.amount),
        date: formData.date,
        icon: formData.icon,
        category: formData.category,
        currency: selectedCurrency // Save which currency was used
      });

      toast.success('Expense added successfully!');
      onSubmit(); // Refresh the expense list
      onClose(); // Close modal
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
      console.error('Add expense error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryChange(cat.value)}
              className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                formData.category === cat.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="e.g., Grocery shopping"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 outline-none"
        />
      </div>

      {/* Amount with Currency Symbol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount ({selectedCurrency})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">
            {getCurrencySymbol()}
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Amount will be saved in {selectedCurrency}
        </p>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-500 outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddExpenseForm;
