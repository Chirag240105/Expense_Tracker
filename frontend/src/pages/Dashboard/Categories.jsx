import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { toast } from "react-hot-toast";
import { LuPlus, LuTrash2, LuTag } from "react-icons/lu";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/layouts/DeleteAlert";

const PRESET_COLORS = [
  "#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#EAB308",
];

const CategoryChip = ({ category, onDelete }) => (
  <div
    className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition group"
    style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}
  >
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: category.color || "#6B7280" }}
      >
        {category.name[0]}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-700">{category.name}</p>
        <p className="text-xs text-gray-400 capitalize">{category.type}</p>
      </div>
    </div>
    {!category.isDefault && (
      <button
        onClick={() => onDelete(category._id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
      >
        <LuTrash2 size={15} />
      </button>
    )}
    {category.isDefault && (
      <span className="text-xs text-gray-300 italic">system</span>
    )}
  </div>
);

const AddCategoryForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    color: PRESET_COLORS[0],
    icon: "tag",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    setSaving(true);
    try {
      await axiosInstance.post(API_PATH.CATEGORIES.CREATE, form);
      toast.success("Category created!");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Category</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Subscriptions"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {["income", "expense"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`flex-1 py-2 text-sm capitalize transition ${
                  form.type === t
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((p) => ({ ...p, color: c }))}
                className={`w-8 h-8 rounded-full transition-transform ${
                  form.color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              className="w-8 h-8 rounded-full cursor-pointer border-none"
              title="Custom color"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Category"}
        </button>
      </form>
    </div>
  );
};

const Categories = () => {
  useUserAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATH.CATEGORIES.LIST);
      setCategories(res.data?.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATH.CATEGORIES.DELETE(id));
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const visible = categories.filter(
    (c) => filterType === "all" || c.type === filterType
  );
  const income = visible.filter((c) => c.type === "income");
  const expense = visible.filter((c) => c.type === "expense");

  return (
    <DashboardLayout activeMenu="Categories">
      <div className="my-5 mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-500 text-sm mt-1">
              {categories.length} categories —{" "}
              {categories.filter((c) => c.userId).length} custom,{" "}
              {categories.filter((c) => !c.userId).length} system defaults
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <LuPlus size={16} /> New Category
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "income", "expense"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filterType === t
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <LuTag size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(filterType === "all" || filterType === "income") && income.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                  Income ({income.length})
                </h3>
                <div className="space-y-2">
                  {income.map((c) => (
                    <CategoryChip
                      key={c._id}
                      category={c}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {(filterType === "all" || filterType === "expense") && expense.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  Expense ({expense.length})
                </h3>
                <div className="space-y-2">
                  {expense.map((c) => (
                    <CategoryChip
                      key={c._id}
                      category={c}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <AddCategoryForm
          onSuccess={() => { setShowModal(false); fetchCategories(); }}
        />
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DeleteAlert
          content="Delete this category? Any transactions using it will become uncategorized."
          onDelete={() => handleDelete(deleteTarget)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Categories;
