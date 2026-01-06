import React from 'react';
import { cn } from "@/lib/utils";

export default function PulseMetric({ name, value, state = "neutral", icon: Icon, trend }) {
  const stateColors = {
    healthy: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30",
    warning: "border-amber-200 bg-gradient-to-br from-white to-amber-50/30",
    critical: "border-red-200 bg-gradient-to-br from-white to-red-50/30",
    neutral: "border-slate-200 bg-gradient-to-br from-white to-slate-50/30",
  };

  const iconColors = {
    healthy: "text-emerald-600 bg-emerald-100",
    warning: "text-amber-600 bg-amber-100",
    critical: "text-red-600 bg-red-100",
    neutral: "text-slate-600 bg-slate-100",
  };

  return (
    <div className={cn(
      "relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
      stateColors[state]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{name}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.positive ? "text-emerald-600" : "text-red-600"
            )}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl", iconColors[state])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}