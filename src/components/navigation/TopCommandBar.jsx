import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { 
  Search, 
  ChevronDown, 
  Shield, 
  Zap, 
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusPill from '@/components/ui/StatusPill';

export default function TopCommandBar({ 
  user, 
  projects = [], 
  selectedProject, 
  onProjectChange,
  systemStatus = "healthy",
  signingStatus = "healthy",
  onMenuToggle,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 h-16 px-4 lg:px-6 flex items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
      {/* Left: Brand + Project Selector */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="hidden sm:block font-semibold text-slate-900">FRED's IPA</span>
        </div>

        {projects.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-4 gap-2 max-w-48">
                <span className="truncate">{selectedProject?.name || "Select Project"}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {projects.map((p) => (
                <DropdownMenuItem 
                  key={p.id} 
                  onClick={() => onProjectChange?.(p)}
                  className="cursor-pointer"
                >
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search builds, versions, commits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: System Indicators + Account */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50">
            <Zap className={cn(
              "w-4 h-4",
              systemStatus === "healthy" ? "text-emerald-500" : 
              systemStatus === "warning" ? "text-amber-500" : "text-red-500"
            )} />
            <span className="text-xs font-medium text-slate-600">Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50">
            <Shield className={cn(
              "w-4 h-4",
              signingStatus === "healthy" ? "text-emerald-500" : 
              signingStatus === "warning" ? "text-amber-500" : "text-red-500"
            )} />
            <span className="text-xs font-medium text-slate-600">Signing</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-slate-700">
                {user?.full_name || 'Owner'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}