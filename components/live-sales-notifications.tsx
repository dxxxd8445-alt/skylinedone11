"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

interface Product {
  name: string;
  image: string;
  slug: string;
}

interface Sale {
  id: string;
  productName: string;
  productImage: string;
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
        timeAgo,
      };
    };

    const showNotification = () => {
      const sale = generateSale();
      setCurrentSale(sale);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Show first notification after 1 second
    const initialTimeout = setTimeout(showNotification, 1000);

    // Then show every 8 seconds (3s wait + 5s display)
    const interval = setInterval(showNotification, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  if (!currentSale || products.length === 0) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#2563eb] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-2 border-[#2563eb]/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
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
            <div className="flex-1 min-w-0">
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
