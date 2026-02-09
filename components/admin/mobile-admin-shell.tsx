"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

// Navigation items
const navItems = [
  { href: "/mgmt-x9k2m7", label: "Dashboard", icon: "📊" },
  { href: "/mgmt-x9k2m7/status", label: "Product Status", icon: "⚡" },
  { href: "/mgmt-x9k2m7/categories", label: "Categories", icon: "📁" },
  { href: "/mgmt-x9k2m7/orders", label: "Orders", icon: "🛒" },
  { href: "/mgmt-x9k2m7/licenses", label: "License Keys", icon: "🔑" },
  { href: "/mgmt-x9k2m7/products", label: "Products", icon: "📦" },
  { href: "/mgmt-x9k2m7/coupons", label: "Coupons", icon: "🏷️" },
  { href: "/mgmt-x9k2m7/webhooks", label: "Webhooks", icon: "🔗" },
  { href: "/mgmt-x9k2m7/team", label: "Team", icon: "👥" },
  { href: "/mgmt-x9k2m7/site-messages", label: "Site Messages", icon: "💬" },
  { href: "/mgmt-x9k2m7/logs", label: "Audit Logs", icon: "📋" },
  { href: "/mgmt-x9k2m7/settings", label: "Settings", icon: "⚙️" },
];

interface MobileAdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function MobileAdminShell({ children, title, subtitle }: MobileAdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes (mobile navigation)
  useEffect(() => {
    if (mounted && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname, mounted]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  const handleMenuClick = () => {
    console.log('🍔 Hamburger menu clicked!');
    setSidebarOpen(true);
    console.log('📱 Sidebar should now be open');
  };

  const handleOverlayClick = () => {
    console.log('🎯 Overlay clicked, closing sidebar');
    setSidebarOpen(false);
  };

  const handleLinkClick = () => {
    // Auto-close on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleOverlayClick}
          onTouchEnd={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-r border-[#1a1a1a] transition-transform duration-300 flex flex-col",
          // Mobile: slide in/out
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1a1a] bg-gradient-to-r from-[#2563eb]/10 to-transparent">
          <Link href="/mgmt-x9k2m7" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg">Skyline</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Admin Panel</span>
            </div>
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mgmt-x9k2m7" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-lg"
                    : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-white/80 ml-auto animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#1a1a1a] bg-[#0a0a0a]/50">
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/admin/logout", { method: "POST" });
                if (response.ok) {
                  window.location.href = "/";
                }
              } catch (error) {
                console.error("Logout failed:", error);
                window.location.href = "/";
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/60 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        "lg:ml-64", // Always account for sidebar on desktop
        "ml-0" // Full width on mobile
      )}>
        {/* Header */}
        <div className="h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - ALWAYS VISIBLE ON MOBILE */}
            <button
              onClick={handleMenuClick}
              className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#2563eb]/30"
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