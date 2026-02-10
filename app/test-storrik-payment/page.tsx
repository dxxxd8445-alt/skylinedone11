"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function TestStorrikPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState(10); // $10 USD

  const testStorrikAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("[Test] Testing Storrik payment intent creation...");
      
      const response = await fetch('/api/storrik/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: 'test-1',
            productId: 'test-product',
            productName: 'Test Product',
            productSlug: 'test-product',
            duration: '30 days',
            price: testAmount,
            quantity: 1,
          }],
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          subtotal: testAmount,
          discount: 0,
          total: testAmount,
        }),
      });

      const data = await response.json();
      console.log("[Test] Response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      setResult(data);
      
      // If checkout URL is returned, show success
      if (data.checkoutUrl) {
        console.log("[Test] Checkout URL:", data.checkoutUrl);
      }

    } catch (err: any) {
      console.error("[Test] Error:", err);
      setError(err.message || 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  const testSettingsAPI = async () => {
    try {
      console.log("[Test] Testing Storrik settings API...");
      
      const response = await fetch('/api/settings/storrik-key');
      const data = await response.json();
      console.log("[Test] Settings response:", data);

      if (data.apiKey) {
        console.log("[Test] Storrik API key is configured");
      } else {
        console.log("[Test] Storrik API key not configured");
      }

    } catch (err: any) {
      console.error("[Test] Settings API error:", err);
    }
  };

  useEffect(() => {
    testSettingsAPI();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Storrik Payment Test</h1>
            
            <div className="space-y-6">
              {/* Test Configuration */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#1a1a1a]">
                <h2 className="text-xl font-semibold text-white mb-4">Test Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Test Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={(e) => setTestAmount(Number(e.target.value))}
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
                    />
                  </div>

                  <button
                    onClick={testStorrikAPI}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Testing Storrik API...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Test Payment Creation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {result && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold text-green-400">Success!</h3>
                  </div>
                  
                  <div className="space-y-2 text-white/80 text-sm">
                    <p><strong>Order Number:</strong> {result.orderNumber}</p>
                    <p><strong>Session ID:</strong> {result.sessionId}</p>
                    <p><strong>Checkout URL:</strong> 
                      <a 
                        href={result.checkoutUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#2563eb] hover:underline ml-2"
                      >
                        Open Checkout
                        <ArrowRight className="w-4 h-4 inline ml-1" />
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-red-400">Error</h3>
                  </div>
                  <p className="text-white/80">{error}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Setup Instructions</h3>
                <ol className="space-y-2 text-white/70 text-sm list-decimal list-inside">
                  <li>Add these environment variables to your .env.local file:</li>
                  <code className="block bg-[#0a0a0a] p-3 rounded text-[#2563eb] text-xs mt-2 overflow-x-auto">
                    STORRIK_SECRET_KEY="sk_live_Ez0SrU3u2qOj6Vviv_ex0LhPp-VeEmum69F-llDi1DU"<br/>
                    STORRIK_PUBLIC_KEY="pk_live_-C5YxyjzMiRNh0n0ECoIBP4rFZMr34Fcpb7mnW5dQ90"<br/>
                    STORRIK_WEBHOOK_SECRET="whsec_NIiLZwWd69gg9m3cn2KadKi0O5LnFX4SOUeEi10Yv9Ef7d2d98c"
                  </code>
                  <li className="mt-3">Restart your development server</li>
                  <li>Configure webhook in Storrik dashboard: <code className="text-[#2563eb]">/api/storrik/webhook</code></li>
                  <li>Test the checkout flow by adding items to cart and proceeding to checkout</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
