"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, X } from "lucide-react";

export function WelcomePopup() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has accepted terms and hasn't seen welcome popup
    const hasAcceptedTerms = localStorage.getItem('terms-accepted');
    const hasSeenWelcome = localStorage.getItem('welcome-seen');
    
    if (hasAcceptedTerms && !hasSeenWelcome) {
      // Show welcome popup after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  function handleCheckOut() {
    localStorage.setItem('welcome-seen', 'true');
    setShowWelcome(false);
    // Navigate to HWID Spoofer product
    window.location.href = '/store/universal/hwid-spoofer';
  }

  function handleMaybeLater() {
    localStorage.setItem('welcome-seen', 'true');
    setShowWelcome(false);
  }

  if (loading || !showWelcome) {
    return null;
  }

  return (
    <Dialog open={showWelcome} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-gradient-to-br from-[#1a1f3a] via-[#0f1629] to-[#1a1f3a] border-2 border-[#9ca3af]/50 text-white max-w-2xl overflow-hidden"
        hideCloseButton
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6b7280]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#9ca3af]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Close button */}
        <button
          onClick={handleMaybeLater}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border-2 border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>
        
        {/* Content */}
        <div className="relative z-10 pt-12 pb-6 px-4">
          {/* Icon with glow effect */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-[#9ca3af]/40 rounded-full blur-3xl animate-pulse" />
              {/* Icon container */}
              <div className="relative w-28 h-28 rounded-full bg-[#9ca3af] flex items-center justify-center shadow-2xl shadow-[#9ca3af]/60 animate-float">
                <Shield className="w-14 h-14 text-white" />
              </div>
              {/* Sparkle effects */}
              <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-[#9ca3af] animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 w-5 h-5 text-[#6b7280] animate-pulse delay-500" />
            </div>
          </div>

          <DialogHeader className="text-center space-y-4 mb-10">
            <DialogTitle className="text-3xl sm:text-4xl font-bold text-white leading-tight px-4">
              Have You Ever Been Banned From a Game?
            </DialogTitle>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed px-4">
              We have the solution. 1 click clean and unban from any game of your wish.
            </p>
          </DialogHeader>

          <DialogFooter className="flex flex-row gap-3 mt-8 px-4">
            {/* Primary CTA - CHECK IT OUT (left side, blue button) */}
            <Button
              onClick={handleCheckOut}
              className="flex-1 bg-[#9ca3af] hover:bg-[#6b7280] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#9ca3af]/40 text-sm relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">
                CHECK IT OUT
              </span>
            </Button>

            {/* Secondary button - MAYBE LATER (right side) */}
            <Button
              onClick={handleMaybeLater}
              variant="ghost"
              className="flex-1 text-gray-400 hover:text-white hover:bg-white/5 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 text-sm"
            >
              MAYBE LATER
            </Button>
          </DialogFooter>
        </div>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-lg border-2 border-[#9ca3af]/30 pointer-events-none animate-pulse" />
      </DialogContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </Dialog>
  );
}
