"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestStorrikPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [storrikLoaded, setStorrikLoaded] = useState(false);
  const [storrikConfigured, setStorrikConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testProductId, setTestProductId] = useState("PROD_xxx");
  const [testVariantId, setTestVariantId] = useState("VAR_xxx");

  useEffect(() => {
    // Check if API key is configured
    fetch("/api/settings/storrik-key")
      .then(res => res.json())
      .then(data => {
        setApiKey(data.apiKey);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch API key:", err);
        setLoading(false);
      });

    // Check if Storrik script loaded
    const checkStorrik = setInterval(() => {
      if (typeof window !== "undefined" && window.storrik) {
        setStorrikLoaded(true);
        clearInterval(checkStorrik);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkStorrik);
    }, 5000);

    return () => clearInterval(checkStorrik);
  }, []);

  useEffect(() => {
    if (storrikLoaded && apiKey) {
      setStorrikConfigured(true);
    }
  }, [storrikLoaded, apiKey]);

  const handleTestCheckout = () => {
    if (!window.storrik) {
      alert("Storrik not loaded!");
      return;
    }

    if (!testProductId || !testVariantId) {
      alert("Please enter Product ID and Variant ID");
      return;
    }

    window.storrik.pay(testProductId, testVariantId, {
      style: "normal",
      colors: {
        primary: "#2563eb",
        buttonText: "#ffffff",
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Storrik Integration Test</h1>
            
            {loading ? (
              <div className="flex items-center gap-3 text-white/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading configuration...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* API Key Status */}
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div>
                    <p className="text-white font-semibold">Storrik API Key</p>
                    <p className="text-white/50 text-sm">
                      {apiKey ? `Configured: ${apiKey.substring(0, 10)}...` : "Not configured"}
                    </p>
                  </div>
                  {apiKey ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>

                {/* Script Loaded Status */}
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div>
                    <p className="text-white font-semibold">Storrik Script</p>
                    <p className="text-white/50 text-sm">
                      {storrikLoaded ? "Loaded successfully" : "Not loaded"}
                    </p>
                  </div>
                  {storrikLoaded ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>

                {/* Configuration Status */}
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div>
                    <p className="text-white font-semibold">Integration Status</p>
                    <p className="text-white/50 text-sm">
                      {storrikConfigured ? "Ready to accept payments" : "Not ready"}
                    </p>
                  </div>
                  {storrikConfigured ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>

                {/* Test Checkout */}
                {storrikConfigured && (
                  <div className="mt-8 p-6 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-4">Test Checkout</h2>
                    <p className="text-white/60 text-sm mb-4">
                      Enter your Storrik Product ID and Variant ID to test the checkout flow
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Product ID
                        </label>
                        <input
                          type="text"
                          value={testProductId}
                          onChange={(e) => setTestProductId(e.target.value)}
                          placeholder="PROD_xxxxxxxxxxxxx"
                          className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors font-mono"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Variant ID (optional)
                        </label>
                        <input
                          type="text"
                          value={testVariantId}
                          onChange={(e) => setTestVariantId(e.target.value)}
                          placeholder="VAR_xxxxxxxxxxxxx"
                          className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors font-mono"
                        />
                      </div>

                      <button
                        onClick={handleTestCheckout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50"
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Open Test Checkout</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Setup Instructions */}
                {!storrikConfigured && (
                  <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h2 className="text-xl font-bold text-yellow-400 mb-4">Setup Required</h2>
                    <ol className="space-y-2 text-white/70 text-sm list-decimal list-inside">
                      <li>Run the SQL script: <code className="text-[#2563eb]">ADD_STORRIK_PAYMENT.sql</code></li>
                      <li>Get your Storrik API key from <a href="https://storrik.com/dashboard" target="_blank" className="text-[#2563eb] hover:underline">Storrik Dashboard</a></li>
                      <li>Go to <a href="/mgmt-x9k2m7/settings" className="text-[#2563eb] hover:underline">Admin Settings</a></li>
                      <li>Enter your Storrik Public API Key (PK_xxx)</li>
                      <li>Save settings and refresh this page</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
