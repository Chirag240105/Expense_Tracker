import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from "react-hot-toast";
import {
  LuPlus,
  LuTrash2,
  LuTarget,
  LuTrendingUp,
  LuCalendar,
} from "react-icons/lu";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/layouts/DeleteAlert";
import moment from "moment";

const STATUS_COLORS = {
  in_progress: { bar: "#10B981", badge: "bg-blue-100 text-blue-700", label: "In Progress" },
  achieved: { bar: "#6366F1", badge: "bg-purple-100 text-purple-700", label: "Achieved 🎉" },
  abandoned: { bar: "#9CA3AF", badge: "bg-gray-100 text-gray-600", label: "Abandoned" },
};

const GoalCard = ({ goal, formatCurrency, onDelete, onContribute }) => {
  const pct = Math.min(
    100,
    goal.targetAmount > 0
      ? ((goal.currentAmount ?? 0) / goal.targetAmount) * 100
      : 0
  );
  const cfg = STATUS_COLORS[goal.status] || STATUS_COLORS.in_progress;

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: goal.color || "#10B981" }}
          >
            <LuTarget size={20} />
          </span>
          <div>
            <p className="font-semibold text-gray-800">{goal.title}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(goal._id)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <LuTrash2 size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">
            {formatCurrency(goal.currentAmount ?? 0)}
          </span>
          <span className="text-gray-400">{formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: cfg.bar }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% complete</p>
      </div>

      {/* Meta */}
      {goal.deadline && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <LuCalendar size={12} />
          Deadline: {moment(goal.deadline).format("Do MMM YYYY")}
        </div>
      )}

      {/* Contributions preview */}
      {goal.contributions?.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400 mb-2">
            {goal.contributions.length} contribution
            {goal.contributions.length !== 1 ? "s" : ""}
          </p>
          {goal.contributions.slice(-3).map((c) => (
            <div
              key={c._id}
              className="flex justify-between text-xs text-gray-600 py-1"
            >
              <span>{moment(c.date).format("MMM Do")}</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(c.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {goal.status === "in_progress" && (
        <button
          onClick={() => onContribute(goal)}
          className="flex items-center justify-center gap-2 w-full py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition"
        >
          <LuTrendingUp size={14} /> Add Contribution
        </button>
      )}
    </div>
  );
};

const AddGoalForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "General",
    color: "#10B981",
    icon: "target",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Goal title is required");
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0)
      return toast.error("Enter a valid target amount");

    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.GOALS.CREATE, {
        title: form.title,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || 0),
        deadline: form.deadline || null,
        category: form.category,
        color: form.color,
        icon: form.icon,
      });
      toast.success("Goal created!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Savings Goal</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Goal Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Emergency Fund"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target Amount ($) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.targetAmount}
              onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
              placeholder="10000"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Already saved ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.currentAmount}
              onChange={(e) => setForm((p) => ({ ...p, currentAmount: e.target.value }))}
              placeholder="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              className="w-full h-10 border border-gray-200 rounded-lg px-1 py-1 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Goal"}
        </button>
      </form>
    </div>
  );
};

const ContributeForm = ({ goal, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.GOALS.ADD_CONTRIBUTION(goal._id), {
        amount: parseFloat(amount),
        note: note || "Contribution",
      });
      toast.success("Contribution added!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add contribution");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Add Contribution</h3>
      <p className="text-sm text-gray-500 mb-4">To: {goal.title}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount ($) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Monthly saving"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add Contribution"}
        </button>
      </form>
    </div>
  );
};

const Goals = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATH.GOALS.LIST);
      setGoals(res.data?.data || []);
    } catch {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATH.GOALS.DELETE(id));
      toast.success("Goal deleted");
      setDeleteTarget(null);
      fetchGoals();
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const inProgress = goals.filter((g) => g.status === "in_progress");
  const achieved = goals.filter((g) => g.status === "achieved");

  return (
    <DashboardLayout activeMenu="Goals">
      <div className="my-5 mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Savings Goals</h2>
            <p className="text-gray-500 text-sm mt-1">
              {inProgress.length} active · {achieved.length} achieved
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <LuPlus size={16} /> New Goal
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <LuTarget size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No goals yet</p>
            <p className="text-sm">Set a savings target and track your progress</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Create first goal
            </button>
          </div>
        ) : (
          <>
            {inProgress.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">In Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                  {inProgress.map((g) => (
                    <GoalCard
                      key={g._id}
                      goal={g}
                      formatCurrency={formatCurrency}
                      onDelete={(id) => setDeleteTarget(id)}
                      onContribute={(g) => setContributeGoal(g)}
                    />
                  ))}
                </div>
              </>
            )}
            {achieved.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Achieved 🎉</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {achieved.map((g) => (
                    <GoalCard
                      key={g._id}
                      goal={g}
                      formatCurrency={formatCurrency}
                      onDelete={(id) => setDeleteTarget(id)}
                      onContribute={() => {}}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <AddGoalForm onSuccess={() => { setShowAdd(false); fetchGoals(); }} />
      </Modal>

      <Modal isOpen={!!contributeGoal} onClose={() => setContributeGoal(null)}>
        {contributeGoal && (
          <ContributeForm
            goal={contributeGoal}
            onSuccess={() => { setContributeGoal(null); fetchGoals(); }}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DeleteAlert
          content="Delete this goal and all its contributions?"
          onDelete={() => handleDelete(deleteTarget)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Goals;
