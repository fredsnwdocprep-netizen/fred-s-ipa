import React from 'react';
import PulseMetric from '@/components/ui/PulseMetric';
import { Hammer, Shield, Server, HardDrive } from 'lucide-react';

export default function SystemPulse({ builds = [], certificates = [], profiles = [], runners = [] }) {
  // Calculate metrics
  const activeJobs = builds.filter(b => b.status === 'running' || b.status === 'queued').length;
  const failedLast24h = builds.filter(b => {
    if (b.status !== 'failed') return false;
    const created = new Date(b.created_date);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return created > dayAgo;
  }).length;

  // Signing health calculation
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const expiringSoon = [...certificates, ...profiles].filter(item => {
    if (!item.expires_at) return false;
    const expires = new Date(item.expires_at);
    return expires > now && expires < new Date(now.getTime() + thirtyDays);
  }).length;

  const expiredCount = [...certificates, ...profiles].filter(item => {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < now;
  }).length;

  // Runner health
  const onlineRunners = runners.filter(r => r.status === 'online' || r.status === 'busy').length;
  const totalRunners = runners.length || 1;

  // Determine states
  const buildState = activeJobs > 3 ? 'warning' : failedLast24h > 2 ? 'critical' : 'healthy';
  const signingState = expiredCount > 0 ? 'critical' : expiringSoon > 0 ? 'warning' : 'healthy';
  const runnerState = onlineRunners === 0 ? 'critical' : onlineRunners < totalRunners / 2 ? 'warning' : 'healthy';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <PulseMetric
        name="Active Jobs"
        value={`${activeJobs} Active`}
        state={buildState}
        icon={Hammer}
        trend={failedLast24h > 0 ? { positive: false, value: `${failedLast24h} failed (24h)` } : null}
      />
      <PulseMetric
        name="Signing State"
        value={expiredCount > 0 ? `${expiredCount} Expired` : expiringSoon > 0 ? `${expiringSoon} Expiring` : 'Healthy'}
        state={signingState}
        icon={Shield}
      />
      <PulseMetric
        name="Compute Nodes"
        value={`${onlineRunners}/${totalRunners} Online`}
        state={runnerState}
        icon={Server}
      />
      <PulseMetric
        name="Build Artifacts"
        value={`${builds.filter(b => b.status === 'success').length} Stored`}
        state="neutral"
        icon={HardDrive}
      />
    </div>
  );
}