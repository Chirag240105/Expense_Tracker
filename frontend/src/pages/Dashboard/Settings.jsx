import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import CurrencySelector from "../../components/CurrencySelector";
import { UserContext } from "../../context/UserContext.js";
import useTheme from "../../hooks/useTheme.js";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";

const Settings = () => {
  const { user, updateUser } = useContext(UserContext);
  const { themePreference, setThemePreference } = useTheme();
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        preferences: {
          ...user?.preferences,
          currency: localStorage.getItem("selectedCurrency") || "USD",
          theme: themePreference,
        },
      });
      updateUser(response.data.user);
      toast.success("Settings saved");
    } catch (error) {
      console.error("[Settings] Could not save preferences:", error);
      toast.error(error.response?.data?.message || "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Settings">
      <section className="mx-auto my-6 max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Choose how your account and dashboard appear.</p>
        </header>
        <div className="card space-y-6">
          <CurrencySelector variant="profile" />
          <label className="block text-sm font-medium text-gray-700">
            Appearance
            <select
              value={themePreference}
              onChange={(event) => setThemePreference(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="system">Use system setting</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Settings;
