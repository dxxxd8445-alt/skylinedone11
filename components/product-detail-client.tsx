"use client";

import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Zap,
  Shield,
  Star,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Quote,
  CheckCircle,
  Copy,
  Mail,
  X,
  Check,
  TrendingUp,
  Users,
  Sparkles,
  Lock,
  Clock,
  Package,
  Award,
  ChevronRight,
  Eye,
  PenLine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { validateCoupon } from "@/lib/purchase-actions";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AddToCartModal } from "@/components/add-to-cart-modal";
import { ReviewModal } from "@/components/review-modal";
import { createReview } from "@/lib/supabase/data";
import { allReviews } from "@/lib/reviews-data";
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
  gallery?: string[];
  featureCards?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

interface Review {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  created_at: string;
}

// Avatar images for reviews
const avatarImages = [
  "/images/avatars/avatar-1.png",
  "/images/avatars/avatar-2.png",
  "/images/avatars/avatar-3.png",
];

// Generate unique reviews based on product name
const getProductReviews = (productName: string) => {
  // Map internal product names (e.g. "Armani") to review product categories (e.g. "Apex Legends")
  const productMapping: Record<string, string> = {
    "Armani": "Apex Legends",
    "Inferno": "Apex Legends", 
    "Predator": "Apex Legends",
    "Phantom": "Valorant",
    "Ghost": "Call of Duty",
    "Titan": "Rust",
  };

  const category = productMapping[productName] || productName;
  
  // Find reviews that match the category or product name
  const reviews = allReviews.filter(r => {
    if (!r.productName) return false;
    const pName = r.productName.toLowerCase();
    const cName = category.toLowerCase();
    
    return pName === cName || 
           pName.includes(cName) || 
           cName.includes(pName);
  });

  if (reviews.length > 0) {
     return reviews.map(r => ({
      id: r.id,
      username: r.username,
      avatar: r.avatar,
      rating: r.rating,
      text: r.text,
      created_at: r.date
    }));
  }

  // Fallback to general reviews if no specific ones found
  return allReviews.map(r => ({
    id: r.id,
    username: r.username,
    avatar: r.avatar,
    rating: r.rating,
    text: r.text,
    created_at: r.date
  }));
};

