"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Check, FileText } from "lucide-react";

export function TermsPopup() {
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has already accepted terms
    const hasAccepted = localStorage.getItem('terms-accepted');
    const sessionId = getOrCreateSessionId();
    
    if (!hasAccepted) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowTerms(true);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  function getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  async function handleAcceptTerms() {
    try {
      const sessionId = getOrCreateSessionId();
      
      // Store acceptance in database
      const response = await fetch('/api/terms/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: sessionId,
        }),
      });

      if (response.ok) {
        // Store acceptance locally
        localStorage.setItem('terms-accepted', 'true');
        localStorage.setItem('terms-accepted-date', new Date().toISOString());
        setShowTerms(false);
      } else {
        console.error('Failed to record terms acceptance');
        // Still allow user to proceed locally
        localStorage.setItem('terms-accepted', 'true');
        localStorage.setItem('terms-accepted-date', new Date().toISOString());
        setShowTerms(false);
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      // Still allow user to proceed locally
      localStorage.setItem('terms-accepted', 'true');
      localStorage.setItem('terms-accepted-date', new Date().toISOString());
      setShowTerms(false);
    }
  }

  if (loading || !showTerms) {
    return null;
  }

  return (
    <Dialog open={showTerms} onOpenChange={() => {}}>
      <DialogContent 
        className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] border-2 border-[#dc2626]/30 text-white max-w-[90vw] sm:max-w-lg md:max-w-2xl max-h-[75vh] sm:max-h-[80vh] overflow-hidden !top-[50%] !translate-y-[-50%] !mt-0 !mb-0"
        style={{
          marginTop: 'max(1rem, env(safe-area-inset-top))',
          marginBottom: 'max(1rem, env(safe-area-inset-bottom))',
          maxHeight: 'calc(100vh - 2rem)',
        }}
        hideCloseButton
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/5 via-transparent to-[#dc2626]/5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626]" />
        
        {/* Content Container with proper padding */}
        <div className="relative z-10 p-1 sm:p-2">
        
        <DialogHeader className="relative z-10 pb-4 pt-2">
          <DialogTitle className="text-lg sm:text-2xl font-bold flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center shadow-lg shadow-[#dc2626]/30">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <div className="text-white">Terms of Service</div>
              <div className="text-xs sm:text-sm text-white/60 font-normal">Last Updated: December 8, 2024</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative z-10 space-y-4 sm:space-y-5 px-1">
          {/* Warning Banner - Mobile Optimized */}
          <div className="bg-gradient-to-r from-[#dc2626]/10 to-[#ef4444]/10 border border-[#dc2626]/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#dc2626]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-[#dc2626]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Important Notice</h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  By using Magma Cheats, you acknowledge that gaming cheats may violate game terms of service. 
                  Use at your own risk and responsibility.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content - Better Sized */}
          <ScrollArea className="h-36 sm:h-44 md:h-52 pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed">
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#dc2626]" />
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing and using Magma Cheats ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">2. Use License</h4>
                <p>
                  Permission is granted to temporarily download one copy of Magma Cheats products for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-white/70 ml-2">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained in the products</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">3. Disclaimer</h4>
                <p>
                  The materials on Magma Cheats are provided on an 'as is' basis. Magma Cheats makes no warranties, expressed or implied, 
                  and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, 
                  fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">4. Gaming Risks</h4>
                <p>
                  You acknowledge that using cheats, hacks, or modifications in online games may result in:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-white/70 ml-2">
                  <li>Account suspension or permanent bans</li>
                  <li>Loss of game progress, items, or achievements</li>
                  <li>Violation of game publisher terms of service</li>
                  <li>Potential legal consequences in some jurisdictions</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">5. Refund Policy</h4>
                <p>
                  All sales are final. Due to the digital nature of our products, refunds are only provided in cases of technical issues 
                  that cannot be resolved within 24 hours of purchase. Refund requests must be submitted within 7 days of purchase.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">6. Privacy & Data</h4>
                <p>
                  We collect minimal data necessary for service operation. Your privacy is important to us. 
                  We do not sell or share personal information with third parties except as required by law.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Agreement Section - Better Spaced */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4 mt-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Agreement Required</h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  By clicking "I Agree to Terms of Service" below, you confirm that you have read, 
                  understood, and agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="relative z-10 pt-4 sm:pt-5 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <Button
            onClick={handleAcceptTerms}
            className="w-full sm:flex-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#dc2626]/30 text-sm sm:text-base min-h-[44px]"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            I Agree to Terms of Service
          </Button>
        </DialogFooter>
        
        </div> {/* Close content container */}
      </DialogContent>
    </Dialog>
  );
}