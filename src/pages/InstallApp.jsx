import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Smartphone, 
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function InstallApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const buildId = urlParams.get('id');
  const [copied, setCopied] = useState(false);

  const { data: build, isLoading } = useQuery({
    queryKey: ['build', buildId],
    queryFn: async () => {
      const builds = await base44.entities.Build.filter({ id: buildId });
      return builds[0];
    },
    enabled: !!buildId,
  });

  const handleCopyLink = () => {
    const installUrl = window.location.href;
    navigator.clipboard.writeText(installUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInstallUrl = () => {
    // Static manifest hosted on custom domain
    const manifestUrl = `https://fredsnwdocprep.org/ios/manifest.plist`;
    return `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!build || !build.ipa_url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Build Not Available</h1>
          <p className="text-slate-600">
            The requested build does not exist or the IPA is not ready yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {build.project_name || 'App'}
          </h1>
          <p className="text-slate-500">Version {build.version} ({build.build_number})</p>
        </div>

        {/* Install Button */}
        <a href={getInstallUrl()}>
          <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 gap-3 mb-4">
            <Download className="w-5 h-5" />
            Install on This Device
          </Button>
        </a>

        {/* Share Link */}
        <Button 
          variant="outline" 
          className="w-full gap-2 mb-6"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Install Link
            </>
          )}
        </Button>

        {/* Build Info */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">Build Information</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Bundle ID</dt>
              <dd className="font-mono text-slate-900 text-xs">com.fred.autoinsight</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Version</dt>
              <dd className="font-medium text-slate-900">1.11.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Hosted At</dt>
              <dd className="font-medium text-slate-900">fredsnwdocprep.org</dd>
            </div>
          </dl>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-xs">1</span>
            </div>
            <p className="text-slate-600">
              Tap <strong>"Install on This Device"</strong> to begin installation
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-xs">2</span>
            </div>
            <p className="text-slate-600">
              Confirm the installation prompt from iOS
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-xs">3</span>
            </div>
            <p className="text-slate-600">
              Go to <strong>Settings → General → VPN & Device Management</strong> to trust the certificate
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Securely Signed Build
              </p>
              <p className="text-xs text-emerald-700">
                This IPA is code-signed and distributed via FRED's IPA
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Powered by FRED's IPA
          </p>
        </div>
      </div>
    </div>
  );
}