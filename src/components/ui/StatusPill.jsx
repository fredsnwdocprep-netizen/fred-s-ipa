import React from 'react';
import { cn } from "@/lib/utils";

const statusConfig = {
  // Build statuses
  queued: { color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  running: { color: "bg-blue-50 text-blue-700", dot: "bg-blue-500 animate-pulse" },
  success: { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  failed: { color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  cancelled: { color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  // Certificate/Profile statuses
  active: { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  disabled: { color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  expired: { color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  revoked: { color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  // Runner statuses
  online: { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  offline: { color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  busy: { color: "bg-amber-50 text-amber-700", dot: "bg-amber-500 animate-pulse" },
  // Generic
  ready: { color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  warning: { color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  error: { color: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export default function StatusPill({ state, label, className }) {
  const config = statusConfig[state] || statusConfig.ready;
  const displayLabel = label || state?.charAt(0).toUpperCase() + state?.slice(1);

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.color,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {displayLabel}
    </span>
  );
}