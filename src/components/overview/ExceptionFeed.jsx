import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { AlertTriangle, FileSearch, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ExceptionFeed({ builds = [], onRetryWithDiagnostics }) {
  const failedBuilds = builds
    .filter(b => b.status === 'failed')
    .slice(0, 5);

  if (failedBuilds.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 text-xl">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">All Clear</h3>
            <p className="text-sm text-emerald-700">No recent failures to report</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">Recent Exceptions</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {failedBuilds.map((build) => (
          <div key={build.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {build.project_name || 'Build'} – {build.version || 'Unknown'}
                </p>
                <p className="text-sm text-red-600 mt-1 line-clamp-2">
                  {build.error_summary || 'Build execution failed – check logs for details'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {build.completed_at 
                    ? format(new Date(build.completed_at), 'MMM d, h:mm a')
                    : format(new Date(build.created_date), 'MMM d, h:mm a')
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={createPageUrl('BuildDetail') + `?id=${build.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileSearch className="w-4 h-4" />
                    Inspect
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRetryWithDiagnostics?.(build)}
                  className="gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}