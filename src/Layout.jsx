import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TopCommandBar from '@/components/navigation/TopCommandBar';
import SideNavigator from '@/components/navigation/SideNavigator';
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
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

  // Calculate system health
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  
  const expiredCerts = certificates.filter(c => c.expires_at && new Date(c.expires_at) < now);
  const expiredProfiles = profiles.filter(p => p.expires_at && new Date(p.expires_at) < now);
  const signingStatus = (expiredCerts.length + expiredProfiles.length) > 0 
    ? 'critical' 
    : certificates.some(c => c.expires_at && new Date(c.expires_at) < new Date(now.getTime() + thirtyDays))
    ? 'warning'
    : 'healthy';

  const onlineRunners = runners.filter(r => r.status === 'online' || r.status === 'busy').length;
  const systemStatus = onlineRunners === 0 && runners.length > 0 ? 'critical' : 'healthy';

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --border: 214.3 31.8% 91.4%;
          --ring: 222.2 84% 4.9%;
        }
      `}</style>

      <TopCommandBar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        systemStatus={systemStatus}
        signingStatus={signingStatus}
        onMenuToggle={() => setMobileNavOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] sticky top-16">
          <SideNavigator />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <div className="py-4">
              <SideNavigator />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}