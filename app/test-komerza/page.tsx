"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowRight, Settings, Key } from "lucide-react";

export default function TestKomerzaPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    testKomerzaAPI();
  }, []);

  const testKomerzaAPI = async () => {
    try {
      console.log("[Test] Testing Komerza API integration...");
      
      // Test 1: Check API key
      const keyResponse = await fetch('/api/settings/komerza-key');
      const keyData = await keyResponse.json();
      setApiKey(keyData.apiKey);

      // Test 2: Test checkout creation
      const response = await fetch('/api/komerza/create-checkout', {
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
            price: 10.00,
            quantity: 1,
          }],
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          subtotal: 10.00,
          discount: 0,
          total: 10.00,
        }),
      });

      const data = await response.json();
      console.log("[Test] Response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      setResult(data);
      
    } catch (err: any) {
      console.error("[Test] Error:", err);
      setError(err.message || 'Test failed');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Komerza Payment Test</h1>
            
            <div className="space-y-6">
              {/* API Key Status */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#1a1a1a]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#2563eb]" />
                  API Configuration
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">API Key:</span>
                    <span className={`text-sm font-mono ${apiKey ? 'text-green-400' : 'text-red-400'}`}>
                      {apiKey ? `${apiKey.substring(0, 15)}...` : 'Not configured'}
                    </span>
                  </div>
                  
                  {apiKey && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Komerza API configured</span>
                    </div>
                  )}
                  
                  {!apiKey && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">API key not found</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Button */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 border border-[#1a1a1a]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2563eb]" />
                  Integration Test
                </h3>
                
                <button
                  onClick={testKomerzaAPI}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Testing Komerza API...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Test Checkout Creation</span>
                    </>
                  )}
                </button>
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
                    <p><strong>Items:</strong> {result.checkoutConfig?.items?.length || 0} products</p>
                    <p><strong>Theme:</strong> {result.checkoutConfig?.theme || 'auto'}</p>
                    <p><strong>Status:</strong> Ready for Komerza embed</p>
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
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Setup Instructions
                </h3>
                
                <ol className="space-y-2 text-white/70 text-sm list-decimal list-inside">
                  <li>Add Komerza API key to your database settings:</li>
                  <code className="block bg-[#0a0a0a] p-3 rounded text-[#2563eb] text-xs mt-2 overflow-x-auto">
                    Key: eyJhbGciOiJFUzI1NiIsImtpZCI6Ijc3ZDFiNDBkLWE2NzYtNGI1MS1hNTg3LWZiZDE4OGI5YmZkZiIsInR5cCI6IkpXVCJ9...
                  </code>
                  <li>Configure webhook in Komerza dashboard: <code className="text-[#2563eb]">/api/komerza/webhook</code></li>
                  <li>Test checkout flow by adding items to cart and proceeding to checkout</li>
                  <li>Verify Komerza embed modal opens correctly</li>
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
