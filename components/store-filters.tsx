"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { useI18n } from "@/lib/i18n-context";
import { formatMoney } from "@/lib/money";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: { duration: string; price: number; stock: number }[];
  features: { aimbot: string[]; esp: string[]; misc: string[] };
  requirements: { cpu: string; windows: string; cheatType: string; controller: boolean };
}

// Convert game name to slug
function gameToSlug(game: string): string {
  return game.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[:\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function StoreFilters({ products }: { products: Product[] }) {
  const { currency } = useCurrency();
  const { locale, t } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const games = useMemo(() => {
    const gameSet = new Set(products.map((p) => p.game).filter(Boolean));
    return Array.from(gameSet) as string[];
  }, [products]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Browse by category */}
      <p className="text-white/50 text-sm mb-4 text-center">
        {t("browse_by_category")}
      </p>
      <div className="relative mb-8">
        {/* Desktop View - Beautiful Horizontal Slider with Navigation */}
        <div className="hidden md:block">
          <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full flex items-center justify-center shadow-lg shadow-[#2563eb]/50 hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Slider Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* ALL ? Store */}
              <Link
                href="/store"
                className="relative flex-shrink-0 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden group/btn bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-xl shadow-[#2563eb]/40 scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="relative flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>ALL GAMES</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full" />
              </Link>

              {/* Game ? Category pages */}
              {games.map((game) => (
                <Link
                  key={game}
                  href={`/store/${gameToSlug(game)}`}
                  className="relative flex-shrink-0 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden group/btn bg-[#111111] text-white/70 hover:bg-[#1a1a1a] border-2 border-[#2563eb]/30 hover:border-[#2563eb]/60 hover:scale-105"
                >
                  <span className="relative">{game === "Universal" ? "HWID SPOOFERS" : game.toUpperCase()}</span>
                </Link>
              ))}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full flex items-center justify-center shadow-lg shadow-[#2563eb]/50 hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Product Count */}
          <div className="text-center mt-4">
            <p className="text-white/50 text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
              <span className="text-white font-semibold">{products.length}</span> {products.length === 1 ? t("product") : t("products")}
            </p>
          </div>
        </div>

        {/* Mobile View - Compact Swipeable Slider */}
        <div className="md:hidden">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide scroll-smooth">
              <Link
                href="/store"
                className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-lg shadow-[#2563eb]/40"
              >
                ALL
              </Link>
              {games.map((game) => (
                <Link
                  key={game}
                  href={`/store/${gameToSlug(game)}`}
                  className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-[#1a1a1a] text-white/80 border-2 border-[#333] active:bg-[#262626]"
                >
                  {game === "Universal" ? "SPOOFER" : game.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Swipe Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-[#2563eb] animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-[#2563eb]/50 animate-pulse delay-75" />
              <div className="w-1 h-1 rounded-full bg-[#2563eb]/30 animate-pulse delay-150" />
            </div>
            <p className="text-white/40 text-xs">{t("swipe_to_browse")}</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${gameToSlug(product.game)}/${product.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#2563eb]/40 hover:border-[#2563eb] transition-all duration-300 hover:shadow-xl hover:shadow-[#2563eb]/30 active:scale-[0.98] sm:hover:-translate-y-1 bg-gradient-to-br from-[#1a0808] to-[#0a0a0a]"
            >
              {/* Red gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/20 via-[#0a0a0a] to-[#0a0a0a]" />
              
              {/* Product Image */}
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[30%] contrast-[1.1]"
              />
              
              {/* Red overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 via-transparent to-[#2563eb]/5" />
              
              {/* Bottom glow bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2563eb] to-transparent" />
              
              {/* Game Logo/Name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-[#2563eb] font-bold text-xs sm:text-lg text-center tracking-wider uppercase drop-shadow-lg"
                    style={{ textShadow: "0 0 20px rgba(37,99,235,0.5)" }}>
                  {product.game === "Universal" ? "HWID SPOOFER" : product.game.toUpperCase()}
                </h3>
                <p className="text-white/90 text-xs text-center mt-1 sm:hidden font-semibold">
                  {t("from")} {formatMoney({ amountUsd: product.pricing[0]?.price || 0, currency, locale })}
                </p>
              </div>

              {/* Status indicator */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                {product.status === "active" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-white/80 sm:hidden">LIVE</span>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                  </div>
                ) : product.status === "maintenance" ? (
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-yellow-500/40">
                    <span className="text-[10px] sm:text-xs font-bold text-yellow-400">🔧 UPDATING</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-blue-500/40">
                    <span className="text-[10px] sm:text-xs font-bold text-blue-400">⚠️ OFFLINE</span>
                  </div>
                )}
              </div>

              {/* Hover overlay - Desktop only */}
              <div className="absolute inset-0 bg-[#0a0a0a]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex flex-col items-center justify-center p-4">
                <h4 className="text-white font-bold text-lg mb-1">{product.name}</h4>
                <p className="text-white/60 text-sm mb-1">{product.game}</p>
                <p className="text-[#2563eb] text-xl font-bold mb-4">{t("from")} {formatMoney({ amountUsd: product.pricing[0]?.price || 0, currency, locale })}</p>
                <span className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                  {t("view_details")}
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111111] border border-[#1a1a1a] rounded-2xl">
          <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-2">{t("no_products_yet")}</p>
            <p className="text-white/30 text-sm">{t("add_products_admin")}</p>
            <Link href="/store" className="inline-block mt-4 text-[#2563eb] hover:text-[#3b82f6] text-sm font-medium">
              ? {t("back_to_store")}
            </Link>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
