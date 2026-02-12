"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { guideCategories, type Guide } from "@/lib/guides-data";
import { Gamepad2, Shield, Download, ChevronRight, Zap, Star, Sparkles, Rocket } from "lucide-react";

type ExplosionParticle = {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
};

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide>(guideCategories[0].guides[3]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<ExplosionParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const createParticles = () => {
    const now = Date.now();
    const newParticles: ExplosionParticle[] = Array.from({ length: 20 }, (_, i) => ({
      id: now + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      tx: Math.random() * 200 - 100,
      ty: Math.random() * 200 - 100,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  const handleGuideSelect = (guide: Guide) => {
    setSelectedGuide(guide);
    setCompletedSteps(new Set());
    createParticles();
  };

  const toggleStepCompletion = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = (completedSteps.size / selectedGuide.steps.length) * 100;

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <Header />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(37,99,235,0.03) 0%, rgba(10,10,10,0.0) 30%, rgba(10,10,10,1) 100%)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.04), transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 0% 100%, rgba(59,130,246,0.03), transparent 60%)" }} />
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06] transition-all duration-1000"
          style={{
            background: "radial-gradient(circle, #2563eb, transparent)",
            left: `${mousePosition.x - 300}px`,
            top: `${mousePosition.y - 300}px`,
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2563eb]/3 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3b82f6]/3 rounded-full blur-[160px]" />
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-2 h-2 bg-[#2563eb] rounded-full pointer-events-none animate-particle-explosion"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            ["--tx" as any]: `${particle.tx}px`,
            ["--ty" as any]: `${particle.ty}px`,
          }}
        />
      ))}

      <div className="pt-24 pb-16 relative" ref={containerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center relative">
            <div className="inline-flex items-center gap-2 bg-[#111111]/80 border border-[#2563eb]/30 rounded-full px-6 py-2 mb-4 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-[#2563eb] animate-pulse" />
              <span className="text-white/90 text-sm font-semibold">Ultimate Gaming Guides</span>
              <Sparkles className="w-4 h-4 text-[#2563eb] animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#2563eb] to-[#3b82f6] mb-2 animate-gradient">
              Level Up Your Game
            </h1>
            <p className="text-white/60 text-lg">Master every aspect with our comprehensive guides</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-gradient-to-br from-[#111111]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-[#1a1a1a] rounded-2xl p-6 sticky top-24 shadow-2xl shadow-[#2563eb]/10">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Progress</span>
                    <span className="text-[#2563eb] font-bold text-sm">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-500 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                    </div>
                  </div>
                </div>

                {guideCategories.map((category, catIndex) => (
                  <div key={catIndex} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 text-[#2563eb] text-sm font-bold mb-3 group">
                      {category.icon === "gamepad" ? (
                        <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="group-hover:text-white transition-colors">{category.name}</span>
                      <div className="ml-auto w-2 h-2 bg-[#2563eb] rounded-full animate-pulse" />
                    </div>
                    <nav className="space-y-2">
                      {category.guides.map((guide) => {
                        const isSelected = selectedGuide.id === guide.id;
                        return (
                          <button
                            key={guide.id}
                            onClick={() => handleGuideSelect(guide)}
                            className={`group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 relative overflow-hidden ${
                              isSelected
                                ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-bold shadow-lg shadow-[#2563eb]/50 scale-105"
                                : "text-white/70 hover:bg-[#1a1a1a] hover:text-white hover:scale-105"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            )}
                            <div className="relative flex items-center justify-between">
                              <span>{guide.game}</span>
                              {isSelected && <Zap className="w-4 h-4 animate-pulse" />}
                            </div>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}

                <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#2563eb]/20">
                      <div className="text-2xl font-bold text-[#2563eb]">{completedSteps.size}</div>
                      <div className="text-xs text-white/50">Completed</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#2563eb]/20">
                      <div className="text-2xl font-bold text-[#2563eb]">{selectedGuide.steps.length}</div>
                      <div className="text-xs text-white/50">Total Steps</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="relative bg-gradient-to-r from-[#111111]/90 to-[#0a0a0a]/90 backdrop-blur-xl border border-[#1a1a1a] rounded-2xl p-8 mb-8 overflow-hidden shadow-2xl shadow-[#2563eb]/20 group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/10 via-transparent to-[#2563eb]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2563eb]/20 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-[#2563eb]/20 border border-[#2563eb]/40 rounded-full px-4 py-1.5 mb-4">
                    <Star className="w-4 h-4 text-[#2563eb]" />
                    <span className="text-[#2563eb] text-xs font-bold uppercase tracking-wider">Featured Guide</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#2563eb] transition-all duration-300">
                    {selectedGuide.title}
                  </h1>
                  <p className="text-white/70 text-lg">{selectedGuide.subtitle}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#111111]/90 to-[#0a0a0a]/90 backdrop-blur-xl border border-[#2563eb]/30 rounded-2xl p-6 mb-8 relative overflow-hidden group hover:border-[#2563eb]/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#2563eb]/50 group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[#2563eb] font-bold text-lg mb-1 flex items-center gap-2">
                      Prerequisites Installation
                      <Rocket className="w-5 h-5 animate-bounce" />
                    </h2>
                    <p className="text-white/60 text-sm">Complete these steps in order before proceeding to cheat setup</p>
                  </div>
                  <div className="hidden md:block text-6xl opacity-10">??</div>
                </div>
              </div>

              <div className="space-y-6">
                {selectedGuide.steps.map((step, index) => {
                  const isCompleted = completedSteps.has(index);
                  const isHovered = hoveredStep === index;

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                      className={`relative bg-gradient-to-br from-[#111111]/90 to-[#0a0a0a]/90 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-500 group ${
                        isCompleted
                          ? "border-[#2563eb]/60 shadow-lg shadow-[#2563eb]/20 scale-[1.02]"
                          : isHovered
                          ? "border-[#2563eb]/60 shadow-2xl shadow-[#2563eb]/30 scale-[1.02]"
                          : "border-[#1a1a1a] hover:border-[#2563eb]/30"
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/10 to-transparent rounded-2xl animate-pulse" />
                      )}
                      {isHovered && !isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 via-[#2563eb]/0 to-transparent rounded-2xl" />
                      )}

                      <div className="relative flex items-start gap-5 mb-6">
                        <button
                          onClick={() => toggleStepCompletion(index)}
                          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-lg shadow-[#2563eb]/50 rotate-[360deg]"
                              : "bg-gradient-to-br from-[#2563eb] to-[#3b82f6] shadow-lg shadow-[#2563eb]/50 hover:scale-110 hover:rotate-12"
                          }`}
                        >
                          {isCompleted ? <span className="text-2xl">?</span> : <span>{index + 1}</span>}
                          {!isCompleted && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-2xl" />
                          )}
                        </button>

                        <div className="flex-1">
                          <h3 className="text-white font-bold text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#2563eb] transition-all">
                            {step.title}
                          </h3>
                          <p className="text-white/60">{step.description}</p>
                        </div>

                        {isCompleted && (
                          <div className="flex items-center gap-2 bg-[#2563eb]/20 border border-[#2563eb]/40 rounded-full px-4 py-2">
                            <span className="text-[#2563eb] text-sm font-bold">Complete</span>
                            <Star className="w-4 h-4 text-[#2563eb]" />
                          </div>
                        )}
                      </div>

                      <div className="ml-[76px]">
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#1a1a1a] rounded-xl p-6 mb-6 group-hover:border-[#2563eb]/20 transition-colors">
                          <ol className="space-y-3">
                            {step.instructions.map((instruction, instIndex) => (
                              <li
                                key={instIndex}
                                className="flex items-start gap-3 text-white/80 group/item hover:text-white transition-colors"
                              >
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2563eb]/20 text-[#2563eb] text-xs font-bold flex-shrink-0 group-hover/item:bg-[#2563eb] group-hover/item:text-white transition-all">
                                  {instIndex + 1}
                                </span>
                                <span className="leading-relaxed">{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {step.downloadUrl && (
                          <a
                            href={step.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn inline-flex items-center gap-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white px-6 py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-[#2563eb]/50 hover:scale-105 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer" />
                            <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                            <span className="relative">{step.downloadLabel}</span>
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 relative bg-gradient-to-r from-[#2563eb]/10 via-[#2563eb]/5 to-transparent backdrop-blur-xl border border-[#2563eb]/30 rounded-2xl p-8 overflow-hidden group hover:border-[#2563eb]/60 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 text-9xl opacity-5 group-hover:opacity-10 transition-opacity">??</div>

                <div className="relative">
                  <h3 className="text-white font-black text-2xl mb-3 flex items-center gap-3">
                    Need Help?
                    <Sparkles className="w-6 h-6 text-[#2563eb] animate-pulse" />
                  </h3>
                  <p className="text-white/70 text-lg mb-6 max-w-2xl">
                    If you encounter any issues during setup, our support team is here to help you 24/7.
                  </p>
                  <a
                    href="https://discord.gg/skylinecheats"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#2563eb]/50 hover:scale-105 group/discord"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Join our Discord for support
                    <ChevronRight className="w-5 h-5 group-hover/discord:translate-x-2 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes particle-explosion {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 100px), var(--ty, -100px)) scale(0);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-particle-explosion {
          animation: particle-explosion 1s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  );
}
