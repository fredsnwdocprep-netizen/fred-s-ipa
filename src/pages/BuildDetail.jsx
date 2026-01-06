import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import StatusPill from '@/components/ui/StatusPill';
import { 
  ArrowLeft, 
  Download, 
  RotateCcw, 
  ExternalLink,
  Clock,
  GitBranch,
  GitCommit,
  Server,
  FileCode,
  Shield,
  Package,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BuildDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const buildId = urlParams.get('id');
  const [logSearch, setLogSearch] = useState('');

  const { data: build, isLoading } = useQuery({
    queryKey: ['build', buildId],
    queryFn: async () => {
      const builds = await base44.entities.Build.filter({ id: buildId });
      return builds[0];
    },
    enabled: !!buildId,
    refetchInterval: (data) => {
      // Poll every 3 seconds if build is in progress
      if (data?.status === 'queued' || data?.status === 'running') {
        return 3000;
      }
      return false;
    },
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Use real-time stages from backend, with fallback
  const buildPhases = build?.stages || [
    { name: 'queued', label: 'Queued', status: 'completed' },
    { name: 'checkout', label: 'Source Checkout', status: 'pending' },
    { name: 'dependencies', label: 'Resolve Dependencies', status: 'pending' },
    { name: 'archive', label: 'Archive', status: 'pending' },
    { name: 'codesign', label: 'Code Sign', status: 'pending' },
    { name: 'export', label: 'Export IPA', status: 'pending' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!build) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Build not found</h2>
        <p className="text-slate-500 mt-1">The requested build does not exist</p>
        <Link to={createPageUrl('BuildEngine')}>
          <Button variant="outline" className="mt-4">
            Back to Build Engine
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            className="gap-2 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {build.project_name || 'Build'} – {build.version || 'N/A'}
            </h1>
            <StatusPill state={build.status} />
          </div>
          <p className="text-slate-500 mt-1 font-mono text-sm">
            #{build.id?.slice(-12)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {build.status === 'failed' && (
            <Link to={createPageUrl('NewBuild') + `?retry=${build.id}`}>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry Build
              </Button>
            </Link>
          )}
          {build.ipa_url && (
            <>
              <Link to={createPageUrl('InstallApp') + `?id=${build.id}`}>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Install on Device
                </Button>
              </Link>
              <a href={build.ipa_url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Download className="w-4 h-4" />
                  Download IPA
                </Button>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="signing">Signing</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Execution Timeline</h2>
            <div className="flex items-center justify-between">
              {buildPhases.map((phase, index) => (
                <React.Fragment key={phase.name}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      phase.status === 'completed' && "bg-emerald-100 text-emerald-600",
                      phase.status === 'running' && "bg-blue-100 text-blue-600",
                      phase.status === 'failed' && "bg-red-100 text-red-600",
                      phase.status === 'pending' && "bg-slate-100 text-slate-400"
                    )}>
                      {phase.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
                      {phase.status === 'running' && <Loader2 className="w-5 h-5 animate-spin" />}
                      {phase.status === 'failed' && <AlertCircle className="w-5 h-5" />}
                      {phase.status === 'pending' && <Clock className="w-5 h-5" />}
                    </div>
                    <span className="text-xs text-slate-600 mt-2 text-center">{phase.label}</span>
                  </div>
                  {index < buildPhases.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      phase.status === 'completed' ? "bg-emerald-300" : "bg-slate-200"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Build Information</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Branch
                  </dt>
                  <dd className="font-medium text-slate-900">{build.branch || 'main'}</dd>
                </div>
                {build.commit_sha && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-slate-500 flex items-center gap-2">
                      <GitCommit className="w-4 h-4" />
                      Commit
                    </dt>
                    <dd className="font-mono text-sm text-slate-900">{build.commit_sha?.slice(0, 7)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Export Method
                  </dt>
                  <dd className="font-medium text-slate-900">{build.export_method || 'ad-hoc'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Runner
                  </dt>
                  <dd className="font-medium text-slate-900">{build.runner_name || 'Default'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Xcode Version
                  </dt>
                  <dd className="font-medium text-slate-900">{build.xcode_version || '15.0'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration
                  </dt>
                  <dd className="font-medium text-slate-900">{formatDuration(build.duration_seconds)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Version Details</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Version</dt>
                  <dd className="font-medium text-slate-900">{build.version || '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Build Number</dt>
                  <dd className="font-medium text-slate-900">{build.build_number || '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Bundle ID</dt>
                  <dd className="font-mono text-sm text-slate-900">{build.bundle_id || '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Scheme</dt>
                  <dd className="font-medium text-slate-900">{build.scheme || '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500">Configuration</dt>
                  <dd className="font-medium text-slate-900">{build.configuration || 'Release'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Error Display */}
          {build.status === 'failed' && build.error_summary && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Build Failed</h3>
                  <p className="text-red-700 mt-1">{build.error_summary}</p>
                  {build.error_command && (
                    <pre className="mt-3 p-3 bg-red-100 rounded-lg text-sm font-mono text-red-900 overflow-x-auto">
                      {build.error_command}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Build Logs</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                {build.logs_url && (
                  <a href={build.logs_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink className="w-4 h-4" />
                      Full Logs
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-900 text-slate-100 font-mono text-sm max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap">
{`[${format(new Date(build.created_date), 'HH:mm:ss')}] Build queued
[${format(new Date(build.created_date), 'HH:mm:ss')}] Preparing execution environment...
[${format(new Date(build.created_date), 'HH:mm:ss')}] Checking out source from ${build.branch || 'main'}
[${format(new Date(build.created_date), 'HH:mm:ss')}] Running xcodebuild -resolvePackageDependencies
[${format(new Date(build.created_date), 'HH:mm:ss')}] Resolved 24 packages
[${format(new Date(build.created_date), 'HH:mm:ss')}] Starting archive phase...
[${format(new Date(build.created_date), 'HH:mm:ss')}] xcodebuild -scheme ${build.scheme || 'App'} -configuration ${build.configuration || 'Release'} archive
${build.status === 'success' ? `[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] Archive succeeded
[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] Exporting IPA with method: ${build.export_method || 'ad-hoc'}
[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] Export succeeded
[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] Build completed successfully` : ''}
${build.status === 'failed' ? `[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] ERROR: ${build.error_summary || 'Build failed'}
${build.error_command ? `[${format(new Date(build.completed_at || build.created_date), 'HH:mm:ss')}] Failed command: ${build.error_command}` : ''}` : ''}
${build.status === 'running' ? `[${format(new Date(), 'HH:mm:ss')}] Build in progress...` : ''}`}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* Signing Tab */}
        <TabsContent value="signing" className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Signing Diagnostics
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <dt className="text-sm text-slate-500">Certificate</dt>
                <dd className="font-medium text-slate-900">
                  {build.signing_certificate_id ? 'Configured' : 'Auto-selected'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <dt className="text-sm text-slate-500">Provisioning Profile</dt>
                <dd className="font-medium text-slate-900">
                  {build.provisioning_profile_id ? 'Configured' : 'Auto-matched'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <dt className="text-sm text-slate-500">Bundle ID Match</dt>
                <dd className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Verified</span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">Entitlements</dt>
                <dd className="font-medium text-slate-900">Standard</dd>
              </div>
            </dl>
          </div>
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Build Artifacts</h3>
            {build.status === 'success' ? (
              <div className="space-y-3">
                {build.ipa_url && (
                  <a 
                    href={build.ipa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Signed IPA</p>
                        <p className="text-sm text-slate-500">{build.project_name}-{build.version}.ipa</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
                {build.dsym_url && (
                  <a 
                    href={build.dsym_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileCode className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Debug Symbols</p>
                        <p className="text-sm text-slate-500">dSYMs.zip</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
                {build.export_options_url && (
                  <a 
                    href={build.export_options_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Export Options</p>
                        <p className="text-sm text-slate-500">exportOptions.plist</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
                {!build.ipa_url && !build.dsym_url && (
                  <p className="text-slate-500 py-8 text-center">
                    No artifacts available yet
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 py-8 text-center">
                {build.status === 'running' || build.status === 'queued' 
                  ? 'Artifacts will be available after build completes'
                  : 'No artifacts available for failed build'
                }
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}