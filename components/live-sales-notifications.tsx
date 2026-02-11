"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Product {
  name: string;
  image: string;
  slug: string;
}

interface Sale {
  id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  timeAgo: string;
}

const timeOptions = [
  "5 seconds ago",
  "12 seconds ago",
  "23 seconds ago",
  "45 seconds ago",
  "1 minute ago",
  "2 minutes ago",
  "5 minutes ago",
  "8 minutes ago",
  "12 minutes ago",
  "15 minutes ago",
  "16 minutes ago",
  "20 minutes ago",
  "25 minutes ago",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function LiveSalesNotifications() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch real products from your site
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products.map((p: any) => ({
            name: p.name,
            image: p.image,
            slug: p.slug
          })));
        }
      })
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const generateSale = (): Sale => {
      const product = getRandomElement(products);
      const timeAgo = getRandomElement(timeOptions);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        productName: product.name,
        productImage: product.image,
        productSlug: product.slug,
        timeAgo,
      };
    };

    const showNotification = () => {
      const sale = generateSale();
      setCurrentSale(sale);
      setIsVisible(true);
      setDragOffset(0);

      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Show first notification after 2 seconds
    const initialTimeout = setTimeout(showNotification, 2000);

    // Then show every 15 seconds (9s wait + 6s display)
    const interval = setInterval(showNotification, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  // Handle swipe/drag to dismiss
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startXRef.current;
    // Only allow left swipe
    if (diff < 0) {
      setDragOffset(diff);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    // If swiped more than 100px, dismiss
    if (dragOffset < -100) {
      setIsVisible(false);
      setDragOffset(0);
    } else {
      // Snap back
      setDragOffset(0);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDragOffset(0);
  };

  const handleClick = () => {
    if (!isDragging && currentSale) {
      // Navigate to product page
      window.location.href = `/store/${currentSale.productSlug}`;
    }
  };

  if (!currentSale || products.length === 0) return null;

  return (
    <div
      ref={cardRef}
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 select-none hidden md:block ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
      style={{
        transform: `translateX(${isVisible ? dragOffset : -400}px)`,
        transition: isDragging ? 'none' : 'all 0.5s',
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onClick={handleClick}
    >
      <div className="relative group cursor-pointer active:cursor-grabbing hover:scale-105 transition-transform duration-300">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-2 border-[#2563eb]/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#2563eb]/30 flex-shrink-0 bg-[#1a1a1a]">
              <Image
                src={currentSale.productImage}
                alt={currentSale.productName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Recently Purchased
                </p>
              </div>
              <h3 className="text-white font-bold text-sm mb-1 truncate">
                {currentSale.productName}
              </h3>
              <p className="text-white/50 text-xs flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white/50" />
                {currentSale.timeAgo}
              </p>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2563eb]/20 to-transparent animate-shimmer" />
          </div>

          {/* Swipe indicator */}
          {dragOffset < -20 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">
              Swipe to dismiss →
            </div>
          )}
        </div>
      </div>

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
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
