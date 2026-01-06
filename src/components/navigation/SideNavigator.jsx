import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  FolderKanban, 
  Hammer, 
  KeyRound, 
  Package, 
  Server, 
  ScrollText, 
  Settings 
} from 'lucide-react';

const navItems = [
  { label: "Overview", page: "Overview", icon: LayoutGrid },
  { label: "Projects", page: "Projects", icon: FolderKanban },
  { label: "Build Engine", page: "BuildEngine", icon: Hammer },
  { label: "Credential Vault", page: "CredentialVault", icon: KeyRound },
  { label: "Artifacts", page: "Artifacts", icon: Package },
  { label: "Execution Nodes", page: "Runners", icon: Server },
  { label: "Audit Trail", page: "AuditTrail", icon: ScrollText },
  { label: "System Settings", page: "Settings", icon: Settings },
];

export default function SideNavigator({ collapsed = false }) {
  const location = useLocation();

  const isActive = (page) => {
    const url = createPageUrl(page);
    return location.pathname === url || location.pathname === url + '/';
  };

  return (
    <nav className={cn(
      "flex flex-col gap-1 px-3 py-4",
      collapsed ? "w-16" : "w-56"
    )}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.page);

        return (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              active 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-transform duration-200",
              !active && "group-hover:scale-110"
            )} />
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}