export function ProductDetailClient({ product, reviews, gameSlug }: { product: Product; reviews: Review[]; gameSlug?: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const { locale } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"features" | "reviews" | "faq">("features");
  
  // Check if product has pricing
  const hasPricing = product.pricing && product.pricing.length > 0;
  const selectedTier = hasPricing ? product.pricing[selectedPriceIndex] : null;
  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  // Success state
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    licenseKey: string;
  } | null>(null);
  
  // Add to cart modal state
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews || []);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Update local reviews when props change
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setLocalReviews(reviews);
    }
  }, [reviews]);

  const handleReviewSubmit = async (data: { username: string; rating: number; text: string; image_url?: string }) => {
    try {
      const newReview = {
        username: data.username,
        rating: data.rating,
        text: data.text,
        image_url: data.image_url,
        avatar: data.username.charAt(0).toUpperCase(),
        verified: true,
      };

      const savedReview = await createReview(newReview);

      if (savedReview) {
        setLocalReviews([savedReview, ...localReviews]);
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
      } else {
        throw new Error("Failed to save review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Live viewing counter animation
  const [viewingCount, setViewingCount] = useState(42);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(35, Math.min(58, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate gallery
  useEffect(() => {
    if (product.gallery && product.gallery.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % product.gallery!.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product.gallery]);

  const handleAddToCart = () => {
    if (!selectedTier) {
      toast({
        title: "No pricing available",
        description: "This product doesn't have pricing configured yet.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      game: product.game,
      image: product.image,
      duration: selectedTier.duration,
      price: selectedTier.price,
      quantity: 1, // Fixed quantity since selector removed
    });
    setShowAddToCartModal(true);
  };

  const handleBuyNow = () => {
    setShowCheckoutModal(true);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode);
      if (result.valid && result.discount) {
        setCouponDiscount(result.discount);
        setCouponValid(true);
      } else {
        setCouponDiscount(0);
        setCouponValid(false);
      }
    } catch {
      setCouponValid(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setCheckoutError("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      if (!selectedTier) {
        throw new Error("No pricing available for this product");
      }
      
      let totalAmount = selectedTier.price; // Single quantity since selector removed
      
      if (couponDiscount > 0) {
        totalAmount = totalAmount * (1 - couponDiscount / 100);
      }

      // Prepare checkout item for Stripe
      const checkoutItem = {
        id: `${product.id}-${selectedTier.duration}`,
        productId: product.id,
        productName: product.name,
        game: product.game,
        duration: selectedTier.duration,
        price: selectedTier.price,
        quantity: 1,
      };

      console.log('🛒 Starting Stripe checkout for product:', checkoutItem);

      // Import and use Stripe checkout
      const { redirectToStripeCheckout } = await import("@/lib/stripe-checkout");
      
      const result = await redirectToStripeCheckout({
        items: [checkoutItem],
        customerEmail: customerEmail,
        couponCode: couponValid ? couponCode : undefined,
        couponDiscountAmount: couponDiscount > 0 ? (selectedTier.price * couponDiscount / 100) : undefined,
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/payment/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/payment/cancelled`,
      });

      if (!result.success) {
        setCheckoutError(result.error || "Failed to redirect to checkout. Please try again.");
      }
      // Note: If successful, user will be redirected to Stripe, so no need to handle success here
      
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="pt-24 pb-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={gameSlug ? `/store/${gameSlug}` : "/store"}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white/60 hover:text-[#dc2626] hover:border-[#dc2626]/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {gameSlug ? `Back to ${product.game} Cheats` : "Back to Store"}
          </Link>
          
          {/* Live Viewing Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg">
            <div className="relative">
              <Eye className="w-4 h-4 text-[#dc2626]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#dc2626] rounded-full animate-ping" />
            </div>
            <span className="text-white/80 text-sm font-medium">{viewingCount} viewing now</span>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Enhanced Image Gallery */}
          <div className="space-y-6">
            {/* Main Image with Zoom Effect */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/50 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-full bg-[#111111] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={product.gallery && product.gallery.length > 0 && selectedImage < product.gallery.length
                    ? product.gallery[selectedImage]
                    : "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm">
                  {selectedImage + 1} / {product.gallery?.length || 1}
                </div>
              </div>
            </div>
            
            {/* Enhanced Thumbnail Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative group/thumb w-28 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? "border-[#dc2626] ring-2 ring-[#dc2626]/50 scale-105"
                        : "border-[#1a1a1a] hover:border-[#dc2626]/50 hover:scale-105"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover transform group-hover/thumb:scale-110 transition-transform"
                    />
                    {selectedImage === idx && (
                      <div className="absolute inset-0 bg-[#dc2626]/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges - Dynamic Feature Cards */}
            <div className="grid grid-cols-3 gap-4">
              {(product.featureCards || [
                { icon: "Shield", title: "Secure", description: "SSL Protected" },
                { icon: "Zap", title: "Instant", description: "Auto Delivery" },
                { icon: "Users", title: "Support", description: "24/7 Available" }
              ]).map((card, idx) => {
                const IconComponent = card.icon === "Shield" ? Shield : card.icon === "Zap" ? Zap : Users;
                return (
                  <div key={idx} className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-center hover:border-[#dc2626]/30 transition-all group">
                    <IconComponent className="w-8 h-8 text-[#dc2626] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white text-sm font-semibold mb-1">{card.title}</p>
                    <p className="text-white/50 text-xs">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Enhanced Product Details */}
          <div className="space-y-6">
            {/* Product Name with Animation */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">{product.name}</h1>
              
              {/* Enhanced Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#111111] text-white text-sm border border-[#262626] hover:border-[#dc2626]/30 transition-all">
                  <Zap className="w-4 h-4 text-[#dc2626] group-hover:animate-pulse" />
                  Instant Delivery
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative overflow-hidden group ${
                    product.status === "active"
                      ? "bg-green-500/10 text-green-400 border-2 border-green-500/30"
                      : "bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30"
                  }`}
                >
                  <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  {product.status === "active" ? "Undetected (Working)" : "Maintenance"}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dc2626]/10 text-[#dc2626] text-sm border border-[#dc2626]/30 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </span>
              </div>
            </div>

            {/* Enhanced Price Display - Mobile Optimized */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#dc2626]/30 rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                {selectedTier ? (
                  <div className="space-y-4">
                    {/* Duration and Price */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedTier.duration}
                        </p>
                        <p className="text-4xl sm:text-5xl font-bold text-white flex items-baseline gap-2">
                          <span className="text-[#dc2626]">
                            {formatMoney({ amountUsd: selectedTier.price, currency, locale })}
                          </span>
                        </p>
                        <p className="text-white/40 text-sm mt-1">per license</p>
                      </div>
                      
                      {/* Stock Indicator - Removed per user request */}
                    </div>
                    
                    {/* Quantity selector removed - users can adjust in cart */}
                  </div>
                ) : (
                  <div>
                    <p className="text-white/60 text-sm mb-2">No pricing available</p>
                    <p className="text-2xl font-bold text-white/40">Contact admin</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Variant Cards - Mobile Optimized */}
            <div className="space-y-3">
              <p className="text-white/60 text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Select Duration
              </p>
              {hasPricing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {product.pricing.map((tier, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPriceIndex(index)}
                      className={`relative w-full p-4 sm:p-5 rounded-xl border-2 transition-all text-left group overflow-hidden touch-manipulation ${
                        selectedPriceIndex === index
                          ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] border-[#dc2626] text-white shadow-2xl shadow-[#dc2626]/40 scale-105"
                          : "bg-[#111111] border-[#262626] text-white hover:border-[#dc2626]/50 hover:bg-[#1a1a1a] hover:scale-102"
                      }`}
                    >
                      {selectedPriceIndex === index && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pr-8 sm:pr-10 gap-2">
                        <div className="flex-1">
                          <p className="text-white/80 text-sm flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3" />
                            {tier.duration}
                          </p>
                          <p className="font-bold text-xl sm:text-2xl">{formatMoney({ amountUsd: tier.price, currency, locale })}</p>
                          {selectedPriceIndex !== index && (
                            <p className="text-xs text-white/50 mt-1">Save more with longer plans</p>
                          )}
                        </div>
                        {/* Stock info removed per user request */}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#111111] border-2 border-[#262626] rounded-xl text-center">
                  <p className="text-white/60 mb-2">No pricing configured</p>
                  <p className="text-white/40 text-sm">Contact admin to add pricing variants</p>
                </div>
              )}
            </div>

            {/* Checkout Error */}
            {checkoutError && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm animate-shake flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Enhanced Action Buttons - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleAddToCart}
                className="relative w-full py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group bg-white text-[#0a0a0a] hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 touch-manipulation"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                Add To Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!selectedTier}
                className="relative w-full py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white hover:from-[#ef4444] hover:to-[#dc2626] hover:shadow-2xl hover:shadow-[#dc2626]/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none touch-manipulation"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                <span className="text-center">
                  {selectedTier 
                    ? `Buy Now - ${formatMoney({ amountUsd: selectedTier.price, currency, locale })}` 
                    : 'No pricing available'}
                </span>
              </button>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className="mb-16">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-8 bg-[#111111] border border-[#1a1a1a] rounded-xl p-2">
            {[
              { id: "features", label: "Features", icon: Sparkles },
              { id: "reviews", label: "Reviews", icon: Star },
              { id: "faq", label: "FAQ", icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/30"
                    : "text-white/60 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === "features" && (
              <div className="space-y-8">
                {/* Information Section */}
                <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <h2 className="text-[#dc2626] font-bold text-2xl tracking-wider">SYSTEM REQUIREMENTS</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Package, label: "CPU", value: product.requirements.cpu },
                      { icon: Shield, label: "Windows", value: product.requirements.windows },
                      { icon: Lock, label: "Type", value: product.requirements.cheatType },
                      { icon: Check, label: "Controller", value: product.requirements.controller ? "Supported" : "Not Supported" },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-[#0a0a0a]/50 rounded-xl border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <req.icon className="w-5 h-5 text-[#dc2626]" />
                        </div>
                        <div>
                          <p className="text-white/50 text-xs font-medium uppercase">{req.label}</p>
                          <p className="text-white font-semibold">{req.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "AIMBOT", desc: "External Aim Assistance With Tuning", features: product.features.aimbot, gradient: "from-red-500/20 to-orange-500/20" },
                    { title: "ESP", desc: "Enemy, Item, And Loot Awareness", features: product.features.esp, gradient: "from-purple-500/20 to-pink-500/20" },
                    { title: "MISC", desc: "Customization And Utility Features", features: product.features.misc, gradient: "from-blue-500/20 to-cyan-500/20" },
                  ].map((category, idx) => (
                    <div key={idx} className="group relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] rounded-2xl p-6 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-[#dc2626] to-transparent rounded-full" />
                      <div className="relative pl-4">
                        <h3 className="text-white font-bold text-xl mb-2">{category.title}</h3>
                        <p className="text-white/50 text-sm mb-6">{category.desc}</p>
                        <ul className="space-y-3">
                          {category.features && category.features.length > 0 ? (
                            category.features.map((feature, featureIdx) => (
                              <li key={featureIdx} className="flex items-start gap-3 text-sm group/item">
                                <CheckCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                                <span className="text-white/70 group-hover/item:text-white transition-colors">{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-white/40 text-sm italic">No {category.title.toLowerCase()} features</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Review Stats */}
                <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-[#dc2626]">4.9</p>
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-white/60 text-sm">Average Rating</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-white">2.4K+</p>
                      <p className="text-white/60 text-sm">Total Reviews</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-green-400">98%</p>
                      <p className="text-white/60 text-sm">Satisfaction</p>
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border border-[#dc2626]/20 rounded-xl transition-all group cursor-pointer"
                      >
                        <PenLine className="w-8 h-8 text-[#dc2626] group-hover:scale-110 transition-transform" />
                        <span className="text-[#dc2626] font-bold">Write a Review</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(localReviews.length > 0 ? localReviews : getProductReviews(product.name))
                    .slice(0, showAllReviews ? undefined : 9)
                    .map((review, index) => (
                    <div 
                      key={review.id || index} 
                      className="group relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc2626]/5 rounded-full blur-2xl group-hover:bg-[#dc2626]/10 transition-colors" />
                      <div className="relative">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                            />
                          ))}
                        </div>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed line-clamp-4">{review.text}</p>
                        <div className="flex items-center gap-3 pt-4 border-t border-[#1a1a1a]">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#dc2626]/20">
                            {review.avatar || review.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{review.username}</p>
                            <p className="text-white/40 text-xs">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                {!showAllReviews && (localReviews.length > 9 || getProductReviews(product.name).length > 9) && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="px-8 py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#dc2626]/40 flex items-center gap-2"
                    >
                      Show More Reviews
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-4">
                {[
                  {
                    question: "Are Magma Cheats undetectable?",
                    answer: "Our cheats are built with the latest security measures to stay ahead of anti-cheat systems. We continuously update our software to minimize detection risks, giving you the safest experience possible."
                  },
                  {
                    question: "What's the difference between cheats?",
                    answer: "The difference comes down to the game supported, included features, and customization. Some cheats include advanced visuals or extra aimbot features, while others are optimized for maximum stealth."
                  },
                  {
                    question: "Where can I get customer support?",
                    answer: "Our dedicated support team is available 24/7 to assist you. You can reach us anytime through our Discord server for fast and reliable assistance."
                  },
                  {
                    question: "How do I purchase and get instant access?",
                    answer: "Simply select your desired package, complete the payment, and within seconds, your access key will be delivered instantly. No waiting, no delays."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index} 
                    className="group bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[#dc2626]/20">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2 group-hover:text-[#dc2626] transition-colors">
                          {faq.question}
                          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSubmit={handleReviewSubmit}
      />

      {/* Enhanced Checkout Modal */}
      {showCheckoutModal && !purchaseComplete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-[#dc2626] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#dc2626]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
                <p className="text-white/60 text-sm">
                  {product.name} - {selectedTier ? selectedTier.duration : 'No pricing'}
                </p>
              </div>
            </div>
            
            {/* Email Input */}
            <div className="mb-5 group/input">
              <label className="block text-white/80 text-sm mb-2 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
              </div>
              <p className="text-white/50 text-xs mt-2">Your license key will be sent to this email</p>
            </div>
            
            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2 font-medium">Coupon Code (Optional)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponValid(null);
                    setCouponDiscount(0);
                  }}
                  placeholder="SAVE10"
                  className="flex-1 px-4 py-3.5 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-6 py-3.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-xl transition-all disabled:opacity-50 font-semibold"
                >
                  {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponValid === true && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Coupon applied! {couponDiscount}% off
                </p>
              )}
              {couponValid === false && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Invalid or expired coupon
                </p>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Subtotal</span>
                <span className="font-semibold">{formatMoney({ amountUsd: product.pricing[selectedPriceIndex].price, currency, locale })}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({couponDiscount}%)</span>
                  <span className="font-semibold">-{formatMoney({ amountUsd: (product.pricing[selectedPriceIndex].price * couponDiscount) / 100, currency, locale })}</span>
                </div>
              )}
              <div className="border-t-2 border-[#1a1a1a] pt-3 flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-[#dc2626] font-bold text-3xl">
                  {formatMoney({ amountUsd: product.pricing[selectedPriceIndex].price * (1 - couponDiscount / 100), currency, locale })}
                </span>
              </div>
            </div>
            
            {checkoutError && (
              <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-shake">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !customerEmail}
              className={`relative w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                !isProcessing && customerEmail
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white hover:from-[#ef4444] hover:to-[#dc2626] hover:shadow-2xl hover:shadow-[#dc2626]/40 hover:-translate-y-1"
                  : "bg-[#1a1a1a] text-white/40 cursor-not-allowed"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  Complete Secure Purchase
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {purchaseComplete && orderDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-green-500/30 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <CheckCircle className="w-10 h-10 text-green-500 relative" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">Purchase Complete!</h2>
            <p className="text-white/60 mb-8">
              Your license key has been sent to<br />
              <span className="text-[#dc2626] font-semibold">{customerEmail}</span>
            </p>
            
            <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl p-5 mb-4">
              <p className="text-white/60 text-sm mb-2">Order Number</p>
              <p className="text-white font-mono font-bold text-lg">{orderDetails.orderNumber}</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#dc2626]/10 to-transparent border-2 border-[#dc2626]/30 rounded-xl p-5 mb-8">
              <p className="text-white/60 text-sm mb-3">Your License Key</p>
              <div className="flex items-center justify-between gap-3 bg-[#0a0a0a] rounded-lg p-3">
                <p className="text-[#dc2626] font-mono font-bold text-lg flex-1">{orderDetails.licenseKey}</p>
                <button
                  onClick={() => copyToClipboard(orderDetails.licenseKey)}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors group"
                >
                  <Copy className="w-5 h-5 text-white/60 group-hover:text-[#dc2626]" />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setPurchaseComplete(false);
                setShowCheckoutModal(false);
                setOrderDetails(null);
                setCustomerEmail("");
                setCouponCode("");
                setCouponDiscount(0);
              }}
              className="w-full py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-[#dc2626]/30"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={{
          name: product.name,
          image: product.image,
          duration: selectedTier ? selectedTier.duration : 'N/A',
          quantity: 1, // Fixed quantity since selector removed
        }}
      />

      <style jsx>{`
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
      </div>
  );
}