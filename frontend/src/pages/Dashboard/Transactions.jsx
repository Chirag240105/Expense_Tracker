import React, { useEffect, useState, useCallback, useRef } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import TransactionInfoCard from "../../components/Cards/TransactionInfoCard";
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import moment from "moment";
import {
  LuSearch,
  LuFilter,
  LuDownload,
  LuPlus,
  LuChevronDown,
  LuUpload,
} from "react-icons/lu";
import Modal from "../../components/Modal";
import AddTransactionForm from "../../components/Transactions/AddTransactionForm";

const TYPES = ["", "income", "expense"];
const PAYMENT_METHODS = [
  { value: "", label: "All methods" },
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

function parseCsvRow(row) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && row[index + 1] === '"' && quoted) {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

const Transactions = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();
  const location = useLocation();

  const [transactions, setTransactions] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filters
  const [search, setSearch] = useState(
    () => new URLSearchParams(location.search).get("search") || ""
  );
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const importInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.CATEGORIES.LIST);
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("[Transactions] Failed to load categories:", error);
      toast.error("Categories could not be loaded");
    }
  };

  const fetchTransactions = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const params = { limit: 25 };
        if (type) params.type = type;
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (!reset && cursor) params.cursor = cursor;

        const res = await axiosInstance.get(API_PATH.TRANSACTIONS.LIST, { params });
        const payload = res.data;

        if (reset) {
          setTransactions(payload.data || []);
        } else {
          setTransactions((prev) => [...prev, ...(payload.data || [])]);
        }
        setCursor(payload.pagination?.nextCursor || null);
        setHasMore(payload.pagination?.hasMore || false);
        setTotalCount(payload.pagination?.totalCount || 0);
      } catch (err) {
        console.error("[Transactions] Failed to load transactions:", err);
        toast.error(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, categoryId, search, startDate, endDate]
  );

  // Reset and re-fetch whenever filters change
  useEffect(() => {
    setCursor(null);
    fetchTransactions(true);
  }, [type, categoryId, search, startDate, endDate]); // eslint-disable-line

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleLoadMore = () => {
    fetchTransactions(false);
  };

  const handleDownload = async (dlType) => {
    try {
      const url =
        dlType === "income"
          ? API_PATH.INCOME.DOWNLOAD_INCOME
          : API_PATH.EXPENSE.DOWNLOAD_EXPENSE;
      const res = await axiosInstance.get(url, { responseType: "blob" });
      const objUrl = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = objUrl;
      a.setAttribute("download", `${dlType}_details.xlsx`);
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(objUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleImport = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const rows = (await file.text()).split(/\r?\n/).filter((row) => row.trim());
      if (rows.length < 2) throw new Error("The CSV must include a header and at least one transaction.");
      const headers = parseCsvRow(rows[0]).map((header) => header.toLowerCase());
      const transactionsToImport = rows.slice(1).map((row, rowIndex) => {
        const values = parseCsvRow(row);
        const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
        const amount = Number(record.amount);
        if (!record.source || !Number.isFinite(amount) || amount <= 0) {
          throw new Error(`Row ${rowIndex + 2} needs a source and a positive amount.`);
        }
        return {
          source: record.source,
          amount,
          date: record.date || new Date().toISOString(),
          type: ["income", "expense"].includes(record.type) ? record.type : "expense",
          categoryId: record.categoryid || null,
          tags: record.tags ? record.tags.split("|").map((tag) => tag.trim()).filter(Boolean) : [],
          paymentMethod: record.paymentmethod || "other",
        };
      });

      const response = await axiosInstance.post(API_PATH.TRANSACTIONS.BULK, {
        transactions: transactionsToImport,
      });
      toast.success(`${response.data.insertedCount} transactions imported`);
      setCursor(null);
      await fetchTransactions(true);
    } catch (error) {
      console.error("[Transactions] CSV import failed:", error);
      toast.error(error.response?.data?.message || error.message || "CSV import failed");
    } finally {
      input.value = "";
    }
  };

  return (
    <DashboardLayout activeMenu="Transactions">
      <div className="my-5 mx-auto max-w-screen-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
            <p className="text-gray-500 text-sm mt-1">
              {totalCount.toLocaleString()} total records
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImport}
              className="hidden"
              aria-label="Import transactions CSV"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <LuUpload size={16} /> Import CSV
            </button>
            <button
              onClick={() => handleDownload("expense")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <LuDownload size={16} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              <LuPlus size={16} /> Add Transaction
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <LuSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name, notes, tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <LuFilter size={16} /> Filters{" "}
              <LuChevronDown
                size={14}
                className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <button
                onClick={() => {
                  setCategoryId("");
                  setStartDate("");
                  setEndDate("");
                  setSearch("");
                  setType("");
                }}
                className="text-sm text-red-500 hover:underline mt-1"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Transaction list */}
        <div className="card">
          {loading && transactions.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {transactions.map((tx) => (
                <TransactionInfoCard
                  key={tx._id}
                  title={tx.source}
                  icon={tx.icon}
                  date={`${moment(tx.date).format("Do MMM YYYY")} · ${
                    tx.category?.name || "Uncategorized"
                  }`}
                  amount={formatCurrency(tx.amount)}
                  type={tx.type}
                  hideDeleteBtn
                />
              ))}
              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {loading ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <AddTransactionForm
          categories={categories}
          onSuccess={() => {
            setShowModal(false);
            setCursor(null);
            fetchTransactions(true);
          }}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Transactions;
