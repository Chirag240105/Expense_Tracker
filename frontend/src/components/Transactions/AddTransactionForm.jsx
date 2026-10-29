import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { toast } from "react-hot-toast";

const PAYMENT_METHODS = [
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "crypto",
  "other",
];

const AddTransactionForm = ({ categories = [], onSuccess }) => {
  const [form, setForm] = useState({
    type: "expense",
    source: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    paymentMethod: "other",
    notes: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const filteredCats = categories.filter((c) => c.type === form.type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source.trim()) return toast.error("Source / title is required");
    if (!form.amount || parseFloat(form.amount) <= 0)
      return toast.error("Enter a valid amount greater than 0");
    if (!form.date) return toast.error("Date is required");

    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.TRANSACTIONS.CREATE, {
        ...form,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        categoryId: form.categoryId || null,
      });
      toast.success("Transaction added!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {["income", "expense"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: t, categoryId: "" }))}
              className={`flex-1 py-2 text-sm font-medium capitalize transition ${
                form.type === t
                  ? t === "income"
                    ? "bg-green-600 text-white"
                    : "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Source / Title *</label>
          <input
            name="source"
            value={form.source}
            onChange={handleChange}
            placeholder="e.g. Acme Corp Salary"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount *</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date *</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">— Select —</option>
              {filteredCats.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Tags (comma-separated)
          </label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g. groceries, food, weekly"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Optional note…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;
