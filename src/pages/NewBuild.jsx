import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
  Play, 
  GitBranch, 
  Package, 
  Key,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

const steps = [
  { id: 'source', label: 'Source', icon: GitBranch },
  { id: 'target', label: 'Target', icon: Package },
  { id: 'signing', label: 'Signing', icon: Key },
  { id: 'version', label: 'Version', icon: Package },
];

export default function NewBuild() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedProject = urlParams.get('project');
  const retryBuildId = urlParams.get('retry');

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    project_id: preselectedProject || '',
    branch: 'main',
    commit_sha: '',
    scheme: '',
    configuration: 'Release',
    export_method: 'ad-hoc',
    bundle_id: '',
    signing_certificate_id: '',
    provisioning_profile_id: '',
    version: '1.0.0',
    build_number: '1',
    build_number_strategy: 'manual'
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => base44.entities.SigningCertificate.filter({ status: 'active' }),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ProvisioningProfile.filter({ status: 'active' }),
  });

  const { data: builds = [] } = useQuery({
    queryKey: ['builds'],
    queryFn: () => base44.entities.Build.list('-created_date', 100),
  });

  // Auto-fill from retry build
  useEffect(() => {
    if (retryBuildId) {
      const retryBuild = builds.find(b => b.id === retryBuildId);
      if (retryBuild) {
        setFormData({
          project_id: retryBuild.project_id || '',
          branch: retryBuild.branch || 'main',
          commit_sha: '',
          scheme: retryBuild.scheme || '',
          configuration: retryBuild.configuration || 'Release',
          export_method: retryBuild.export_method || 'ad-hoc',
          bundle_id: retryBuild.bundle_id || '',
          signing_certificate_id: retryBuild.signing_certificate_id || '',
          provisioning_profile_id: retryBuild.provisioning_profile_id || '',
          version: retryBuild.version || '1.0.0',
          build_number: String(parseInt(retryBuild.build_number || '0') + 1),
          build_number_strategy: 'manual'
        });
      }
    }
  }, [retryBuildId, builds]);

  // Auto-fill from selected project
  useEffect(() => {
    if (formData.project_id) {
      const project = projects.find(p => p.id === formData.project_id);
      if (project) {
        setFormData(prev => ({
          ...prev,
          scheme: prev.scheme || project.default_scheme || '',
          bundle_id: prev.bundle_id || project.default_bundle_id || ''
        }));
      }
    }
  }, [formData.project_id, projects]);

  const createBuildMutation = useMutation({
    mutationFn: async (data) => {
      const project = projects.find(p => p.id === data.project_id);
      return base44.entities.Build.create({
        ...data,
        project_name: project?.name || '',
        status: 'queued',
        created_date: new Date().toISOString()
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['builds']);
      navigate(createPageUrl('BuildDetail') + `?id=${data.id}`);
    },
  });

  const selectedProject = projects.find(p => p.id === formData.project_id);
  const matchingProfiles = profiles.filter(p => 
    !formData.bundle_id || 
    p.bundle_id === formData.bundle_id || 
    p.bundle_id?.endsWith('*')
  );

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.project_id;
      case 1: return !!formData.scheme && !!formData.export_method;
      case 2: return true; // Signing is optional for now
      case 3: return !!formData.version && !!formData.build_number;
      default: return true;
    }
  };

  const handleSubmit = () => {
    createBuildMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          className="gap-2 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Initiate Build</h1>
        <p className="text-slate-500 mt-1">Configure and start a new compilation</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  isCurrent && "text-slate-900",
                  isCompleted && "text-emerald-600",
                  !isCurrent && !isCompleted && "text-slate-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCurrent && "bg-slate-900 text-white",
                  isCompleted && "bg-emerald-100 text-emerald-600",
                  !isCurrent && !isCompleted && "bg-slate-100 text-slate-400"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="hidden sm:block font-medium">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  index < currentStep ? "bg-emerald-300" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Step 1: Source */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Select Source</h2>
              <p className="text-sm text-slate-500">Choose the project and branch to build</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select 
                  value={formData.project_id}
                  onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch / Tag</Label>
                  <Input
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="main"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commit (optional)</Label>
                  <Input
                    value={formData.commit_sha}
                    onChange={(e) => setFormData({ ...formData, commit_sha: e.target.value })}
                    placeholder="Lock to specific commit"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Build Target</h2>
              <p className="text-sm text-slate-500">Configure scheme and export settings</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheme *</Label>
                  <Input
                    value={formData.scheme}
                    onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                    placeholder={selectedProject?.default_scheme || 'MyApp'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Configuration</Label>
                  <Select 
                    value={formData.configuration}
                    onValueChange={(v) => setFormData({ ...formData, configuration: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Debug">Debug</SelectItem>
                      <SelectItem value="Release">Release</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Export Method *</Label>
                <Select 
                  value={formData.export_method}
                  onValueChange={(v) => setFormData({ ...formData, export_method: v })}
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
                <p className="text-xs text-slate-500 mt-1">
                  {formData.export_method === 'ad-hoc' && 'Direct IPA installation on registered devices'}
                  {formData.export_method === 'app-store' && 'Archive for App Store / TestFlight submission'}
                  {formData.export_method === 'development' && 'For development and testing'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Signing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Code Signing</h2>
              <p className="text-sm text-slate-500">Select certificate and provisioning profile</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bundle Identifier</Label>
                <Input
                  value={formData.bundle_id}
                  onChange={(e) => setFormData({ ...formData, bundle_id: e.target.value })}
                  placeholder={selectedProject?.default_bundle_id || 'com.company.app'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Signing Certificate</Label>
                  <Select 
                    value={formData.signing_certificate_id}
                    onValueChange={(v) => setFormData({ ...formData, signing_certificate_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Auto-select</SelectItem>
                      {certificates.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provisioning Profile</Label>
                  <Select 
                    value={formData.provisioning_profile_id}
                    onValueChange={(v) => setFormData({ ...formData, provisioning_profile_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Auto-match</SelectItem>
                      {matchingProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.profile_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {certificates.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">No active certificates found. Add certificates in the Credential Vault.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Version */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Versioning</h2>
              <p className="text-sm text-slate-500">Set version and build number</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version *</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                  <p className="text-xs text-slate-500">Marketing version (CFBundleShortVersionString)</p>
                </div>
                <div className="space-y-2">
                  <Label>Build Number *</Label>
                  <Input
                    value={formData.build_number}
                    onChange={(e) => setFormData({ ...formData, build_number: e.target.value })}
                    placeholder="1"
                  />
                  <p className="text-xs text-slate-500">Internal build number (CFBundleVersion)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Build Number Strategy</Label>
                <Select 
                  value={formData.build_number_strategy}
                  onValueChange={(v) => setFormData({ ...formData, build_number_strategy: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto_increment">Auto Increment</SelectItem>
                    <SelectItem value="commit_count">Commit Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="gap-2 bg-slate-900 hover:bg-slate-800"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || createBuildMutation.isPending}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {createBuildMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Build
          </Button>
        )}
      </div>
    </div>
  );
}