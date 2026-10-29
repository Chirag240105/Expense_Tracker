import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from "react-hot-toast";
import { LuPlus, LuTrash2, LuTriangleAlert, LuCircleCheckBig, LuOctagonAlert } from "react-icons/lu";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/layouts/DeleteAlert";

const STATUS_CONFIG = {
  exceeded: {
    label: "Over Budget",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    bar: "#EF4444",
    Icon: LuOctagonAlert,
  },
  warning: {
    label: "Near Limit",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    bar: "#F59E0B",
    Icon: LuTriangleAlert,
  },
  normal: {
    label: "On Track",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    bar: "#10B981",
    Icon: LuCircleCheckBig,
  },
};

const BudgetCard = ({ budget, onDelete, formatCurrency }) => {
  const pct = Math.min(200, budget.percentageUsed ?? 0);
  const cfg = STATUS_CONFIG[budget.alertStatus] || STATUS_CONFIG.normal;
  const { Icon } = cfg;

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: budget.categoryColor || "#6B7280" }}
          >
            {budget.categoryName?.[0] ?? "?"}
          </span>
          <div>
            <p className="font-semibold text-gray-800">{budget.categoryName}</p>
            <p className="text-xs text-gray-500 capitalize">{budget.period} budget</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}
          >
            <Icon size={12} /> {cfg.label}
          </span>
          <button
            onClick={() => onDelete(budget._id)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <LuTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            Spent:{" "}
            <strong className="text-gray-700">{formatCurrency(budget.spent)}</strong>
          </span>
          <span>
            Limit:{" "}
            <strong className="text-gray-700">{formatCurrency(budget.budgetLimit)}</strong>
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-3 border border-gray-200 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cfg.bar }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="font-medium" style={{ color: cfg.bar }}>
            {pct.toFixed(1)}% used
          </span>
          <span className={budget.remaining < 0 ? "text-red-500 font-medium" : "text-gray-400"}>
            {budget.remaining >= 0
              ? `${formatCurrency(budget.remaining)} left`
              : `${formatCurrency(Math.abs(budget.remaining))} over`}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        {new Date(budget.startDate).toLocaleDateString()} →{" "}
        {new Date(budget.endDate).toLocaleDateString()}
      </div>
    </div>
  );
};

const AddBudgetForm = ({ categories, onSuccess }) => {
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    period: "monthly",
    alertThreshold: "0.8",
  });
  const [saving, setSaving] = useState(false);

  const expenseCats = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) return toast.error("Select a category");
    if (!form.amount || parseFloat(form.amount) <= 0)
      return toast.error("Enter a valid budget amount");

    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.BUDGETS.CREATE, {
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        period: form.period,
        alertThreshold: parseFloat(form.alertThreshold),
      });
      toast.success("Budget created!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Budget</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">— Select expense category —</option>
            {expenseCats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Budget Limit ($) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Period</label>
            <select
              value={form.period}
              onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Alert Threshold (e.g. 0.8 = warn at 80%)
          </label>
          <input
            type="number"
            min="0.1"
            max="1.5"
            step="0.05"
            value={form.alertThreshold}
            onChange={(e) => setForm((p) => ({ ...p, alertThreshold: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Budget"}
        </button>
      </form>
    </div>
  );
};

const Budgets = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        axiosInstance.get(API_PATH.BUDGETS.LIST),
        axiosInstance.get(API_PATH.CATEGORIES.LIST),
      ]);
      setBudgets(bRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    } catch {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATH.BUDGETS.DELETE(id));
      toast.success("Budget deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete budget");
    }
  };

  const exceeded = budgets.filter((b) => b.alertStatus === "exceeded");
  const warning = budgets.filter((b) => b.alertStatus === "warning");
  const normal = budgets.filter((b) => b.alertStatus === "normal");

  return (
    <DashboardLayout activeMenu="Budgets">
      <div className="my-5 mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Budgets</h2>
            <p className="text-gray-500 text-sm mt-1">
              {budgets.length} budget{budgets.length !== 1 ? "s" : ""} — real-time tracking
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <LuPlus size={16} /> New Budget
          </button>
        </div>

        {/* Summary pills */}
        {(exceeded.length > 0 || warning.length > 0) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {exceeded.length > 0 && (
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium flex items-center gap-2">
                <LuOctagonAlert size={14} /> {exceeded.length} budget
                {exceeded.length > 1 ? "s" : ""} exceeded
              </div>
            )}
            {warning.length > 0 && (
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 font-medium flex items-center gap-2">
                <LuTriangleAlert size={14} /> {warning.length} budget
                {warning.length > 1 ? "s" : ""} near limit
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No budgets yet</p>
            <p className="text-sm mt-1">Create a budget to track your spending</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Create first budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...exceeded, ...warning, ...normal].map((b) => (
              <BudgetCard
                key={b._id}
                budget={b}
                formatCurrency={formatCurrency}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <AddBudgetForm
          categories={categories}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DeleteAlert
          content="Delete this budget? This cannot be undone."
          onDelete={() => handleDelete(deleteTarget)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Budgets;
