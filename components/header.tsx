"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Store,
  BarChart3,
  BookOpen,
  Heart,
  Shield,
  X,
  Menu,
  Home,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { searchProducts } from "@/lib/supabase/data";
import { AuthDropdown } from "@/components/auth-dropdown";
import { useAuth } from "@/lib/auth-context";
import { MobileAuth } from "@/components/mobile-auth";
import { useCart } from "@/lib/cart-context";
import { CartDropdown } from "@/components/cart-dropdown";
import { CartCounter } from "@/components/cart-counter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/currency-context";
import { useI18n, type SupportedLanguage } from "@/lib/i18n-context";
import type { SupportedCurrency } from "@/lib/money";

export function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Always call hooks - never conditionally
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useI18n();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (slug: string) => {
    setSearchQuery("");
    setShowResults(false);
    setMobileMenuOpen(false);
    router.push(`/store/${slug}`);
  };

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { icon: null, label: "HOME", href: "/", isLogo: true },
    { icon: Home, label: "HOME", href: "/" },
    { icon: Store, label: t("nav_store"), href: "/store" },
    { icon: BarChart3, label: t("nav_status"), href: "/status" },
    { icon: BookOpen, label: t("nav_guides"), href: "/guides" },
    { icon: Heart, label: t("nav_reviews"), href: "/reviews" },
    {
      icon: Shield,
      label: "DISCORD",
      href: "/discord",
      external: false,
    },
  ];

  const currencyOptions: { code: SupportedCurrency; label: string }[] = [
    { code: "USD", label: "USD" },
    { code: "EUR", label: "EUR" },
    { code: "GBP", label: "GBP" },
    { code: "CAD", label: "CAD" },
    { code: "AUD", label: "AUD" },
    { code: "NZD", label: "NZD" },
    { code: "JPY", label: "JPY" },
    { code: "KRW", label: "KRW" },
    { code: "CNY", label: "CNY" },
    { code: "HKD", label: "HKD" },
    { code: "SGD", label: "SGD" },
    { code: "INR", label: "INR" },
    { code: "BRL", label: "BRL" },
    { code: "MXN", label: "MXN" },
    { code: "ZAR", label: "ZAR" },
    { code: "SEK", label: "SEK" },
    { code: "NOK", label: "NOK" },
    { code: "DKK", label: "DKK" },
    { code: "CHF", label: "CHF" },
    { code: "PLN", label: "PLN" },
    { code: "CZK", label: "CZK" },
    { code: "HUF", label: "HUF" },
    { code: "RON", label: "RON" },
    { code: "TRY", label: "TRY" },
    { code: "ILS", label: "ILS" },
    { code: "AED", label: "AED" },
    { code: "SAR", label: "SAR" },
  ];

  const languageOptions: { code: SupportedLanguage; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "fr", label: "FR" },
    { code: "de", label: "DE" },
    { code: "it", label: "IT" },
    { code: "pt", label: "PT" },
    { code: "nl", label: "NL" },
    { code: "pl", label: "PL" },
    { code: "tr", label: "TR" },
    { code: "ru", label: "RU" },
    { code: "ar", label: "AR" },
    { code: "hi", label: "HI" },
    { code: "ja", label: "JA" },
    { code: "ko", label: "KO" },
    { code: "zh", label: "ZH" },
  ];

  const currencyMeta: Record<SupportedCurrency, { symbol: string; flagUrl: string }> = {
    USD: { symbol: "$", flagUrl: "https://flagcdn.com/us.svg" },
    EUR: { symbol: "•", flagUrl: "https://flagcdn.com/eu.svg" },
    GBP: { symbol: "•", flagUrl: "https://flagcdn.com/gb.svg" },
    CAD: { symbol: "C$", flagUrl: "https://flagcdn.com/ca.svg" },
    AUD: { symbol: "A$", flagUrl: "https://flagcdn.com/au.svg" },
    NZD: { symbol: "NZ$", flagUrl: "https://flagcdn.com/nz.svg" },
    JPY: { symbol: "•", flagUrl: "https://flagcdn.com/jp.svg" },
    KRW: { symbol: "?", flagUrl: "https://flagcdn.com/kr.svg" },
    CNY: { symbol: "•", flagUrl: "https://flagcdn.com/cn.svg" },
    HKD: { symbol: "HK$", flagUrl: "https://flagcdn.com/hk.svg" },
    SGD: { symbol: "S$", flagUrl: "https://flagcdn.com/sg.svg" },
    INR: { symbol: "?", flagUrl: "https://flagcdn.com/in.svg" },
    BRL: { symbol: "R$", flagUrl: "https://flagcdn.com/br.svg" },
    MXN: { symbol: "MX$", flagUrl: "https://flagcdn.com/mx.svg" },
    ZAR: { symbol: "R", flagUrl: "https://flagcdn.com/za.svg" },
    SEK: { symbol: "kr", flagUrl: "https://flagcdn.com/se.svg" },
    NOK: { symbol: "kr", flagUrl: "https://flagcdn.com/no.svg" },
    DKK: { symbol: "kr", flagUrl: "https://flagcdn.com/dk.svg" },
    CHF: { symbol: "CHF", flagUrl: "https://flagcdn.com/ch.svg" },
    PLN: { symbol: "zl", flagUrl: "https://flagcdn.com/pl.svg" },
    CZK: { symbol: "Kc", flagUrl: "https://flagcdn.com/cz.svg" },
    HUF: { symbol: "Ft", flagUrl: "https://flagcdn.com/hu.svg" },
    RON: { symbol: "lei", flagUrl: "https://flagcdn.com/ro.svg" },
    TRY: { symbol: "?", flagUrl: "https://flagcdn.com/tr.svg" },
    ILS: { symbol: "?", flagUrl: "https://flagcdn.com/il.svg" },
    AED: { symbol: "?.?", flagUrl: "https://flagcdn.com/ae.svg" },
    SAR: { symbol: "?", flagUrl: "https://flagcdn.com/sa.svg" },
  };

  const languageMeta: Record<SupportedLanguage, { label: string; flagUrl: string }> = {
    en: { label: "English", flagUrl: "https://flagcdn.com/us.svg" },
    es: { label: "Espa•ol", flagUrl: "https://flagcdn.com/es.svg" },
    fr: { label: "Fran•ais", flagUrl: "https://flagcdn.com/fr.svg" },
    de: { label: "Deutsch", flagUrl: "https://flagcdn.com/de.svg" },
    it: { label: "Italiano", flagUrl: "https://flagcdn.com/it.svg" },
    pt: { label: "Portugu•s", flagUrl: "https://flagcdn.com/pt.svg" },
    nl: { label: "Nederlands", flagUrl: "https://flagcdn.com/nl.svg" },
    pl: { label: "Polski", flagUrl: "https://flagcdn.com/pl.svg" },
    tr: { label: "T•rk•e", flagUrl: "https://flagcdn.com/tr.svg" },
    ru: { label: "???????", flagUrl: "https://flagcdn.com/ru.svg" },
    ar: { label: "???????", flagUrl: "https://flagcdn.com/sa.svg" },
    hi: { label: "??????", flagUrl: "https://flagcdn.com/in.svg" },
    ja: { label: "???", flagUrl: "https://flagcdn.com/jp.svg" },
    ko: { label: "???", flagUrl: "https://flagcdn.com/kr.svg" },
    zh: { label: "??", flagUrl: "https://flagcdn.com/cn.svg" },
  };

  return (
    <header className="fixed left-0 right-0 z-[9998] bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]" style={{ top: 'var(--announcement-height, 0px)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/content-removebg-preview.png"
                alt="Skyline Cheats"
                width={600}
                height={160}
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(37,99,235,0.6)]"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center max-w-2xl">
            {navItems.filter(item => !item.isLogo && item.label !== "HOME").map((item, i) => (
              <div key={i} className="relative group">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition-all duration-300 py-2 px-2.5 rounded-lg hover:bg-white/5"
                  >
                    {item.icon && <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Animated underline */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-300 group-hover:w-full rounded-full" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2563eb]/0 to-[#3b82f6]/0 group-hover:from-[#2563eb]/10 group-hover:to-[#3b82f6]/10 transition-all duration-300 -z-10" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold transition-all duration-300 py-2 px-2.5 rounded-lg hover:bg-white/5"
                  >
                    {item.icon && <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Animated underline */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-300 group-hover:w-full rounded-full" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2563eb]/0 to-[#3b82f6]/0 group-hover:from-[#2563eb]/10 group-hover:to-[#3b82f6]/10 transition-all duration-300 -z-10" />
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mobile Auth Buttons - Always show on mobile, but change based on login status */}
            <div className="lg:hidden flex items-center gap-1.5 mr-2">
              {!user ? (
                // Not logged in - show Sign In and Sign Up
                <>
                  <Link
                    href="/mobile-auth?mode=signin"
                    className="flex items-center justify-center px-2.5 py-1.5 bg-[#262626] hover:bg-[#333333] text-white/90 hover:text-white text-xs font-medium rounded-md transition-all min-h-[32px] border border-[#333333] hover:border-[#2563eb]/30"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/mobile-auth?mode=signup"
                    className="flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white text-xs font-semibold rounded-md transition-all min-h-[32px] shadow-lg shadow-[#2563eb]/20"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                // Logged in - show Account button
                <Link
                  href="/account"
                  className="flex items-center justify-center px-2.5 py-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white text-xs font-semibold rounded-md transition-all min-h-[32px] shadow-lg shadow-[#2563eb]/20"
                >
                  My Account
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] transition-all duration-300 min-h-[44px] min-w-[44px] border border-[#262626] hover:border-[#2563eb]/30"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            {/* Desktop Search */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2563eb]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f]">
                <Search className="w-4 h-4 text-white/50 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white/80 placeholder:text-white/50 outline-none w-32 transition-all duration-300 focus:w-44"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Search Results */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-white/50 text-xs">
                              {product.game}
                            </p>
                          </div>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {product.status === "active"
                              ? "Undetected"
                              : "Updating"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-white/50 text-sm">{t("no_products_found")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-1.5">
              {mounted && (
                <div className="hidden lg:flex items-center gap-1.5" suppressHydrationWarning>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-9 px-2.5 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#2563eb]/30 transition-all duration-300 text-xs font-semibold min-h-[36px]"
                        aria-label="Currency"
                        type="button"
                        suppressHydrationWarning
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <img
                            src={currencyMeta[currency].flagUrl}
                            alt={currency}
                            className="w-3.5 h-3.5 rounded-[2px]"
                            loading="lazy"
                          />
                          <span className="text-white/90">{currencyMeta[currency].symbol}</span>
                          <span>{currency}</span>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-[#111111] border border-[#1a1a1a] text-white">
                      <DropdownMenuRadioGroup
                        value={currency}
                        onValueChange={(v) => setCurrency(v as SupportedCurrency)}
                      >
                      {currencyOptions.map((c) => (
                        <DropdownMenuRadioItem key={c.code} value={c.code} className="text-white/80">
                          <span className="inline-flex items-center gap-2">
                            <img
                              src={currencyMeta[c.code].flagUrl}
                              alt={c.code}
                              className="w-4 h-4 rounded-[2px]"
                              loading="lazy"
                            />
                            <span className="w-10 text-white/90">{currencyMeta[c.code].symbol}</span>
                            <span>{c.label}</span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-9 px-2.5 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#2563eb]/30 transition-all duration-300 text-xs font-semibold min-h-[36px]"
                      aria-label="Language"
                      type="button"
                      suppressHydrationWarning
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <img
                          src={languageMeta[language].flagUrl}
                          alt={language.toUpperCase()}
                          className="w-3.5 h-3.5 rounded-[2px]"
                          loading="lazy"
                        />
                        <span>{language.toUpperCase()}</span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#111111] border border-[#1a1a1a] text-white">
                    <DropdownMenuRadioGroup
                      value={language}
                      onValueChange={(v) => setLanguage(v as SupportedLanguage)}
                    >
                      {languageOptions.map((l) => (
                        <DropdownMenuRadioItem key={l.code} value={l.code} className="text-white/80">
                          <span className="inline-flex items-center gap-2">
                            <img
                              src={languageMeta[l.code].flagUrl}
                              alt={l.label}
                              className="w-4 h-4 rounded-[2px]"
                              loading="lazy"
                            />
                            <span className="w-10">{l.label}</span>
                            <span className="text-white/70 text-xs">{languageMeta[l.code].label}</span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              )}
              <CartDropdown />
              <AuthDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Optimized for Mobile UX */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden bg-[#0a0a0a]/98 backdrop-blur-md"
          style={{
            position: 'fixed',
            top: 'var(--announcement-height, 0px)',
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: '100vw',
            height: `calc(100vh - var(--announcement-height, 0px))`,
            zIndex: 9997, // Lower than search results (10000)
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Menu Content */}
          <div className="w-full h-full flex flex-col">
            {/* Menu Header - Compact */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]/90">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/content-removebg-preview.png"
                  alt="Skyline Cheats"
                  width={400}
                  height={107}
                  className="h-10 w-auto"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#262626] text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-all min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search Bar - Inside Menu */}
            <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/50">
              <div ref={searchRef} className="relative">
                <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2563eb]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f] border border-[#262626] focus-within:border-[#2563eb]/30">
                  <Search className="w-5 h-5 text-white/70 transition-colors duration-300 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-base text-white/90 placeholder:text-white/60 outline-none w-full min-w-0 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowResults(false);
                      }}
                      className="text-white/60 hover:text-white flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Mobile Search Results - Inside Menu */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden z-[10002] max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-[#1a1a1a]">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleResultClick(product.slug)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left active:bg-[#262626] min-h-[56px]"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0 border border-[#262626]">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate mb-1">
                                {product.name}
                              </p>
                              <p className="text-white/60 text-xs truncate">
                                {product.game}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                                product.status === "active"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                            >
                              {product.status === "active" ? "Live" : "Soon"}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Search className="w-8 h-8 text-white/30 mx-auto mb-2" />
                        <p className="text-white/50 text-sm font-medium">No results found</p>
                        <p className="text-white/30 text-xs mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions - Mobile Optimized */}
            <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/50">
              <div className="grid grid-cols-1 gap-3">
                {/* Cart/Auth - Clean Mobile Design */}
                <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#262626]">
                  <MobileAuth />
                </div>
              </div>
            </div>

            {/* Settings - Mobile Optimized with Fixed Dropdowns */}
            {mounted && (
              <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/30">
                <div className="grid grid-cols-2 gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#2563eb]/30 hover:bg-[#262626] transition-all text-sm font-semibold min-h-[44px]"
                        type="button"
                        aria-label="Currency"
                        suppressHydrationWarning
                      >
                        <span className="inline-flex items-center gap-2 justify-center">
                          <img
                            src={currencyMeta[currency].flagUrl}
                            alt={currency}
                            className="w-4 h-4 rounded-[2px]"
                            loading="lazy"
                          />
                          <span className="text-white/90">{currencyMeta[currency].symbol}</span>
                          <span>{currency}</span>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      className="w-56 bg-[#111111] border border-[#1a1a1a] text-white z-[10001] max-h-64 overflow-y-auto"
                      sideOffset={8}
                    >
                      <DropdownMenuRadioGroup
                        value={currency}
                        onValueChange={(v) => setCurrency(v as SupportedCurrency)}
                      >
                        {currencyOptions.map((c) => (
                          <DropdownMenuRadioItem 
                            key={c.code} 
                            value={c.code} 
                            className="text-white/80 min-h-[44px] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-3 w-full">
                              <img
                                src={currencyMeta[c.code].flagUrl}
                                alt={c.code}
                                className="w-5 h-5 rounded-[2px] flex-shrink-0"
                                loading="lazy"
                              />
                              <span className="w-8 text-white/90 font-medium flex-shrink-0">{currencyMeta[c.code].symbol}</span>
                              <span className="text-white font-medium">{c.label}</span>
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#2563eb]/30 hover:bg-[#262626] transition-all text-sm font-semibold min-h-[44px]"
                        type="button"
                        aria-label="Language"
                        suppressHydrationWarning
                      >
                        <span className="inline-flex items-center gap-2 justify-center">
                          <img
                            src={languageMeta[language].flagUrl}
                            alt={language.toUpperCase()}
                            className="w-4 h-4 rounded-[2px]"
                            loading="lazy"
                          />
                          <span>{language.toUpperCase()}</span>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-[#111111] border border-[#1a1a1a] text-white z-[10001] max-h-64 overflow-y-auto"
                      sideOffset={8}
                    >
                      <DropdownMenuRadioGroup
                        value={language}
                        onValueChange={(v) => setLanguage(v as SupportedLanguage)}
                      >
                        {languageOptions.map((l) => (
                          <DropdownMenuRadioItem 
                            key={l.code} 
                            value={l.code} 
                            className="text-white/80 min-h-[44px] hover:bg-[#1a1a1a] focus:bg-[#1a1a1a] cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-3 w-full">
                              <img
                                src={languageMeta[l.code].flagUrl}
                                alt={l.label}
                                className="w-5 h-5 rounded-[2px] flex-shrink-0"
                                loading="lazy"
                              />
                              <span className="w-8 text-white font-medium flex-shrink-0">{l.code.toUpperCase()}</span>
                              <span className="text-white/70 text-sm">{languageMeta[l.code].label}</span>
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Navigation Links - Mobile Optimized */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
              <div className="space-y-2">
                {/* Main Navigation */}
                {navItems.filter(item => !item.isLogo).map((item, i) => (
                  <div key={i}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626] min-h-[56px] border border-transparent hover:border-[#2563eb]/20"
                      >
                        {item.icon && (
                          <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#2563eb]" />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="font-medium text-base">{item.label}</span>
                          <p className="text-white/50 text-sm">External link</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/40" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626] min-h-[56px] border border-transparent hover:border-[#2563eb]/20"
                      >
                        {item.icon && (
                          <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#2563eb]" />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="font-medium text-base">{item.label}</span>
                          <p className="text-white/50 text-sm">
                            {item.label === "STORE" ? "Browse all cheats" :
                             item.label === "STATUS" ? "Server status" :
                             item.label === "GUIDES" ? "How-to guides" :
                             item.label === "REVIEWS" ? "User reviews" :
                             item.label === "DISCORD" ? "Join for support" :
                             "Navigate to page"}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer - Mobile */}
            <div className="px-4 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a]/90">
              <div className="text-center">
                <p className="text-white/40 text-xs">
                  • 2025 Skyline Cheats. All rights reserved.
                </p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-[#2563eb] text-xs transition-colors">
                    Terms
                  </Link>
                  <span className="text-white/30">•</span>
                  <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-[#2563eb] text-xs transition-colors">
                    Privacy
                  </Link>
                  <span className="text-white/30">•</span>
                  <a href="https://discord.gg/skylinecheats" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#2563eb] text-xs transition-colors">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}