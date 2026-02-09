"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Flame,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  Sparkles,
  Zap,
  Terminal,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [particles, setParticles] = useState<
    { left: string; top: string; animationDelay: string; animationDuration: string }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 16 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
      }))
    );
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        router.push("/mgmt-x9k2m7");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#2563eb]/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#3b82f6]/8 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#2563eb]/5 rounded-full blur-[80px] animate-float" />

        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(to right, #2563eb 1px, transparent 1px),
              linear-gradient(to bottom, #2563eb 1px, transparent 1px)
            `,
              backgroundSize: "60px 60px",
              animation: "grid-move 20s linear infinite",
            }}
          />
        </div>

        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#2563eb] rounded-full opacity-20 animate-float-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="relative w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom duration-700">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-glow" />
            <div className="relative p-5 bg-gradient-to-br from-[#2563eb] to-[#b91c1c] rounded-2xl shadow-2xl shadow-blue-500/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Flame className="w-12 h-12 text-white animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text animate-gradient-x">
                Staff Login
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-full">
              <Shield className="w-3.5 h-3.5 text-[#2563eb]" />
              <span className="text-xs font-semibold text-[#2563eb] uppercase tracking-wider">Team Access Portal</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 rounded-3xl opacity-30 blur-xl bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] animate-gradient-rotate" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine" />

          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb]/20 to-[#b91c1c]/20 border border-[#2563eb]/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2563eb]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Secure Team Access</h2>
              </div>
              <p className="text-white/50 text-sm">Sign in with your staff credentials to continue</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 animate-in fade-in shake mb-6">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-0.5">Login Failed</p>
                  <p className="text-xs text-blue-400/80">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80 uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-[#2563eb]" />
                  Email Address
                </label>
                <div className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-xl blur-xl opacity-0 transition-opacity duration-500 ${
                      emailFocused ? "opacity-30" : ""
                    }`}
                  />
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-[#2563eb] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-[#111111] border border-[#1a1a1a] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all font-medium"
                    />
                    {email.includes("@") && email.includes(".") && !loading && !error && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-in zoom-in" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80 uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-[#2563eb]" />
                  Password
                </label>
                <div className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-xl blur-xl opacity-0 transition-opacity duration-500 ${
                      passwordFocused ? "opacity-30" : ""
                    }`}
                  />
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-[#2563eb] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-[#111111] border border-[#1a1a1a] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#2563eb] transition-all hover:scale-110 active:scale-95"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="group/btn relative w-full py-4 rounded-xl overflow-hidden font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] animate-gradient-x" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-3 text-base">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      <span>Sign In</span>
                      <Zap className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] opacity-50 group-hover/btn:opacity-75 transition-opacity" />
              </button>

              <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <Terminal className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-400/80">Tip: Use your staff credentials provided by your administrator</p>
              </div>

              <div className="text-center pt-2 border-t border-[#1a1a1a]">
                <p className="text-white/40 text-sm mb-3">Are you an administrator?</p>
                <Link
                  href="/mgmt-x9k2m7/login"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-[#1a1a1a] hover:border-[#2563eb]/40 rounded-lg text-[#2563eb] hover:text-[#3b82f6] text-sm font-semibold transition-all hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  <span>Admin Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-center text-white/30 text-xs mt-5">Don't have access? Contact your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gradient-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(30px, 30px);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 10s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-particle {
          animation: float-particle 15s linear infinite;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .animate-in {
          animation: fade-in 0.7s ease-out forwards;
        }

        .fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.7s ease-out;
        }

        .shake {
          animation: shake 0.3s ease-in-out;
        }

        .zoom-in {
          animation: zoom-in 0.3s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </main>
  );
}
