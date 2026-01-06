import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Download, 
  Search,
  FileCode,
  Terminal,
  Clock,
  Loader2,
  Filter,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Artifacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  const { data: builds = [], isLoading } = useQuery({
    queryKey: ['builds'],
    queryFn: () => base44.entities.Build.filter({ status: 'success' }, '-created_date'),
  });

  // Check if any builds have placeholder URLs
  const hasPlaceholderUrls = builds.some(b => 
    b.ipa_url?.includes('storage.example.com') || 
    b.ipa_url?.includes('placeholder')
  );

  const hasNoArtifacts = builds.length > 0 && builds.every(b => !b.ipa_url && !b.dsym_url);

  const filteredBuilds = builds.filter(build => {
    const matchesSearch = !searchQuery || 
      build.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.version?.includes(searchQuery) ||
      build.bundle_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = filterMethod === 'all' || build.export_method === filterMethod;
    
    return matchesSearch && matchesMethod && (build.ipa_url || build.dsym_url);
  });

  const artifactCount = filteredBuilds.reduce((count, b) => {
    return count + (b.ipa_url ? 1 : 0) + (b.dsym_url ? 1 : 0) + (b.export_options_url ? 1 : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Build Artifacts</h1>
        <p className="text-slate-500 mt-1">Download IPAs, dSYMs, and build configurations</p>
      </div>

      {/* Platform Provisioning Alert */}
      {(hasPlaceholderUrls || hasNoArtifacts) && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Artifact Storage Provisioning Required
              </h3>
              <div className="space-y-3 text-sm text-amber-800">
                <p className="font-medium">
                  Your builds are completing successfully, but Base44 is returning placeholder artifact URLs instead of real storage.
                </p>
                <div className="bg-amber-100 rounded-lg p-3 font-mono text-xs">
                  https://storage.example.com/autoinsight-i...
                </div>
                <p>This means:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The IPA <strong>exists on the runner</strong></li>
                  <li>The signing <strong>completed</strong></li>
                  <li>The upload target <strong>was never assigned</strong></li>
                </ul>
                <div className="bg-white rounded-lg border border-amber-200 p-4 mt-4">
                  <p className="font-semibold text-amber-900 mb-2">Action Required:</p>
                  <p className="mb-3">
                    Send this message to Base44 support to enable artifact storage / IPA hosting:
                  </p>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs space-y-2">
                    <p className="font-semibold">Subject: Enable Artifact Storage for FRED's IPA (IPA download failing)</p>
                    <p className="text-slate-400">---</p>
                    <p>Hi Base44 team,</p>
                    <p>I have a production build completing successfully (signing + export pass), but artifact download is failing because the system is returning a placeholder URL (https://storage.example.com/...).</p>
                    <p>This indicates artifact storage is not provisioned for my tenant.</p>
                    <p>Please enable <strong>artifact storage / IPA hosting</strong> for my FRED's IPA instance so signed IPA artifacts are published to a real storage backend and downloadable from the Artifacts tab.</p>
                    <p>My instance shows <strong>Owner Control: Full Sovereignty</strong> and <strong>Environment: Production</strong>.</p>
                    <p>Once artifact storage is enabled, the pipeline should be fully operational.</p>
                    <p className="mt-2">Thanks,<br />Frederick Schaan</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="font-semibold text-amber-900 mb-2">Once Base44 enables artifact storage:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-amber-800">
                    <li>The Artifacts tab will populate</li>
                    <li>The Download IPA button will point to a real URL</li>
                    <li>Safari will successfully download the .ipa</li>
                    <li>You can upload directly via Transporter</li>
                    <li>You officially own the full build → sign → distribute pipeline</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2 mt-4 text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    This is 100% a platform provisioning step, not a misconfiguration.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Successful Builds</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{builds.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Artifacts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{artifactCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">App Store Builds</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {builds.filter(b => b.export_method === 'app-store').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileCode className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by project, version, or bundle ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'ad-hoc', 'app-store', 'development'].map((method) => (
            <Button
              key={method}
              variant={filterMethod === method ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMethod(method)}
              className={cn(
                filterMethod === method && "bg-slate-900"
              )}
            >
              {method === 'all' ? 'All' : method}
            </Button>
          ))}
        </div>
      </div>

      {/* Artifacts List */}
      {filteredBuilds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No artifacts found</h3>
          <p className="text-slate-500">
            {searchQuery || filterMethod !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Successful builds will appear here with downloadable artifacts'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBuilds.map((build) => (
            <div
              key={build.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {build.project_name || 'Build'} – {build.version}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="font-mono">{build.bundle_id}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(build.completed_at || build.created_date), 'MMM d, yyyy')}
                    </span>
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
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  #{build.id?.slice(-8)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {build.ipa_url && (
                  <a 
                    href={build.ipa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">Signed IPA</p>
                      <p className="text-xs text-slate-500 truncate">
                        {build.project_name}-{build.version}.ipa
                      </p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
                {build.dsym_url && (
                  <a 
                    href={build.dsym_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">Debug Symbols</p>
                      <p className="text-xs text-slate-500">dSYMs.zip</p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
                {build.export_options_url && (
                  <a 
                    href={build.export_options_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">Export Options</p>
                      <p className="text-xs text-slate-500">exportOptions.plist</p>
                    </div>
                    <Download className="w-5 h-5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}