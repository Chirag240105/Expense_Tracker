import React, { forwardRef } from "react";

const buttonStyles = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:outline-gray-500",
  danger: "bg-rose-700 text-white hover:bg-rose-800 focus-visible:outline-rose-700",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500",
};

export const Button = ({ variant = "primary", className = "", type = "button", ...props }) => (
  <button
    type={type}
    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonStyles[variant]} ${className}`}
    {...props}
  />
);

export const Card = ({ className = "", ...props }) => (
  <section className={`card ${className}`} {...props} />
);

export const Input = forwardRef(function Input({ label, error, id, className = "", ...props }, ref) {
  const inputId = id || props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 ${className}`}
        {...props}
      />
      {error && <span id={errorId} className="block text-sm text-rose-700">{error}</span>}
    </label>
  );
});

export const Select = forwardRef(function Select({ label, error, id, className = "", children, ...props }, ref) {
  const selectId = id || props.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;
  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span id={errorId} className="block text-sm text-rose-700">{error}</span>}
    </label>
  );
});

export const Drawer = ({ open, title, onClose, children }) => {
  if (!open) return null;
  const titleId = "app-drawer-title";
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button variant="ghost" aria-label="Close drawer" onClick={onClose}>Close</Button>
        </div>
        {children}
      </aside>
    </div>
  );
};

export const Tabs = ({ tabs, activeTab, onChange, children }) => (
  <div>
    <div role="tablist" className="flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-gray-600"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="pt-4">
      {children}
    </div>
  </div>
);

export const Badge = ({ tone = "neutral", className = "", ...props }) => {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-800",
    warning: "bg-amber-100 text-amber-900",
    info: "bg-indigo-100 text-indigo-800",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`} {...props} />;
};

export const Skeleton = ({ className = "", ...props }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} aria-hidden="true" {...props} />
);

export const Toast = ({ tone = "info", children, ...props }) => (
  <div role={tone === "danger" ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-blue-200 bg-blue-50 text-blue-900"}`} {...props}>
    {children}
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
    <h2 className="font-semibold text-gray-900">{title}</h2>
    {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </section>
);

export const ProgressBar = ({ value, max = 100, label, tone = "primary" }) => {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const colors = {
    primary: "bg-emerald-600",
    success: "bg-green-600",
    danger: "bg-rose-600",
    warning: "bg-amber-500",
  };
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-xs text-gray-600"><span>{label}</span><span>{Math.round(percent)}%</span></div>}
      <div
        className="h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label={label || "Progress"}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, value))}
      >
        <div className={`h-full rounded-full transition-[width] duration-300 ${colors[tone]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export const StatCard = ({ label, value, trend, icon, onClick }) => (
  <Card className="flex items-start justify-between gap-4">
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-gray-600">{trend}</p>}
      {onClick && (
        <button type="button" onClick={onClick} className="mt-3 text-xs font-semibold text-emerald-800 hover:underline">
          View details
        </button>
      )}
    </div>
    {icon && <span aria-hidden="true" className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{icon}</span>}
  </Card>
);
