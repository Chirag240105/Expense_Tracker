import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from "react-hot-toast";
import { LuPlus, LuTrash2, LuRepeat2, LuToggleLeft, LuToggleRight } from "react-icons/lu";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/layouts/DeleteAlert";
import moment from "moment";

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const RuleCard = ({ rule, onDelete, onToggle, formatCurrency }) => (
  <div
    className={`card flex flex-col gap-3 ${
      rule.isActive ? "" : "opacity-60"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            rule.type === "income" ? "bg-green-500" : "bg-red-400"
          }`}
        >
          <LuRepeat2 size={18} />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{rule.source}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                rule.type === "income"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {rule.type}
            </span>
            <span className="text-xs text-gray-500">
              {FREQUENCY_LABELS[rule.frequency]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(rule._id, !rule.isActive)}
          className="text-gray-400 hover:text-green-600 transition"
          title={rule.isActive ? "Pause rule" : "Activate rule"}
        >
          {rule.isActive ? (
            <LuToggleRight size={22} className="text-green-500" />
          ) : (
            <LuToggleLeft size={22} />
          )}
        </button>
        <button
          onClick={() => onDelete(rule._id)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <LuTrash2 size={16} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-xs text-gray-400">Amount</p>
        <p className="font-semibold text-gray-800">
          {formatCurrency(rule.amount)}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Category</p>
        <p className="font-medium text-gray-700">
          {rule.categoryId?.name || "Uncategorized"}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Next Run</p>
        <p className="font-medium text-gray-700">
          {moment(rule.nextRunAt).format("Do MMM YYYY")}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Last Run</p>
        <p className="font-medium text-gray-700">
          {rule.lastRunAt
            ? moment(rule.lastRunAt).format("Do MMM YYYY")
            : "Never"}
        </p>
      </div>
    </div>

    <div
      className={`px-3 py-1.5 rounded-lg text-xs font-medium w-fit ${
        rule.isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {rule.isActive ? "Active" : "Paused"}
    </div>
  </div>
);

const AddRuleForm = ({ categories, onSuccess }) => {
  const [form, setForm] = useState({
    type: "expense",
    source: "",
    amount: "",
    categoryId: "",
    frequency: "monthly",
    interval: 1,
    nextRunAt: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const filteredCats = categories.filter((c) => c.type === form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source.trim()) return toast.error("Source is required");
    if (!form.amount || parseFloat(form.amount) <= 0)
      return toast.error("Enter a valid amount");

    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.RECURRING_RULES.CREATE, {
        type: form.type,
        source: form.source,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId || null,
        frequency: form.frequency,
        interval: parseInt(form.interval, 10),
        nextRunAt: form.nextRunAt,
      });
      toast.success("Recurring rule created!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Recurring Rule</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={form.source}
            onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
            placeholder="e.g. Netflix Subscription"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount ($) *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">— None —</option>
              {filteredCats.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {Object.entries(FREQUENCY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Interval</label>
            <input
              type="number"
              min="1"
              max="12"
              value={form.interval}
              onChange={(e) => setForm((p) => ({ ...p, interval: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">First Run Date *</label>
          <input
            type="date"
            value={form.nextRunAt}
            onChange={(e) => setForm((p) => ({ ...p, nextRunAt: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Rule"}
        </button>
      </form>
    </div>
  );
};

const RecurringRules = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        axiosInstance.get(API_PATH.RECURRING_RULES.LIST),
        axiosInstance.get(API_PATH.CATEGORIES.LIST),
      ]);
      setRules(rRes.data?.data || []);
      setCategories(cRes.data?.data || []);
    } catch {
      toast.error("Failed to load recurring rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id, isActive) => {
    try {
      await axiosInstance.patch(API_PATH.RECURRING_RULES.UPDATE(id), { isActive });
      setRules((rs) =>
        rs.map((r) => (r._id === id ? { ...r, isActive } : r))
      );
      toast.success(isActive ? "Rule activated" : "Rule paused");
    } catch {
      toast.error("Failed to update rule");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATH.RECURRING_RULES.DELETE(id));
      toast.success("Rule deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const active = rules.filter((r) => r.isActive);
  const paused = rules.filter((r) => !r.isActive);

  return (
    <DashboardLayout activeMenu="Recurring">
      <div className="my-5 mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Recurring Rules</h2>
            <p className="text-gray-500 text-sm mt-1">
              {active.length} active · {paused.length} paused
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <LuPlus size={16} /> New Rule
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <LuRepeat2 size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No recurring rules yet</p>
            <p className="text-sm">Automate salary, rent, subscriptions</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Create first rule
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Active</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                  {active.map((r) => (
                    <RuleCard
                      key={r._id}
                      rule={r}
                      formatCurrency={formatCurrency}
                      onToggle={handleToggle}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))}
                </div>
              </>
            )}
            {paused.length > 0 && (
              <>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Paused</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paused.map((r) => (
                    <RuleCard
                      key={r._id}
                      rule={r}
                      formatCurrency={formatCurrency}
                      onToggle={handleToggle}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <AddRuleForm
          categories={categories}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DeleteAlert
          content="Delete this recurring rule? Past transactions will remain."
          onDelete={() => handleDelete(deleteTarget)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default RecurringRules;
