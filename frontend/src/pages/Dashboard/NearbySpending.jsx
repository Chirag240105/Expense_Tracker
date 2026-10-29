import React, { useCallback, useEffect, useState } from "react";
import { LuMapPin, LuRefreshCw } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useCurrency } from "../../context/CurrencyContext";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";

const NearbySpending = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();
  const [center, setCenter] = useState({ lat: "40.7500", lng: "-73.9800" });
  const [radius, setRadius] = useState("10000");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNearby = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(API_PATH.TRANSACTIONS.NEARBY, {
        params: { lat: center.lat, lng: center.lng, maxDistance: radius },
      });
      setTransactions(response.data?.data || []);
    } catch (requestError) {
      console.error("[NearbySpending] Unable to load nearby transactions:", requestError);
      setError(requestError.response?.data?.message || "Nearby spending could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [center.lat, center.lng, radius]);

  useEffect(() => {
    loadNearby();
  }, [loadNearby]);

  const radiusMeters = Math.max(1, Number(radius) || 10000);
  const longitudeRange = radiusMeters / (111000 * Math.cos((Number(center.lat) * Math.PI) / 180));
  const latitudeRange = radiusMeters / 111000;

  return (
    <DashboardLayout activeMenu="Nearby">
      <div className="mx-auto my-5 max-w-screen-xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nearby spending</h1>
            <p className="mt-1 text-sm text-gray-600">Explore transactions with saved locations.</p>
          </div>
          <button
            type="button"
            onClick={loadNearby}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            <LuRefreshCw size={16} /> Refresh
          </button>
        </header>

        <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_180px]">
          <label className="text-sm font-medium text-gray-700">
            Latitude
            <input
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={center.lat}
              onChange={(event) => setCenter((current) => ({ ...current, lat: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Longitude
            <input
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={center.lng}
              onChange={(event) => setCenter((current) => ({ ...current, lng: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Radius (meters)
            <input
              type="number"
              min="100"
              max="50000"
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
        </section>

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-white p-8 text-center" role="alert">
            <p className="text-gray-700">{error}</p>
            <button type="button" onClick={loadNearby} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white">
              Try again
            </button>
          </section>
        ) : loading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-gray-200" aria-label="Loading nearby transactions" />
        ) : transactions.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <LuMapPin className="mx-auto text-3xl text-gray-400" />
            <h2 className="mt-3 font-semibold text-gray-900">No located transactions in this area</h2>
            <p className="mt-1 text-sm text-gray-600">Try a larger radius or add a transaction with a location.</p>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div
              className="relative min-h-80 overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(35deg,#e7f2eb_25%,transparent_25%),linear-gradient(145deg,#dcebe1_25%,transparent_25%),linear-gradient(90deg,#f3f7f2,#e5f1e8)] bg-[length:90px_90px,130px_130px,auto] shadow-sm"
              aria-label="Map of nearby transaction locations"
            >
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(transparent_97%,#94a3b8_98%),linear-gradient(90deg,transparent_97%,#94a3b8_98%)] [background-size:42px_42px]" />
              {transactions.map((transaction) => {
                const [lng, lat] = transaction.location.coordinates;
                const left = Math.min(94, Math.max(6, 50 + ((lng - Number(center.lng)) / longitudeRange) * 42));
                const top = Math.min(92, Math.max(8, 50 - ((lat - Number(center.lat)) / latitudeRange) * 42));
                return (
                  <div
                    key={transaction._id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-2 text-white shadow-lg"
                    style={{ left: `${left}%`, top: `${top}%`, backgroundColor: transaction.categoryColor || "#059669" }}
                    title={`${transaction.source}: ${formatCurrency(transaction.amount)}`}
                  >
                    <LuMapPin size={15} aria-hidden="true" />
                  </div>
                );
              })}
              <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-xs text-gray-600">
                {transactions.length} transaction locations · within {Number(radius).toLocaleString()} m
              </span>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {transactions.map((transaction) => (
                <article key={transaction._id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-gray-900">{transaction.source}</h2>
                    <p className="text-sm text-gray-500">{transaction.categoryName || "Uncategorized"} · {transaction.distanceMeters} m away</p>
                  </div>
                  <span className={`shrink-0 font-semibold ${transaction.type === "income" ? "text-emerald-700" : "text-rose-600"}`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NearbySpending;
