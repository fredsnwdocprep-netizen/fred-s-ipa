import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import StatusPill from '@/components/ui/StatusPill';
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  ExternalLink, 
  Clock, 
  GitBranch, 
  GitCommit,
  ChevronDown,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function ExecutionTimeline({ builds = [], onRetry }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredBuilds = builds.filter(build => {
    if (statusFilter !== 'all' && build.status !== statusFilter) return false;
    if (methodFilter !== 'all' && build.export_method !== methodFilter) return false;
    return true;
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Build Activity</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setStatusFilter('all')}
                className={cn(statusFilter === 'all' && 'bg-slate-100')}
              >
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter('failed')}
                className={cn(statusFilter === 'failed' && 'bg-slate-100')}
              >
                Failed Only
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter('success')}
                className={cn(statusFilter === 'success' && 'bg-slate-100')}
              >
                Successful
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setMethodFilter('all')}
                className={cn(methodFilter === 'all' && 'bg-slate-100')}
              >
                All Methods
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setMethodFilter('ad-hoc')}
                className={cn(methodFilter === 'ad-hoc' && 'bg-slate-100')}
              >
                Ad Hoc
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setMethodFilter('app-store')}
                className={cn(methodFilter === 'app-store' && 'bg-slate-100')}
              >
                App Store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Build</th>
              <th className="px-6 py-3 hidden lg:table-cell">Source</th>
              <th className="px-6 py-3 hidden md:table-cell">Version</th>
              <th className="px-6 py-3 hidden xl:table-cell">Method</th>
              <th className="px-6 py-3 hidden xl:table-cell">Node</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBuilds.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No builds found
                </td>
              </tr>
            ) : (
              filteredBuilds.map((build) => (
                <tr key={build.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <StatusPill state={build.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={createPageUrl('BuildDetail') + `?id=${build.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {build.project_name || 'Build'}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      #{build.id?.slice(-8)}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span className="truncate max-w-24">{build.branch || 'main'}</span>
                    </div>
                    {build.commit_sha && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <GitCommit className="w-3 h-3" />
                        <span>{build.commit_sha?.slice(0, 7)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm font-medium text-slate-700">
                      {build.version || '—'}
                    </span>
                    {build.build_number && (
                      <span className="text-xs text-slate-400 ml-1">
                        ({build.build_number})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                      build.export_method === 'app-store' 
                        ? "bg-purple-100 text-purple-700"
                        : build.export_method === 'ad-hoc'
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {build.export_method || 'dev'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell text-sm text-slate-600">
                    {build.runner_name || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(build.duration_seconds)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {build.status === 'failed' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRetry?.(build)}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                      <Link to={createPageUrl('BuildDetail') + `?id=${build.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}