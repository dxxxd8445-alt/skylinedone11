"use client";

import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Users, 
  Headphones, 
  Zap, 
  ArrowRight, 
  ExternalLink,
  Clock,
  Shield,
  Heart,
  Star,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";

export default function DiscordPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Get help anytime with our active community and support team",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of users sharing tips, tricks, and experiences",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Instant Updates",
      description: "Be the first to know about new releases and important announcements",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Exclusive Access",
      description: "Get access to beta features and exclusive content for members",
      color: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    "Direct support from our team",
    "Community-driven troubleshooting",
    "Early access to new products",
    "Exclusive Discord-only promotions",
    "Real-time status updates",
    "Connect with other users"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 lg:py-16">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] shadow-2xl shadow-[#dc2626]/30">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Join Our{" "}
              <span className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] bg-clip-text text-transparent">
                Discord
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with our community, get instant support, and stay updated with the latest from Magma Cheats
            </p>

            {/* Main CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="https://discord.gg/magmacheats"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-[#dc2626]/30 hover:shadow-[#dc2626]/50 min-w-[280px] justify-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                <MessageCircle className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Join Discord Server</span>
                <ExternalLink className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Users className="w-4 h-4" />
                <span>10,000+ Members</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
                <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all h-full">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 w-fit group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="relative group mb-16">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-[#dc2626]/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 rounded-full text-[#dc2626] text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  Member Benefits
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Why Join Our Discord?
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Get more than just support - become part of our thriving community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#0a0a0a]/50 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all group/item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-2 rounded-lg bg-green-500/10 group-hover/item:bg-green-500/20 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-white/80 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}