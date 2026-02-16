"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, ArrowLeft, Mail, CheckCircle, Smartphone, Monitor } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = email.trim().toLowerCase();
    if (!e2) {
      toast({ title: "Email required", description: "Enter your account email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/store-auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Could not send reset email.", variant: "destructive" });
        return;
      }
      setSent(true);
      toast({
        title: "Check your email",
        description: "If an account exists, we sent a reset link.",
        className: "border-green-500/20 bg-green-500/10",
      });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6b7280]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#9ca3af]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header - Mobile friendly */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#1a1a1a] lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">Ring-0</span>
        </Link>
        
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Desktop back link */}
          <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>

          {/* Main card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6b7280]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative rounded-2xl bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6b7280] to-[#9ca3af] flex items-center justify-center shadow-lg shadow-[#6b7280]/30">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-white/60">
                  No worries! Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {sent ? (
                <div className="space-y-6">
                  {/* Success message */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">Check Your Email</h2>
                    <p className="text-white/70 mb-6">
                      If an account exists for <strong className="text-white">{email}</strong>, you&apos;ll receive a password reset link shortly.
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
                      <Smartphone className="w-5 h-5 text-[#6b7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Mobile Users</p>
                        <p className="text-white/60 text-sm">Check your email app and tap the reset link</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a]">
                      <Monitor className="w-5 h-5 text-[#6b7280] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Desktop Users</p>
                        <p className="text-white/60 text-sm">Click the reset link in your email to continue</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional help */}
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-yellow-200 text-sm">
                      <strong>Don&apos;t see the email?</strong> Check your spam folder or try again with a different email address.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setSent(false)}
                      variant="outline"
                      className="w-full border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
                    >
                      Try Different Email
                    </Button>
                    <Link href="/">
                      <Button className="w-full bg-gradient-to-r from-[#6b7280] to-[#9ca3af] hover:from-[#9ca3af] hover:to-[#6b7280] text-white shadow-lg shadow-[#6b7280]/30">
                        Return to Store
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email input */}
                  <div>
                    <Label htmlFor="email" className="text-white font-medium mb-2 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="pl-12 pr-4 py-4 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-white/40 focus:border-[#6b7280] focus:ring-2 focus:ring-[#6b7280]/20 transition-all h-12"
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      Enter the email address associated with your account
                    </p>
                  </div>

                  {/* Submit button */}
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-4 bg-gradient-to-r from-[#6b7280] to-[#9ca3af] hover:from-[#9ca3af] hover:to-[#6b7280] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-[#6b7280]/30 h-12"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Reset Link...
                      </div>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  {/* Footer links */}
                  <div className="text-center space-y-3">
                    <p className="text-white/50 text-sm">
                      Remember your password?{" "}
                      <Link href="/" className="text-[#6b7280] hover:text-[#9ca3af] font-medium transition-colors">
                        Sign in instead
                      </Link>
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                      <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
                      <span>•</span>
                      <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
                      <span>•</span>
                      <a href="https://discord.gg/ring-0" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Support</a>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
