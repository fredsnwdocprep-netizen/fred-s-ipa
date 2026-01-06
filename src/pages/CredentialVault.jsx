import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Key, 
  FileKey2, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  MoreVertical,
  Upload,
  Shield,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusPill from '@/components/ui/StatusPill';
import { cn } from "@/lib/utils";

export default function CredentialVault() {
  const queryClient = useQueryClient();
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    team_id: '',
    common_name: '',
    certificate_type: 'distribution',
    expires_at: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    team_id: '',
    bundle_id: '',
    profile_type: 'ad-hoc',
    expires_at: ''
  });

  const { data: certificates = [], isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => base44.entities.SigningCertificate.list('-created_date'),
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ProvisioningProfile.list('-created_date'),
  });

  const createCertMutation = useMutation({
    mutationFn: (data) => base44.entities.SigningCertificate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates']);
      setCertDialogOpen(false);
      setCertForm({ name: '', team_id: '', common_name: '', certificate_type: 'distribution', expires_at: '' });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.ProvisioningProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      setProfileDialogOpen(false);
      setProfileForm({ name: '', team_id: '', bundle_id: '', profile_type: 'ad-hoc', expires_at: '' });
    },
  });

  const deleteCertMutation = useMutation({
    mutationFn: (id) => base44.entities.SigningCertificate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['certificates']),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id) => base44.entities.ProvisioningProfile.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['profiles']),
  });

  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const getExpirationState = (expiresAt) => {
    if (!expiresAt) return 'active';
    const expires = new Date(expiresAt);
    if (expires < now) return 'expired';
    if (expires < new Date(now.getTime() + thirtyDays)) return 'warning';
    return 'active';
  };

  // Calculate overall health
  const expiredCerts = certificates.filter(c => getExpirationState(c.expires_at) === 'expired').length;
  const expiredProfiles = profiles.filter(p => getExpirationState(p.expires_at) === 'expired').length;
  const warningCerts = certificates.filter(c => getExpirationState(c.expires_at) === 'warning').length;
  const warningProfiles = profiles.filter(p => getExpirationState(p.expires_at) === 'warning').length;

  const overallHealth = (expiredCerts + expiredProfiles) > 0 
    ? 'critical' 
    : (warningCerts + warningProfiles) > 0 
    ? 'warning' 
    : 'healthy';

  const healthColors = {
    healthy: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    critical: 'from-red-500 to-rose-500'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credential Vault</h1>
          <p className="text-slate-500 mt-1">Manage signing certificates and provisioning profiles</p>
        </div>
      </div>

      {/* Integrity Monitor */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white",
        "bg-gradient-to-br",
        healthColors[overallHealth]
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Signing Integrity</h2>
              <p className="text-white/80 mt-1">
                {overallHealth === 'healthy' 
                  ? 'All credentials are valid and active'
                  : overallHealth === 'warning'
                  ? `${warningCerts + warningProfiles} credential(s) expiring soon`
                  : `${expiredCerts + expiredProfiles} credential(s) have expired`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-white/90">
            <div className="text-center">
              <p className="text-3xl font-bold">{certificates.length}</p>
              <p className="text-sm">Certificates</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{profiles.length}</p>
              <p className="text-sm">Profiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="certificates" className="gap-2">
            <Key className="w-4 h-4" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <FileKey2 className="w-4 h-4" />
            Profiles
          </TabsTrigger>
        </TabsList>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCertDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Certificate
            </Button>
          </div>

          {certsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No certificates</h3>
              <p className="text-slate-500 mb-6">Add your first signing certificate</p>
              <Button onClick={() => setCertDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Certificate
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Team ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Expires</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => {
                    const expState = getExpirationState(cert.expires_at);
                    return (
                      <tr key={cert.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Key className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{cert.name}</p>
                              {cert.fingerprint_sha1 && (
                                <p className="text-xs text-slate-400 font-mono">
                                  {cert.fingerprint_sha1.slice(0, 16)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                          {cert.team_id || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            cert.certificate_type === 'distribution'
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {cert.certificate_type || 'distribution'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {cert.expires_at ? (
                            <div className="flex items-center gap-1.5">
                              {expState === 'expired' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              {expState === 'warning' && <Clock className="w-4 h-4 text-amber-500" />}
                              {expState === 'active' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {format(new Date(cert.expires_at), 'MMM d, yyyy')}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill state={expState === 'warning' ? 'warning' : expState === 'expired' ? 'expired' : cert.status || 'active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => deleteCertMutation.mutate(cert.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setProfileDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Profile
            </Button>
          </div>

          {profilesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileKey2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No profiles</h3>
              <p className="text-slate-500 mb-6">Add your first provisioning profile</p>
              <Button onClick={() => setProfileDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Profile
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Bundle ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Expires</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((profile) => {
                    const expState = getExpirationState(profile.expires_at);
                    return (
                      <tr key={profile.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <FileKey2 className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{profile.name}</p>
                              {profile.profile_uuid && (
                                <p className="text-xs text-slate-400 font-mono">
                                  {profile.profile_uuid.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                          {profile.bundle_id || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            profile.profile_type === 'app-store'
                              ? "bg-purple-100 text-purple-700"
                              : profile.profile_type === 'ad-hoc'
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            {profile.profile_type || 'ad-hoc'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {profile.expires_at ? (
                            <div className="flex items-center gap-1.5">
                              {expState === 'expired' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              {expState === 'warning' && <Clock className="w-4 h-4 text-amber-500" />}
                              {expState === 'active' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {format(new Date(profile.expires_at), 'MMM d, yyyy')}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill state={expState === 'warning' ? 'warning' : expState === 'expired' ? 'expired' : profile.status || 'active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => deleteProfileMutation.mutate(profile.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Certificate Dialog */}
      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
            <DialogDescription>
              Register a signing certificate for code signing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createCertMutation.mutate(certForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert_name">Certificate Name *</Label>
              <Input
                id="cert_name"
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                placeholder="Distribution Certificate"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cert_team_id">Team ID *</Label>
                <Input
                  id="cert_team_id"
                  value={certForm.team_id}
                  onChange={(e) => setCertForm({ ...certForm, team_id: e.target.value })}
                  placeholder="ABC123XYZ"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={certForm.certificate_type} 
                  onValueChange={(v) => setCertForm({ ...certForm, certificate_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert_expires">Expiration Date</Label>
              <Input
                id="cert_expires"
                type="date"
                value={certForm.expires_at}
                onChange={(e) => setCertForm({ ...certForm, expires_at: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCertDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCertMutation.isPending}>
                {createCertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Certificate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Profile</DialogTitle>
            <DialogDescription>
              Register a provisioning profile for distribution
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createProfileMutation.mutate(profileForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_name">Profile Name *</Label>
              <Input
                id="profile_name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Ad Hoc Profile"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile_team_id">Team ID</Label>
                <Input
                  id="profile_team_id"
                  value={profileForm.team_id}
                  onChange={(e) => setProfileForm({ ...profileForm, team_id: e.target.value })}
                  placeholder="ABC123XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={profileForm.profile_type} 
                  onValueChange={(v) => setProfileForm({ ...profileForm, profile_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="ad-hoc">Ad Hoc</SelectItem>
                    <SelectItem value="app-store">App Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_bundle_id">Bundle ID *</Label>
              <Input
                id="profile_bundle_id"
                value={profileForm.bundle_id}
                onChange={(e) => setProfileForm({ ...profileForm, bundle_id: e.target.value })}
                placeholder="com.company.app"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_expires">Expiration Date</Label>
              <Input
                id="profile_expires"
                type="date"
                value={profileForm.expires_at}
                onChange={(e) => setProfileForm({ ...profileForm, expires_at: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProfileMutation.isPending}>
                {createProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}