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
    { icon: Home, label: "HOME", href: "/" },
    { icon: Store, label: t("nav_store"), href: "/store" },
    { icon: BarChart3, label: t("nav_status"), href: "/status" },
    { icon: BookOpen, label: t("nav_guides"), href: "/guides" },
    { icon: Heart, label: t("nav_reviews"), href: "/reviews" },
    {
      icon: Shield,
      label: t("nav_support"),
      href: "https://discord.gg/ring-0",
      external: true,
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-6">
          
          {/* Mobile Search Bar - Always Visible */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm lg:hidden">
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#6b7280]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f]">
              <Search className="w-4 h-4 text-white/50 transition-colors duration-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white/80 placeholder:text-white/50 outline-none w-full min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                  className="text-white/50 hover:text-white flex-shrink-0 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product.slug)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#1a1a1a] transition-colors text-left active:bg-[#262626] min-h-[44px]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-white/50 text-xs truncate">
                            {product.game}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                            product.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {product.status === "active" ? "Live" : "Soon"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-white/50 text-sm">No results found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navItems.map((item, i) =>
              item.external ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#6b7280] text-xs xl:text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap min-h-[44px] px-2 py-2"
                >
                  {item.icon && <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6b7280] transition-all duration-300 group-hover:w-full" />
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#6b7280] text-xs xl:text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap min-h-[44px] px-2 py-2"
                >
                  {item.icon && <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6b7280] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* Right side - Mobile Optimized */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cart Counter - Mobile */}
            <div className="lg:hidden">
              <CartCounter />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] transition-all duration-300 min-h-[44px] min-w-[44px]"
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
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#6b7280]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f]">
                <Search className="w-4 h-4 text-white/50 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white/80 placeholder:text-white/50 outline-none w-40 transition-all duration-300 focus:w-56"
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
            <div className="hidden lg:flex items-center gap-2">
              {mounted && (
                <div className="hidden lg:flex items-center gap-2" suppressHydrationWarning>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-10 px-3 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#6b7280]/30 transition-all duration-300 text-xs font-semibold min-h-[44px]"
                        aria-label="Currency"
                        type="button"
                        suppressHydrationWarning
                      >
                        <span className="inline-flex items-center gap-2">
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
                      className="h-10 px-3 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#6b7280]/30 transition-all duration-300 text-xs font-semibold min-h-[44px]"
                      aria-label="Language"
                      type="button"
                      suppressHydrationWarning
                    >
                      <span className="inline-flex items-center gap-2">
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
          className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-md"
          style={{
            position: 'fixed',
            top: 'var(--announcement-height, 0px)',
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: '100vw',
            height: `calc(100vh - var(--announcement-height, 0px))`,
            zIndex: 9999,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Menu Content */}
          <div className="w-full h-full flex flex-col">
            {/* Menu Header - Compact */}
            <div className="flex items-center justify-end px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]/90">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#262626] text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-all min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions - Mobile Optimized */}
            <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/50">
              <div className="grid grid-cols-2 gap-3">
                {/* Cart */}
                <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#262626]">
                  <CartCounter />
                </div>
                
                {/* Auth */}
                <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#262626]">
                  <AuthDropdown />
                </div>
              </div>
            </div>

            {/* Settings - Mobile Optimized */}
            {mounted && (
              <div className="px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/30">
                <div className="grid grid-cols-2 gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#6b7280]/30 hover:bg-[#262626] transition-all text-sm font-semibold min-h-[44px]"
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
                    <DropdownMenuContent align="start" className="w-48 bg-[#111111] border border-[#1a1a1a] text-white">
                      <DropdownMenuRadioGroup
                        value={currency}
                        onValueChange={(v) => setCurrency(v as SupportedCurrency)}
                      >
                        {currencyOptions.map((c) => (
                          <DropdownMenuRadioItem key={c.code} value={c.code} className="text-white/80 min-h-[44px]">
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
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#6b7280]/30 hover:bg-[#262626] transition-all text-sm font-semibold min-h-[44px]"
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
                    <DropdownMenuContent align="end" className="w-48 bg-[#111111] border border-[#1a1a1a] text-white">
                      <DropdownMenuRadioGroup
                        value={language}
                        onValueChange={(v) => setLanguage(v as SupportedLanguage)}
                      >
                        {languageOptions.map((l) => (
                          <DropdownMenuRadioItem key={l.code} value={l.code} className="text-white/80 min-h-[44px]">
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
              </div>
            )}

            {/* Navigation Links - Mobile Optimized */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
              <div className="space-y-2">
                {/* Main Navigation */}
                {navItems.map((item, i) => (
                  <div key={i}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626] min-h-[56px] border border-transparent hover:border-[#6b7280]/20"
                      >
                        {item.icon && (
                          <div className="w-10 h-10 rounded-lg bg-[#6b7280]/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#6b7280]" />
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
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626] min-h-[56px] border border-transparent hover:border-[#6b7280]/20"
                      >
                        {item.icon && (
                          <div className="w-10 h-10 rounded-lg bg-[#6b7280]/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-[#6b7280]" />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="font-medium text-base">{item.label}</span>
                          <p className="text-white/50 text-sm">
                            {item.label === "STORE" ? "Browse all cheats" :
                             item.label === "STATUS" ? "Server status" :
                             item.label === "GUIDES" ? "How-to guides" :
                             item.label === "REVIEWS" ? "User reviews" :
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
                  • 2025 Ring-0. All rights reserved.
                </p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-[#6b7280] text-xs transition-colors">
                    Terms
                  </Link>
                  <span className="text-white/30">•</span>
                  <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-[#6b7280] text-xs transition-colors">
                    Privacy
                  </Link>
                  <span className="text-white/30">•</span>
                  <a href="https://discord.gg/ring-0" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#6b7280] text-xs transition-colors">
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