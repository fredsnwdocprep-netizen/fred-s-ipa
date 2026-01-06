import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SystemPulse from '@/components/overview/SystemPulse';
import ActionLaunchPad from '@/components/overview/ActionLaunchPad';
import ExecutionTimeline from '@/components/overview/ExecutionTimeline';
import ExceptionFeed from '@/components/overview/ExceptionFeed';
import { Loader2 } from 'lucide-react';

export default function Overview() {
  const { data: builds = [], isLoading: buildsLoading } = useQuery({
    queryKey: ['builds'],
    queryFn: () => base44.entities.Build.list('-created_date', 50),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => base44.entities.SigningCertificate.list(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ProvisioningProfile.list(),
  });

  const { data: runners = [] } = useQuery({
    queryKey: ['runners'],
    queryFn: () => base44.entities.Runner.list(),
  });

  const handleRetry = async (build) => {
    // Navigate to new build with prefilled data
    window.location.href = `/NewBuild?retry=${build.id}`;
  };

  const handleRetryWithDiagnostics = async (build) => {
    // Navigate to new build with diagnostics flag
    window.location.href = `/NewBuild?retry=${build.id}&diagnostics=true`;
  };

  if (buildsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Monitor builds, signing health, and compute nodes</p>
      </div>

      {/* System Pulse Metrics */}
      <SystemPulse 
        builds={builds}
        certificates={certificates}
        profiles={profiles}
        runners={runners}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <ActionLaunchPad />
      </div>

      {/* Build Timeline */}
      <ExecutionTimeline 
        builds={builds.slice(0, 20)} 
        onRetry={handleRetry}
      />

      {/* Exception Feed */}
      <ExceptionFeed 
        builds={builds}
        onRetryWithDiagnostics={handleRetryWithDiagnostics}
      />
    </div>
  );
}