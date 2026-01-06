import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Shield,
  Globe,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    default_xcode_version: '15.0',
    default_export_method: 'ad-hoc',
    auto_increment_builds: true,
    cleanup_old_artifacts: true,
    artifact_retention_days: 30
  });

  const [profileSettings, setProfileSettings] = useState({
    full_name: '',
    email: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setProfileSettings({
          full_name: userData?.full_name || '',
          email: userData?.email || ''
        });
      } catch (e) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: profileSettings.full_name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error saving profile:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure your FRED's IPA instance</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Build Defaults</h2>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Xcode Version</Label>
                  <Input
                    value={generalSettings.default_xcode_version}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      default_xcode_version: e.target.value
                    })}
                    placeholder="15.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Export Method</Label>
                  <select
                    value={generalSettings.default_export_method}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      default_export_method: e.target.value
                    })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="development">Development</option>
                    <option value="ad-hoc">Ad Hoc</option>
                    <option value="app-store">App Store</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Auto-increment Build Numbers</p>
                    <p className="text-sm text-slate-500">Automatically increment build numbers for each new build</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalSettings.auto_increment_builds}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      auto_increment_builds: e.target.checked
                    })}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">Cleanup Old Artifacts</p>
                    <p className="text-sm text-slate-500">Automatically delete artifacts older than retention period</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={generalSettings.cleanup_old_artifacts}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      cleanup_old_artifacts: e.target.checked
                    })}
                    className="h-5 w-5"
                  />
                </div>
              </div>

              {generalSettings.cleanup_old_artifacts && (
                <div className="space-y-2">
                  <Label>Artifact Retention (Days)</Label>
                  <Input
                    type="number"
                    value={generalSettings.artifact_retention_days}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      artifact_retention_days: parseInt(e.target.value)
                    })}
                    min={1}
                    max={365}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">System Information</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Platform Version</dt>
                <dd className="font-medium text-slate-900">FRED's IPA v1.0.0</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <dt className="text-slate-500">Environment</dt>
                <dd className="font-medium text-slate-900">Production</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Owner Control</dt>
                <dd className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Full Sovereignty
                </dd>
              </div>
            </dl>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Your Profile</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={profileSettings.full_name}
                  onChange={(e) => setProfileSettings({
                    ...profileSettings,
                    full_name: e.target.value
                  })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={profileSettings.email}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Role</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Owner</p>
                <p className="text-sm text-slate-500">Full administrative access and signing key sovereignty</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Configuration</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-900">Signing Assets Protected</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      All certificates and provisioning profiles are encrypted at rest and access-controlled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Infrastructure Portability</p>
                    <p className="text-sm text-slate-500 mt-1">
                      All build recipes, configurations, and data can be exported at any time. Zero vendor lock-in guaranteed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ownership Statement</h2>
            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <p className="font-mono text-sm leading-relaxed">
                FRED's IPA is privately owned by you. All Apple Developer credentials, certificates, 
                provisioning profiles, and API keys remain your exclusive property. This system is 
                designed to outlive any platform vendor. You don't rent this system — you rule it. 👑
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}