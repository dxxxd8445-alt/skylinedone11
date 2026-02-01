"use client";

import { useEffect, useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  priority: number;
  created_at: string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissed-announcements');
    if (dismissed) {
      try {
        setDismissedIds(JSON.parse(dismissed));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Add padding to body when banner is visible
  useEffect(() => {
    const visibleCount = announcements.filter(
      announcement => !dismissedIds.includes(announcement.id)
    ).length;
    
    // Even smaller heights for better mobile experience
    const bannerHeight = visibleCount * 36; // Further reduced to 36px
    const headerHeight = 56; // Reduced back for compact design
    
    if (visibleCount > 0) {
      // Set CSS custom property for header positioning
      document.documentElement.style.setProperty('--announcement-height', `${bannerHeight}px`);
      // Add padding for both banner and header
      document.body.style.paddingTop = `${bannerHeight + headerHeight}px`;
    } else {
      // No banner, header at top
      document.documentElement.style.setProperty('--announcement-height', '0px');
      // Only header padding when no banner
      document.body.style.paddingTop = `${headerHeight}px`;
    }
    
    return () => {
      document.documentElement.style.setProperty('--announcement-height', '0px');
      document.body.style.paddingTop = `${headerHeight}px`; // Keep header padding
    };
  }, [announcements, dismissedIds]);

  async function loadAnnouncements() {
    try {
      // Use the optimized active announcements endpoint
      const response = await fetch('/api/announcements/active');
      
      if (!response.ok) {
        console.error('Failed to load announcements:', response.status);
        return;
      }
      
      const result = await response.json();
      setAnnouncements(result.data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  function dismissAnnouncement(id: string) {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-announcements', JSON.stringify(newDismissed));
  }

  const getTypeConfig = (type: string) => {
    const configs = {
      info: {
        bg: "bg-gradient-to-r from-[#dc2626] to-[#ef4444]",
        border: "border-red-500/30",
        icon: Info,
        iconBg: "bg-red-500/20",
        shadow: "shadow-red-500/20",
      },
      warning: {
        bg: "bg-gradient-to-r from-amber-600 to-amber-700",
        border: "border-amber-500/30",
        icon: AlertTriangle,
        iconBg: "bg-amber-500/20",
        shadow: "shadow-amber-500/20",
      },
      success: {
        bg: "bg-gradient-to-r from-emerald-600 to-emerald-700",
        border: "border-emerald-500/30",
        icon: CheckCircle,
        iconBg: "bg-emerald-500/20",
        shadow: "shadow-emerald-500/20",
      },
      error: {
        bg: "bg-gradient-to-r from-red-600 to-red-700",
        border: "border-red-500/30",
        icon: XCircle,
        iconBg: "bg-red-500/20",
        shadow: "shadow-red-500/20",
      },
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.includes(announcement.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] w-full">
      {visibleAnnouncements.map((announcement) => {
        const config = getTypeConfig(announcement.type);
        const Icon = config.icon;

        return (
          <div
            key={announcement.id}
            className={`${config.bg} ${config.border} border-b backdrop-blur-sm relative overflow-hidden shadow-xl ${config.shadow}`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30" />
            
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-1.5 sm:py-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Icon - much smaller on mobile */}
                  <div className={`${config.iconBg} rounded-md p-1 flex-shrink-0 border border-white/30`}>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Content - ultra compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                      <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base drop-shadow-lg leading-tight">
                        {announcement.title}
                      </h3>
                      <p className="text-white/95 text-xs sm:text-sm font-medium drop-shadow-lg leading-tight">
                        {announcement.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dismiss button - much smaller on mobile */}
                <button
                  onClick={() => dismissAnnouncement(announcement.id)}
                  className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-black/30 hover:bg-black/50 border border-white/30 hover:border-white/50 flex items-center justify-center text-white/90 hover:text-white transition-all duration-200 group backdrop-blur-sm"
                  title="Dismiss announcement"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform drop-shadow-lg" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}