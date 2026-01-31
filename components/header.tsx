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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { searchProducts } from "@/lib/supabase/data";
import { AuthDropdown } from "@/components/auth-dropdown";
import { useCart } from "@/lib/cart-context";
import { CartDropdown } from "@/components/cart-dropdown";
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
  const { getItemCount } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartCount = getItemCount();

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
    { icon: Home, label: "HOME", href: "/", mobileOnly: true },
    { icon: Store, label: t("nav_store"), href: "/store" },
    { icon: BarChart3, label: t("nav_status"), href: "/status" },
    { icon: BookOpen, label: t("nav_guides"), href: "/guides" },
    { icon: Heart, label: t("nav_reviews"), href: "/reviews" },
    {
      icon: Shield,
      label: t("nav_support"),
      href: "https://discord.gg/magmacheats",
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
    EUR: { symbol: "€", flagUrl: "https://flagcdn.com/eu.svg" },
    GBP: { symbol: "£", flagUrl: "https://flagcdn.com/gb.svg" },
    CAD: { symbol: "C$", flagUrl: "https://flagcdn.com/ca.svg" },
    AUD: { symbol: "A$", flagUrl: "https://flagcdn.com/au.svg" },
    NZD: { symbol: "NZ$", flagUrl: "https://flagcdn.com/nz.svg" },
    JPY: { symbol: "¥", flagUrl: "https://flagcdn.com/jp.svg" },
    KRW: { symbol: "₩", flagUrl: "https://flagcdn.com/kr.svg" },
    CNY: { symbol: "¥", flagUrl: "https://flagcdn.com/cn.svg" },
    HKD: { symbol: "HK$", flagUrl: "https://flagcdn.com/hk.svg" },
    SGD: { symbol: "S$", flagUrl: "https://flagcdn.com/sg.svg" },
    INR: { symbol: "₹", flagUrl: "https://flagcdn.com/in.svg" },
    BRL: { symbol: "R$", flagUrl: "https://flagcdn.com/br.svg" },
    MXN: { symbol: "MX$", flagUrl: "https://flagcdn.com/mx.svg" },
    ZAR: { symbol: "R", flagUrl: "https://flagcdn.com/za.svg" },
    SEK: { symbol: "kr", flagUrl: "https://flagcdn.com/se.svg" },
    NOK: { symbol: "kr", flagUrl: "https://flagcdn.com/no.svg" },
    DKK: { symbol: "kr", flagUrl: "https://flagcdn.com/dk.svg" },
    CHF: { symbol: "CHF", flagUrl: "https://flagcdn.com/ch.svg" },
    PLN: { symbol: "zł", flagUrl: "https://flagcdn.com/pl.svg" },
    CZK: { symbol: "Kč", flagUrl: "https://flagcdn.com/cz.svg" },
    HUF: { symbol: "Ft", flagUrl: "https://flagcdn.com/hu.svg" },
    RON: { symbol: "lei", flagUrl: "https://flagcdn.com/ro.svg" },
    TRY: { symbol: "₺", flagUrl: "https://flagcdn.com/tr.svg" },
    ILS: { symbol: "₪", flagUrl: "https://flagcdn.com/il.svg" },
    AED: { symbol: "د.إ", flagUrl: "https://flagcdn.com/ae.svg" },
    SAR: { symbol: "﷼", flagUrl: "https://flagcdn.com/sa.svg" },
  };

  const languageMeta: Record<SupportedLanguage, { label: string; flagUrl: string }> = {
    en: { label: "English", flagUrl: "https://flagcdn.com/us.svg" },
    es: { label: "Español", flagUrl: "https://flagcdn.com/es.svg" },
    fr: { label: "Français", flagUrl: "https://flagcdn.com/fr.svg" },
    de: { label: "Deutsch", flagUrl: "https://flagcdn.com/de.svg" },
    it: { label: "Italiano", flagUrl: "https://flagcdn.com/it.svg" },
    pt: { label: "Português", flagUrl: "https://flagcdn.com/pt.svg" },
    nl: { label: "Nederlands", flagUrl: "https://flagcdn.com/nl.svg" },
    pl: { label: "Polski", flagUrl: "https://flagcdn.com/pl.svg" },
    tr: { label: "Türkçe", flagUrl: "https://flagcdn.com/tr.svg" },
    ru: { label: "Русский", flagUrl: "https://flagcdn.com/ru.svg" },
    ar: { label: "العربية", flagUrl: "https://flagcdn.com/sa.svg" },
    hi: { label: "हिन्दी", flagUrl: "https://flagcdn.com/in.svg" },
    ja: { label: "日本語", flagUrl: "https://flagcdn.com/jp.svg" },
    ko: { label: "한국어", flagUrl: "https://flagcdn.com/kr.svg" },
    zh: { label: "中文", flagUrl: "https://flagcdn.com/cn.svg" },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/magma-logo.png"
                alt="Magma Cheats"
                width={300}
                height={80}
                className="h-10 sm:h-11 md:h-11 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(220,38,38,0.6)]"
              />
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navItems.filter(item => !item.mobileOnly).map((item, i) =>
              item.external ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#dc2626] text-xs xl:text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#dc2626] transition-all duration-300 group-hover:w-full" />
                </a>
              ) : (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-1.5 text-white/70 hover:text-[#dc2626] text-xs xl:text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap"
                >
                  <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#dc2626] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Search - Desktop */}
            <div ref={searchRef} className="relative hidden md:block">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#dc2626]/50 focus-within:bg-[#1a1a1a]/80 hover:bg-[#1f1f1f]">
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

              {/* Search Results Dropdown */}
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

            {/* Cart & Auth Dropdown */}
            <div className="hidden md:flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-10 px-3 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#dc2626]/30 transition-all duration-300 text-xs font-semibold"
                      aria-label="Currency"
                      type="button"
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
                      className="h-10 px-3 rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white hover:bg-[#262626] border border-[#262626] hover:border-[#dc2626]/30 transition-all duration-300 text-xs font-semibold"
                      aria-label="Language"
                      type="button"
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
              <CartDropdown />
              <AuthDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen with explicit dimensions */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden bg-[#0a0a0a]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
          }}
        >
          {/* Menu Content */}
          <div className="w-full h-full flex flex-col">
            {/* Menu Header with Logo and Close */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/magma-logo.png"
                  alt="Magma Cheats"
                  width={240}
                  height={64}
                  className="h-11 w-auto"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#262626] text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white/80 placeholder:text-white/50 outline-none flex-1 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowResults(false);
                    }}
                    className="text-white/50 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Mobile Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="mt-3 bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left active:bg-[#262626]"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{product.name}</p>
                        <p className="text-white/50 text-sm">{product.game}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                          product.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {product.status === "active" ? "Undetected" : "Updating"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cart & Auth Section */}
            <div className="px-5 py-4 border-b border-[#1a1a1a] space-y-3">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex-1 h-11 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#dc2626]/30 hover:bg-[#262626] transition-all text-sm font-semibold"
                      type="button"
                      aria-label="Currency"
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
                  <DropdownMenuContent align="start" className="w-48 bg-[#111111] border border-[#1a1a1a] text-white">
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
                      className="flex-1 h-11 px-4 rounded-xl bg-[#1a1a1a] text-white/80 border border-[#262626] hover:border-[#dc2626]/30 hover:bg-[#262626] transition-all text-sm font-semibold"
                      type="button"
                      aria-label="Language"
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
                  <DropdownMenuContent align="end" className="w-48 bg-[#111111] border border-[#1a1a1a] text-white">
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

              <Link
                href="/cart"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white/60" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-white/80 font-medium">Cart ({cartCount})</span>
              </Link>
              <AuthDropdown />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-5 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={i}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-colors active:bg-[#262626]"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a]">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium">{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-colors active:bg-[#262626] ${
                          item.label === "ADMIN"
                            ? "text-[#dc2626] hover:bg-[#dc2626]/10"
                            : "text-white/80 hover:text-white hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                          item.label === "ADMIN" ? "bg-[#dc2626]/20" : "bg-[#1a1a1a]"
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium">{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Quick Actions */}
            <div className="px-5 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-xl font-semibold text-lg transition-colors active:scale-[0.98]"
              >
                <Store className="w-5 h-5" />
                Browse Store
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}