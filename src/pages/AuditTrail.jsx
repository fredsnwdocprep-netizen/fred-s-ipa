import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ScrollText, 
  Search, 
  Filter,
  User,
  Key,
  FileKey2,
  Hammer,
  FolderKanban,
  Server,
  Settings,
  Loader2,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const actionIcons = {
  'CERT_UPLOAD': Key,
  'CERT_DELETE': Key,
  'PROFILE_UPLOAD': FileKey2,
  'PROFILE_DELETE': FileKey2,
  'BUILD_START': Hammer,
  'BUILD_COMPLETE': Hammer,
  'BUILD_FAIL': Hammer,
  'PROJECT_CREATE': FolderKanban,
  'PROJECT_UPDATE': FolderKanban,
  'PROJECT_DELETE': FolderKanban,
  'RUNNER_CREATE': Server,
  'RUNNER_UPDATE': Server,
  'RUNNER_DELETE': Server,
  'SETTINGS_UPDATE': Settings,
  'USER_LOGIN': User,
};

const actionColors = {
  'CERT_UPLOAD': 'bg-amber-100 text-amber-700',
  'CERT_DELETE': 'bg-red-100 text-red-700',
  'PROFILE_UPLOAD': 'bg-amber-100 text-amber-700',
  'PROFILE_DELETE': 'bg-red-100 text-red-700',
  'BUILD_START': 'bg-blue-100 text-blue-700',
  'BUILD_COMPLETE': 'bg-emerald-100 text-emerald-700',
  'BUILD_FAIL': 'bg-red-100 text-red-700',
  'PROJECT_CREATE': 'bg-purple-100 text-purple-700',
  'PROJECT_UPDATE': 'bg-purple-100 text-purple-700',
  'PROJECT_DELETE': 'bg-red-100 text-red-700',
  'RUNNER_CREATE': 'bg-slate-100 text-slate-700',
  'RUNNER_UPDATE': 'bg-slate-100 text-slate-700',
  'RUNNER_DELETE': 'bg-red-100 text-red-700',
  'SETTINGS_UPDATE': 'bg-slate-100 text-slate-700',
  'USER_LOGIN': 'bg-blue-100 text-blue-700',
};

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.created_by?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    
    return matchesSearch && matchesEntity;
  });

  const entityTypes = ['all', ...new Set(logs.map(l => l.entity_type).filter(Boolean))];

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
        <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-slate-500 mt-1">Complete history of system activities and changes</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search actions, entities, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {entityFilter === 'all' ? 'All Types' : entityFilter}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {entityTypes.map((type) => (
              <DropdownMenuItem 
                key={type}
                onClick={() => setEntityFilter(type)}
                className={cn(entityFilter === type && 'bg-slate-100')}
              >
                {type === 'all' ? 'All Types' : type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Audit Log */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No audit entries</h3>
          <p className="text-slate-500">
            {searchQuery || entityFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'System activities will be logged here'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Entity</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action] || ScrollText;
                  const colorClass = actionColors[log.action] || 'bg-slate-100 text-slate-700';
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-900">{log.entity_type}</p>
                          {log.entity_name && (
                            <p className="text-xs text-slate-500">{log.entity_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-600" />
                          </div>
                          <span className="text-sm text-slate-600">
                            {log.created_by || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(log.created_date), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4">
                        {log.details ? (
                          <span className="text-xs font-mono text-slate-500 truncate max-w-xs block">
                            {typeof log.details === 'string' 
                              ? log.details.slice(0, 50) 
                              : JSON.stringify(log.details).slice(0, 50)
                            }...
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}