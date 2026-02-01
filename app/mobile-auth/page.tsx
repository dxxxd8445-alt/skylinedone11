"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, UserCircle, Eye, EyeOff, ArrowLeft, CheckCircle, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";

function MobileAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup" || modeParam === "signin") {
      setMode(modeParam);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !success) {
      router.push("/store");
    }
  }, [user, success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;
      if (mode === "signin") {
        result = await signIn(email, password, false);
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        if (username.length < 3) {
          setError("Username must be at least 3 characters");
          setIsLoading(false);
          return;
        }
        result = await signUp(email, password, username);
      }

      if (result.success) {
        setSuccess(true);
        // Redirect to store after 3 seconds
        setTimeout(() => {
          router.push("/store");
        }, 3000);
      } else {
        setError(result.error || `${mode === "signin" ? "Sign in" : "Sign up"} failed`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ef4444]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 text-center max-w-md w-full">
          {/* Success icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            {mode === "signin" ? "Welcome Back!" : "Account Created!"}
          </h1>
          <p className="text-white/70 text-lg mb-8">
            {mode === "signin" 
              ? "Successfully signed in. Thanks for coming back!" 
              : "Successfully signed up. Thanks for joining us!"}
          </p>

          {/* Continue button */}
          <Link
            href="/store"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-[#dc2626]/30"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue to Shop
          </Link>

          <p className="text-white/50 text-sm mt-4">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/magma-logo.png"
            alt="Magma Cheats"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
        
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mode toggle */}
          <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-8 border border-[#262626]">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                mode === "signin"
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-white/60">
              {mode === "signin" 
                ? "Sign in to access your account and continue shopping" 
                : "Join Magma Cheats and start your gaming journey"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username (Sign Up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#262626] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#262626] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-[#1a1a1a] border border-[#262626] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-white/40 text-xs mt-2">Must be at least 6 characters</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-[#dc2626]/30"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 text-center space-y-4">
            {mode === "signin" && (
              <Link
                href="/forgot-password"
                className="block text-[#dc2626] hover:text-[#ef4444] text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            )}
            
            <div className="flex items-center justify-center gap-4 text-xs text-white/40">
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <span>•</span>
              <a href="https://discord.gg/magmacheats" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin" />
    </div>
  );
}

export default function MobileAuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MobileAuthContent />
    </Suspense>
  );
}