import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
import StatusPill from '@/components/ui/StatusPill';
import { 
  Plus, 
  Server, 
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Clock,
  Cpu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function Runners() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRunner, setEditingRunner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'github-actions',
    macos_version: '',
    xcode_versions: '',
    status: 'offline'
  });

  const { data: runners = [], isLoading } = useQuery({
    queryKey: ['runners'],
    queryFn: () => base44.entities.Runner.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Runner.create({
      ...data,
      xcode_versions: data.xcode_versions ? data.xcode_versions.split(',').map(v => v.trim()) : [],
      total_builds: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['runners']);
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Runner.update(id, {
      ...data,
      xcode_versions: typeof data.xcode_versions === 'string' 
        ? data.xcode_versions.split(',').map(v => v.trim()) 
        : data.xcode_versions
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['runners']);
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Runner.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['runners']),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) => {
      const newStatus = currentStatus === 'offline' ? 'online' : 'offline';
      return base44.entities.Runner.update(id, { status: newStatus });
    },
    onSuccess: () => queryClient.invalidateQueries(['runners']),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'github-actions',
      macos_version: '',
      xcode_versions: '',
      status: 'offline'
    });
    setEditingRunner(null);
  };

  const handleEdit = (runner) => {
    setEditingRunner(runner);
    setFormData({
      name: runner.name || '',
      type: runner.type || 'github-actions',
      macos_version: runner.macos_version || '',
      xcode_versions: runner.xcode_versions?.join(', ') || '',
      status: runner.status || 'offline'
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRunner) {
      updateMutation.mutate({ id: editingRunner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const onlineCount = runners.filter(r => r.status === 'online' || r.status === 'busy').length;
  const totalBuilds = runners.reduce((sum, r) => sum + (r.total_builds || 0), 0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Execution Nodes</h1>
          <p className="text-slate-500 mt-1">Configure and monitor macOS build runners</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="gap-2 bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Runner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Runners</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{runners.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Server className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 bg-gradient-to-br from-white to-emerald-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Online</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{onlineCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Power className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Builds</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalBuilds}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Runners List */}
      {runners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Server className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No runners configured</h3>
          <p className="text-slate-500 mb-6">Add your first macOS build runner</p>
          <Button 
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Runner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runners.map((runner) => (
            <div
              key={runner.id}
              className={cn(
                "group bg-white rounded-2xl border p-5 transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                runner.status === 'online' && "border-emerald-200",
                runner.status === 'busy' && "border-blue-200",
                runner.status === 'offline' && "border-slate-200"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    runner.status === 'online' && "bg-emerald-100",
                    runner.status === 'busy' && "bg-blue-100",
                    runner.status === 'offline' && "bg-slate-100"
                  )}>
                    <Server className={cn(
                      "w-5 h-5",
                      runner.status === 'online' && "text-emerald-600",
                      runner.status === 'busy' && "text-blue-600",
                      runner.status === 'offline' && "text-slate-400"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{runner.name}</h3>
                    <StatusPill state={runner.status || 'offline'} className="mt-1" />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: runner.id, currentStatus: runner.status })}>
                      {runner.status === 'offline' ? (
                        <>
                          <Power className="w-4 h-4 mr-2 text-emerald-600" />
                          Bring Online
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-4 h-4 mr-2 text-slate-600" />
                          Take Offline
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(runner)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deleteMutation.mutate(runner.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Type</span>
                  <span className="font-medium">{runner.type || 'github-actions'}</span>
                </div>
                {runner.macos_version && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>macOS</span>
                    <span className="font-medium">{runner.macos_version}</span>
                  </div>
                )}
                {runner.xcode_versions?.length > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Xcode</span>
                    <span className="font-medium">{runner.xcode_versions.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100 mt-2">
                  <span>Builds</span>
                  <span className="font-semibold text-slate-900">{runner.total_builds || 0}</span>
                </div>
                {runner.last_heartbeat && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Last seen {format(new Date(runner.last_heartbeat), 'MMM d, h:mm a')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRunner ? 'Edit Runner' : 'Add Runner'}</DialogTitle>
            <DialogDescription>
              {editingRunner 
                ? 'Update runner configuration'
                : 'Configure a new macOS build runner'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Runner Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="macOS Runner 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Runner Type</Label>
              <Select 
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github-actions">GitHub Actions</SelectItem>
                  <SelectItem value="macstadium">MacStadium</SelectItem>
                  <SelectItem value="self-hosted">Self-Hosted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="macos_version">macOS Version</Label>
                <Input
                  id="macos_version"
                  value={formData.macos_version}
                  onChange={(e) => setFormData({ ...formData, macos_version: e.target.value })}
                  placeholder="14.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xcode_versions">Xcode Versions</Label>
                <Input
                  id="xcode_versions"
                  value={formData.xcode_versions}
                  onChange={(e) => setFormData({ ...formData, xcode_versions: e.target.value })}
                  placeholder="15.0, 15.1"
                />
                <p className="text-xs text-slate-500">Comma-separated</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingRunner ? 'Save Changes' : 'Add Runner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}