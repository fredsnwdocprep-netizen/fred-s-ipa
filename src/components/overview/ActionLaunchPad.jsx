import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, FolderPlus, KeyRound, GitBranch } from 'lucide-react';
import { cn } from "@/lib/utils";

const actions = [
  {
    id: 'initiate-build',
    label: 'Initiate Build',
    description: 'Start a new compilation',
    icon: Play,
    page: 'NewBuild',
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'hover:shadow-blue-500/25'
  },
  {
    id: 'register-project',
    label: 'Register Project',
    description: 'Add a new app project',
    icon: FolderPlus,
    page: 'Projects',
    query: '?action=new',
    color: 'from-emerald-600 to-teal-600',
    hoverColor: 'hover:shadow-emerald-500/25'
  },
  {
    id: 'add-signing',
    label: 'Add Signing Material',
    description: 'Upload certificates & profiles',
    icon: KeyRound,
    page: 'CredentialVault',
    query: '?action=upload',
    color: 'from-amber-500 to-orange-500',
    hoverColor: 'hover:shadow-amber-500/25'
  },
  {
    id: 'connect-source',
    label: 'Connect Source',
    description: 'Link a GitHub repository',
    icon: GitBranch,
    page: 'Projects',
    query: '?action=connect',
    color: 'from-slate-700 to-slate-900',
    hoverColor: 'hover:shadow-slate-500/25'
  }
];

export default function ActionLaunchPad() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.id}
            to={createPageUrl(action.page) + (action.query || '')}
            className={cn(
              "group relative p-5 rounded-2xl bg-gradient-to-br text-white transition-all duration-300",
              "hover:scale-[1.02] hover:shadow-xl",
              action.color,
              action.hoverColor
            )}
          >
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon className="w-7 h-7 mb-3 opacity-90" />
            <h3 className="font-semibold text-base">{action.label}</h3>
            <p className="text-sm opacity-80 mt-1">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}