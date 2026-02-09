"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, CreditCard, Bitcoin, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalUsd: number;
  productName: string;
  customerEmail?: string;
  items?: any[];
  subtotal?: number;
  discount?: number;
  couponCode?: string;
}

type PaymentMethod = "select" | "card" | "litecoin" | "bitcoin";

// Crypto addresses
const LITECOIN_ADDRESS = "LSCp4ChhkBSKH3LesC6NGBbriSdXwrfHuW";
const BITCOIN_ADDRESS = "bc1qc4xvjkmdyxn4g42p7ylm57kdplnxnt9m5lqjgm";

export function CryptoPaymentModal({
  isOpen,
  onClose,
  totalUsd,
  productName,
  customerEmail = "guest@example.com",
  items = [],
  subtotal = 0,
  discount = 0,
  couponCode,
}: CryptoPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("select");
  const [copied, setCopied] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState({ ltc: 0, btc: 0 });
  const { toast } = useToast();

  // Fetch crypto prices and calculate amounts
  useEffect(() => {
    if (isOpen && (paymentMethod === "litecoin" || paymentMethod === "bitcoin")) {
      fetchCryptoPrices();
    }
  }, [isOpen, paymentMethod, totalUsd]);

  const fetchCryptoPrices = async () => {
    try {
      // Fetch real-time crypto prices from CoinGecko API
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=litecoin,bitcoin&vs_currencies=usd"
      );
      const data = await response.json();
      
      const ltcPrice = data.litecoin?.usd || 100;
      const btcPrice = data.bitcoin?.usd || 50000;
      
      setCryptoAmount({
        ltc: parseFloat((totalUsd / ltcPrice).toFixed(6)),
        btc: parseFloat((totalUsd / btcPrice).toFixed(8)),
      });
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      // Fallback prices
      setCryptoAmount({
        ltc: parseFloat((totalUsd / 100).toFixed(6)),
        btc: parseFloat((totalUsd / 50000).toFixed(8)),
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderPosition(value);
    
    // Auto-confirm when reaching 85% (much easier threshold)
    if (value >= 85 && !isConfirming && !orderComplete) {
      confirmCryptoPayment();
    }
  };

  const confirmCryptoPayment = async () => {
    setIsConfirming(true);
    
    // Generate random order ID
    const randomId = `PRI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setOrderId(randomId);
    
    // Get current crypto details
    const cryptoAddress = paymentMethod === "litecoin" ? LITECOIN_ADDRESS : BITCOIN_ADDRESS;
    const cryptoAmountValue = paymentMethod === "litecoin" ? cryptoAmount.ltc : cryptoAmount.btc;
    
    try {
      // Create order in database with pending status
      const response = await fetch('/api/crypto-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: randomId,
          customerEmail: customerEmail,
          items: items,
          subtotal: subtotal,
          discount: discount,
          total: totalUsd,
          couponCode: couponCode,
          paymentMethod: paymentMethod, // "litecoin" or "bitcoin"
          cryptoAmount: cryptoAmountValue,
          cryptoAddress: cryptoAddress,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to create order:', data.error);
        // Still show success to user, but log error
      }
    } catch (error) {
      console.error('Error creating crypto order:', error);
      // Still show success to user, but log error
    }
    
    setTimeout(() => {
      setIsConfirming(false);
      setOrderComplete(true);
    }, 1500);
  };

  const handleSliderRelease = () => {
    // Smooth reset if not confirmed
    if (sliderPosition < 85 && !isConfirming) {
      setSliderPosition(0);
    }
  };

  const resetModal = () => {
    setPaymentMethod("select");
    setSliderPosition(0);
    setOrderComplete(false);
    setOrderId("");
    onClose();
  };

  if (!isOpen) return null;

  const currentAddress = paymentMethod === "litecoin" ? LITECOIN_ADDRESS : BITCOIN_ADDRESS;
  const currentAmount = paymentMethod === "litecoin" ? cryptoAmount.ltc : cryptoAmount.btc;
  const currentSymbol = paymentMethod === "litecoin" ? "LTC" : "BTC";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0f1419] to-[#0a0a0a] border-2 border-[#1a1a1a] rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in">
        {/* Payment Method Selection */}
        {paymentMethod === "select" && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Select Payment</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#262626] text-white/60 hover:text-white transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Litecoin */}
              <button
                onClick={() => setPaymentMethod("litecoin")}
                className="group relative aspect-square rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1419] border-2 border-[#262626] hover:border-[#345d9d] transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#345d9d]/0 to-[#345d9d]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#345d9d]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.309 6.854h2.058c.296 0 .555.202.622.485l.782 3.308h2.478c.336 0 .608.272.608.608v1.49c0 .336-.272.608-.608.608h-2.022l-.555 2.347h1.577c.336 0 .608.272.608.608v1.49c0 .336-.272.608-.608.608h-1.121l-.555 2.347c-.067.283-.326.485-.622.485H12.28c-.336 0-.608-.272-.608-.608 0-.067.011-.134.033-.198l.622-2.626H9.849l-.555 2.347c-.067.283-.326.485-.622.485H7.614c-.336 0-.608-.272-.608-.608 0-.067.011-.134.033-.198l.622-2.626H5.183c-.336 0-.608-.272-.608-.608v-1.49c0-.336.272-.608.608-.608h2.022l.555-2.347H6.183c-.336 0-.608-.272-.608-.608v-1.49c0-.336.272-.608.608-.608h1.121l.555-2.347c.067-.283.326-.485.622-.485h2.058c.336 0 .608.272.608.608 0 .067-.011.134-.033.198l-.622 2.626h2.478l.555-2.347c.067-.283.326-.485.622-.485zm-1.478 6.101h2.478l.555-2.347H10.77l-.555 2.347z" fill="#345d9d"/>
                    </svg>
                  </div>
                  <span className="text-white/80 group-hover:text-white font-semibold text-lg transition-colors">
                    Litecoin
                  </span>
                </div>
              </button>

              {/* Bitcoin */}
              <button
                onClick={() => setPaymentMethod("bitcoin")}
                className="group relative aspect-square rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f1419] border-2 border-[#262626] hover:border-[#f7931a] transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 col-span-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f7931a]/0 to-[#f7931a]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full flex items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#f7931a]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bitcoin className="w-10 h-10 text-[#f7931a]" />
                  </div>
                  <span className="text-white/80 group-hover:text-white font-semibold text-xl transition-colors">
                    Bitcoin
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Crypto Payment Screen */}
        {(paymentMethod === "litecoin" || paymentMethod === "bitcoin") && !orderComplete && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setPaymentMethod("select")}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Change Method</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#262626] text-white/60 hover:text-white transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-3xl font-bold text-white mb-8">Complete Payment</h2>

            {/* Invoice Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-white/60">
                <span>Invoice ID</span>
                <span className="text-[#2563eb] font-mono font-semibold">
                  {orderId || "Generating..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Amount Due</span>
                <span className="text-white font-bold text-2xl">${totalUsd.toFixed(2)}</span>
              </div>
            </div>

            {/* Crypto Amount */}
            <div className="mb-8">
              <p className="text-white/40 text-sm text-center mb-3 uppercase tracking-wider">
                Send Exactly
              </p>
              <div className="text-center">
                <p className="text-white font-bold text-4xl mb-2">
                  {currentAmount} {currentSymbol}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={currentAddress}
                  readOnly
                  className="w-full px-4 py-4 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white font-mono text-sm pr-12 focus:outline-none focus:border-[#2563eb] transition-colors"
                />
                <button
                  onClick={() => copyToClipboard(currentAddress)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Slider to Confirm */}
            <div className="relative">
              <div className="relative h-16 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-100 ease-out"
                  style={{ width: `${sliderPosition}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  disabled={isConfirming || orderComplete}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10 disabled:cursor-not-allowed"
                  style={{ touchAction: 'none' }}
                />
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl transition-all duration-100 ease-out"
                  style={{ 
                    left: `calc(${sliderPosition}% - 24px + ${sliderPosition * 0.24}px)`,
                    boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)'
                  }}
                >
                  {isConfirming ? (
                    <Loader2 className="w-6 h-6 text-[#2563eb] animate-spin" />
                  ) : (
                    <ArrowLeft className="w-6 h-6 text-[#2563eb] rotate-180" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span 
                    className="text-white/60 font-semibold text-sm uppercase tracking-wider transition-opacity duration-200"
                    style={{ opacity: sliderPosition > 30 ? 0 : 1 }}
                  >
                    {isConfirming ? "Confirming..." : "Slide to Confirm Sent"}
                  </span>
                </div>
              </div>
              <p className="text-white/40 text-xs text-center mt-3">
                Slide to 85% to confirm payment sent
              </p>
            </div>
          </div>
        )}

        {/* Order Pending */}
        {orderComplete && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
              <Loader2 className="w-10 h-10 text-yellow-500 relative animate-spin" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Order Pending</h2>
            <p className="text-white/60 mb-6">Your order has been submitted and is awaiting verification</p>

            <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl p-5 mb-6">
              <p className="text-white/60 text-sm mb-2">Order ID</p>
              <p className="text-[#2563eb] font-mono font-bold text-xl">{orderId}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border-2 border-yellow-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-500 text-lg">⚠️</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold mb-2">Action Required</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Please create a ticket in our Discord server with your <span className="text-yellow-500 font-semibold">Order ID</span> and <span className="text-yellow-500 font-semibold">proof of purchase</span> (transaction screenshot) to receive your license key.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://discord.gg/skylineggs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 mb-4 w-full"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Create Ticket on Discord
            </a>

            <button
              onClick={resetModal}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-xl font-semibold transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
