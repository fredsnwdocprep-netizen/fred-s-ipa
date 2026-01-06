import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  FolderKanban, 
  GitBranch, 
  Hammer, 
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusPill from '@/components/ui/StatusPill';
import { cn } from "@/lib/utils";

export default function Projects() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    repo_url: '',
    default_scheme: '',
    default_bundle_id: '',
    team_id: ''
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const { data: builds = [] } = useQuery({
    queryKey: ['builds'],
    queryFn: () => base44.entities.Build.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['projects']),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      repo_url: '',
      default_scheme: '',
      default_bundle_id: '',
      team_id: ''
    });
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      repo_url: project.repo_url || '',
      default_scheme: project.default_scheme || '',
      default_bundle_id: project.default_bundle_id || '',
      team_id: project.team_id || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, status: 'active' });
    }
  };

  const getProjectStats = (projectId) => {
    const projectBuilds = builds.filter(b => b.project_id === projectId);
    return {
      total: projectBuilds.length,
      successful: projectBuilds.filter(b => b.status === 'success').length,
      lastBuild: projectBuilds[0]
    };
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your iOS app projects</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="gap-2 bg-slate-900 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Register Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">Register your first iOS project to start building</p>
          <Button 
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Register Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <div
                key={project.id}
                className={cn(
                  "group bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-200",
                  "hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{project.name}</h3>
                      <StatusPill state={project.status || 'active'} className="mt-1" />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => deleteMutation.mutate(project.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {project.default_bundle_id && (
                  <p className="text-xs text-slate-500 font-mono mb-3 truncate">
                    {project.default_bundle_id}
                  </p>
                )}

                {project.repo_url && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-4">
                    <GitBranch className="w-4 h-4" />
                    <span className="truncate">{project.repo_url.replace('https://github.com/', '')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      <span className="font-semibold text-slate-700">{stats.total}</span> builds
                    </span>
                    <span className="text-emerald-600">
                      <span className="font-semibold">{stats.successful}</span> successful
                    </span>
                  </div>
                  <Link to={createPageUrl('NewBuild') + `?project=${project.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Hammer className="w-4 h-4" />
                      Build
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Register Project'}</DialogTitle>
            <DialogDescription>
              {editingProject 
                ? 'Update your project configuration'
                : 'Add a new iOS project to start building'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My iOS App"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo_url">GitHub Repository</Label>
              <Input
                id="repo_url"
                value={formData.repo_url}
                onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_scheme">Default Scheme</Label>
                <Input
                  id="default_scheme"
                  value={formData.default_scheme}
                  onChange={(e) => setFormData({ ...formData, default_scheme: e.target.value })}
                  placeholder="MyApp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_id">Team ID</Label>
                <Input
                  id="team_id"
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  placeholder="ABC123XYZ"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_bundle_id">Bundle Identifier</Label>
              <Input
                id="default_bundle_id"
                value={formData.default_bundle_id}
                onChange={(e) => setFormData({ ...formData, default_bundle_id: e.target.value })}
                placeholder="com.company.app"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}