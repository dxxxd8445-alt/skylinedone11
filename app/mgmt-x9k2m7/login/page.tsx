"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  Sparkles,
  Zap,
  Terminal,
  KeyRound,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";
import { verifyAdminPassword } from "@/lib/admin-auth";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [particles, setParticles] = useState<
    { left: string; top: string; animationDelay: string; animationDuration: string }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
      }))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        router.push("/mgmt-x9k2m7");
        router.refresh();
      } else {
        setError(result.error || "Invalid password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#dc2626]/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ef4444]/8 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#dc2626]/5 rounded-full blur-[80px] animate-float" />

        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(to right, #dc2626 1px, transparent 1px),
              linear-gradient(to bottom, #dc2626 1px, transparent 1px)
            `,
              backgroundSize: "60px 60px",
              animation: "grid-move 20s linear infinite",
            }}
          />
        </div>

        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#dc2626] rounded-full opacity-20 animate-float-particle"
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

      <div className="relative w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom duration-700">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-glow" />

            <div className="relative p-5 bg-gradient-to-br from-[#dc2626] to-[#b91c1c] rounded-2xl shadow-2xl shadow-red-500/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Flame className="w-12 h-12 text-white animate-pulse" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text animate-gradient-x">
                Magma Admin
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-full">
              <Shield className="w-3.5 h-3.5 text-[#dc2626]" />
              <span className="text-xs font-semibold text-[#dc2626] uppercase tracking-wider">Secure Access Portal</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 rounded-3xl opacity-30 blur-xl bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] animate-gradient-rotate" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shine" />

          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626]/20 to-[#b91c1c]/20 border border-[#dc2626]/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#dc2626]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Secure Access</h2>
              </div>
              <p className="text-white/50 text-sm">Enter your credentials to access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-in fade-in shake">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-0.5">Authentication Failed</p>
                    <p className="text-xs text-red-400/80">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-semibold text-white/80 uppercase tracking-wider"
                >
                  <KeyRound className="w-4 h-4 text-[#dc2626]" />
                  Admin Password
                </label>
                <div className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-xl blur-xl opacity-0 transition-opacity duration-500 ${
                      isFocused ? "opacity-30" : ""
                    }`}
                  />

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-[#dc2626] transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="••••••••••••"
                      className="w-full pl-12 pr-14 py-4 bg-[#111111] border border-[#1a1a1a] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all font-medium"
                      required
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#dc2626] transition-all hover:scale-110 active:scale-95"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>

                    {password.length >= 8 && !loading && !error && (
                      <CheckCircle2 className="absolute right-14 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-in zoom-in" />
                    )}
                  </div>

                  {password && (
                    <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          password.length < 6
                            ? "w-1/3 bg-gradient-to-r from-red-500 to-red-600"
                            : password.length < 10
                            ? "w-2/3 bg-gradient-to-r from-yellow-500 to-yellow-600"
                            : "w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="group/btn relative w-full py-4 rounded-xl overflow-hidden font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] animate-gradient-x" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                <span className="relative flex items-center justify-center gap-3 text-base">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating...</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      <span>Access Admin Panel</span>
                      <Zap className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </>
                  )}
                </span>

                <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-[#dc2626] to-[#ef4444] opacity-50 group-hover/btn:opacity-75 transition-opacity" />
              </button>

              <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <Terminal className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-400/80">Tip: Use your master admin key for secure access</p>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#1a1a1a] space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "256-bit SSL" },
                  { icon: Lock, label: "Encrypted" },
                  { icon: Zap, label: "2FA Ready" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group/feature flex flex-col items-center gap-2 p-3 bg-[#111111] border border-[#1a1a1a] rounded-lg hover:border-[#dc2626]/30 transition-all hover:scale-105"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center group-hover/feature:scale-110 transition-transform">
                      <feature.icon className="w-4 h-4 text-[#dc2626]" />
                    </div>
                    <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{feature.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-400/80 leading-relaxed">
                  This area is restricted to authorized personnel only. All access attempts are monitored and logged for
                  security purposes.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/40 text-sm mb-3">Not an admin?</p>
              <Link
                href="/staff/login"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-[#1a1a1a] hover:border-[#dc2626]/40 rounded-lg text-[#dc2626] hover:text-[#ef4444] text-sm font-semibold transition-all hover:scale-105"
              >
                <Users className="w-4 h-4" />
                <span>Staff Login Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0a0a]/50 backdrop-blur-sm border border-[#1a1a1a] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40">
              System Status: <span className="text-emerald-400 font-semibold">Operational</span>
            </span>
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
    </div>
  );
}
