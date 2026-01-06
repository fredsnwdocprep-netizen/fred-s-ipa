import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import StatusPill from '@/components/ui/StatusPill';
import { 
  Play, 
  Pause, 
  Server, 
  Loader2, 
  ExternalLink,
  Clock,
  Hammer,
  RotateCcw
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BuildEngine() {
  const { data: builds = [], isLoading } = useQuery({
    queryKey: ['builds'],
    queryFn: () => base44.entities.Build.list('-created_date', 100),
  });

  const { data: runners = [] } = useQuery({
    queryKey: ['runners'],
    queryFn: () => base44.entities.Runner.list(),
  });

  const queuedBuilds = builds.filter(b => b.status === 'queued');
  const runningBuilds = builds.filter(b => b.status === 'running');
  const completedBuilds = builds.filter(b => b.status === 'success' || b.status === 'failed');

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Build Engine</h1>
          <p className="text-slate-500 mt-1">Monitor execution queue and compute nodes</p>
        </div>
        <Link to={createPageUrl('NewBuild')}>
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Play className="w-4 h-4" />
            New Build
          </Button>
        </Link>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Queued</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{queuedBuilds.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-blue-200 p-5 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Running</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{runningBuilds.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Hammer className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed (24h)</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{completedBuilds.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Server className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Execution Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Execution Queue</h2>
        </div>
        {[...queuedBuilds, ...runningBuilds].length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No builds in queue</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...runningBuilds, ...queuedBuilds].map((build, index) => (
              <div key={build.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    build.status === 'running' 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-slate-100 text-slate-600"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {build.project_name || 'Build'} – {build.version || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {build.branch || 'main'} • {build.export_method || 'ad-hoc'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill state={build.status} />
                  {build.status === 'running' && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  <Link to={createPageUrl('BuildDetail') + `?id=${build.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Runner Status Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Compute Nodes</h2>
        </div>
        {runners.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Server className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No runners configured</p>
            <Link to={createPageUrl('Runners')}>
              <Button variant="outline" className="mt-4">
                Add Runner
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {runners.map((runner) => (
              <div
                key={runner.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  runner.status === 'online' 
                    ? "border-emerald-200 bg-emerald-50/50"
                    : runner.status === 'busy'
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server className={cn(
                      "w-5 h-5",
                      runner.status === 'online' ? "text-emerald-600" :
                      runner.status === 'busy' ? "text-blue-600" : "text-slate-400"
                    )} />
                    <span className="font-medium text-slate-900">{runner.name}</span>
                  </div>
                  <StatusPill state={runner.status || 'offline'} />
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>Type: <span className="font-medium">{runner.type || 'github-actions'}</span></p>
                  {runner.macos_version && (
                    <p>macOS: <span className="font-medium">{runner.macos_version}</span></p>
                  )}
                  {runner.xcode_versions?.length > 0 && (
                    <p>Xcode: <span className="font-medium">{runner.xcode_versions.join(', ')}</span></p>
                  )}
                  <p>Builds: <span className="font-medium">{runner.total_builds || 0}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Completions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Build</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Completed</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedBuilds.slice(0, 10).map((build) => (
                <tr key={build.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{build.project_name || 'Build'}</p>
                    <p className="text-sm text-slate-500">{build.version} ({build.build_number})</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill state={build.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDuration(build.duration_seconds)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {build.completed_at 
                      ? format(new Date(build.completed_at), 'MMM d, h:mm a')
                      : '—'
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {build.status === 'failed' && (
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <RotateCcw className="w-4 h-4" />
                          Retry
                        </Button>
                      )}
                      <Link to={createPageUrl('BuildDetail') + `?id=${build.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <ExternalLink className="w-4 h-4" />
                          Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}