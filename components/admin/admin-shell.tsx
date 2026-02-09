"use client";

import React, { useState, useEffect } from "react"
import { Menu } from "lucide-react";

import { useAdminStore } from "@/lib/admin-store";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, setSidebarOpen]);

  const handleMobileMenuClick = () => {
    console.log('🍔 Mobile menu clicked in AdminShell!');
    setSidebarOpen(true);
    console.log('📱 Sidebar should now be open:', true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        // Desktop: margin based on sidebar state
        sidebarOpen ? "lg:ml-64" : "lg:ml-16",
        // Mobile: no margin, full width
        "ml-0"
      )}>
        {/* Header */}
        <div className="h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - ALWAYS VISIBLE ON MOBILE */}
            <button
              onClick={handleMobileMenuClick}
              className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#2563eb]/30 touch-manipulation"
              aria-label="Open navigation menu"
              type="button"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
            </div>
          </div>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-10 h-10 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
