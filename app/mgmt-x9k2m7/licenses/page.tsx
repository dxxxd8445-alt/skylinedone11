"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Key, Copy, BarChart3, Package, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addLicenseStock, 
  deleteLicenseStock, 
  getLicenses, 
  getStockSummary,
  type License,
  type StockSummary,
  type AddStockResult
} from "@/app/actions/admin-license-stock";
import { createClient } from "@/lib/supabase/client";
import { getVariantsForProduct } from "@/app/actions/admin-products";

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  duration: string;
  price: number;
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Form State - Step-by-step workflow
  const [step, setStep] = useState<"game" | "variant" | "keys">("game");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [keysInput, setKeysInput] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadVariants(selectedProduct);
    } else {
      setVariants([]);
      setSelectedVariant("");
    }
  }, [selectedProduct]);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadLicenses(),
        loadProducts(),
        loadStockSummary()
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function loadLicenses() {
    const result = await getLicenses();
    if (result.success && result.data) {
      setLicenses(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to load licenses",
        variant: "destructive",
      });
    }
  }

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("id, name").order("name");
    if (data) setProducts(data);
  }

  async function loadStockSummary() {
    const result = await getStockSummary();
    if (result.success && result.data) {
      setStockSummary(result.data);
    }
  }

  async function loadVariants(productId: string) {
    setLoadingVariants(true);
    const result = await getVariantsForProduct(productId);
    setLoadingVariants(false);
    
    if (result.success && result.data) {
      setVariants(result.data);
    }
  }

  async function handleAddStock() {
    if (!keysInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one license key",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const keys = keysInput.split("\n").filter(k => k.trim().length > 0);
      
      const result: AddStockResult = await addLicenseStock({
        product_id: selectedProduct || null,
        variant_id: selectedVariant || null,
        license_keys: keys
      });

      console.log("[License Add] Result:", result);

      if (result.success) {
        let message = `✅ Added ${result.added} keys`;
        if (result.skipped > 0) {
          message += ` (${result.skipped} skipped)`;
        }

        toast({
          title: "Success",
          description: message,
        });
        
        // Reset form
        setShowAddModal(false);
        setKeysInput("");
        setSelectedProduct("");
        setSelectedVariant("");
        setStep("game");
        loadData();
      } else {
        console.error("[License Add] Error:", result.error);
        toast({
          title: "Failed to Add Licenses",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[License Add] Exception:", error);
      toast({
        title: "Error Adding Licenses",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this license key from stock?")) return;
    
    const result = await deleteLicenseStock(id);
    if (result.success) {
      toast({ title: "Deleted", description: "License key removed from stock" });
      loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  const columns = [
    {
      key: "license_key",
      label: "License Key",
      render: (item: License) => (
        <div className="flex items-center gap-2 font-mono text-xs">
          <Key className="w-3 h-3 text-white/40" />
          <span className="text-white/80">{item.license_key}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(item.license_key);
              toast({ title: "Copied", description: "License key copied to clipboard" });
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-3 h-3 text-white/40 hover:text-white" />
          </button>
        </div>
      ),
    },
    {
      key: "stock_type",
      label: "Stock Type",
      render: (item: License) => {
        if (!item.product_id && !item.variant_id) {
          return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 border">General</Badge>;
        } else if (item.product_id && !item.variant_id) {
          return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border">Product</Badge>;
        } else if (item.variant_id) {
          return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 border">Variant</Badge>;
        }
        return null;
      },
    },
    {
      key: "product_name",
      label: "Product",
      render: (item: License) => {
        const product = products.find(p => p.id === item.product_id);
        return (
          <div className="text-sm text-white">
            {item.product_name || product?.name || (item.product_id ? "Unknown Product" : "Any Product")}
          </div>
        );
      }
    },
    {
      key: "created_at",
      label: "Added",
      render: (item: License) => (
        <div className="text-sm text-white/40">
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="License Key Inventory" subtitle="Stock and manage license keys for your products">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">License Key Inventory</h1>
              <p className="text-white/60">Stock and manage license keys for your games</p>
            </div>
            <Button
              onClick={() => {
                setShowAddModal(true);
                setStep("game");
                setSelectedProduct("");
                setSelectedVariant("");
                setKeysInput("");
              }}
              className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white border-0 px-6 py-2 h-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Stock Keys
            </Button>
          </div>

          {/* Quick Stats */}
          {stockSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Total in Stock</div>
                <div className="text-2xl font-bold text-emerald-400">{stockSummary.total_stock}</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">General Stock</div>
                <div className="text-2xl font-bold text-blue-400">{stockSummary.general_stock}</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Product-Specific</div>
                <div className="text-2xl font-bold text-green-400">{stockSummary.product_specific}</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Variant-Specific</div>
                <div className="text-2xl font-bold text-purple-400">{stockSummary.variant_specific}</div>
              </div>
            </div>
          )}
        </div>

        {/* License Keys Table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <DataTable
            data={licenses}
            columns={columns}
            searchKey="license_key"
            searchPlaceholder="Search license keys..."
            actions={(item) => (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                title="Delete from Stock"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          />
        </div>

        {/* Stock Modal - Step-by-step workflow */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Stock License Keys</DialogTitle>
              <DialogDescription className="text-white/50 mt-2">
                {step === "game" && "Step 1: Select a game"}
                {step === "variant" && "Step 2: Select duration/variant"}
                {step === "keys" && "Step 3: Enter license keys"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === "game" || step === "variant" || step === "keys" ? "bg-[#dc2626] text-white" : "bg-[#262626] text-white/40"}`}>
                  1
                </div>
                <div className={`flex-1 h-1 ${step === "variant" || step === "keys" ? "bg-[#dc2626]" : "bg-[#262626]"}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === "variant" || step === "keys" ? "bg-[#dc2626] text-white" : "bg-[#262626] text-white/40"}`}>
                  2
                </div>
                <div className={`flex-1 h-1 ${step === "keys" ? "bg-[#dc2626]" : "bg-[#262626]"}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === "keys" ? "bg-[#dc2626] text-white" : "bg-[#262626] text-white/40"}`}>
                  3
                </div>
              </div>

              {/* Step 1: Game Selection */}
              {step === "game" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-3 block">Select Game</label>
                    <select
                      className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-white focus:border-[#dc2626] focus:outline-none transition-colors"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Choose a game...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      Select the game you want to stock keys for. You can choose a specific duration variant in the next step.
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Variant/Duration Selection */}
              {step === "variant" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-3 block">Select Duration</label>
                    {loadingVariants ? (
                      <div className="text-center py-4 text-white/60">Loading variants...</div>
                    ) : variants.length > 0 ? (
                      <select
                        className="w-full bg-[#1a1a1a] border border-[#262626] rounded-lg p-3 text-white focus:border-[#dc2626] focus:outline-none transition-colors"
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                      >
                        <option value="">Choose a duration...</option>
                        {variants.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.duration} - ${(v.price / 100).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-center py-4 text-white/60">No variants available for this game</div>
                    )}
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-300">
                      Keys will be assigned to this specific duration. You can also stock general keys that work for any duration.
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Key Input */}
              {step === "keys" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-3 block">License Keys</label>
                    <Textarea
                      placeholder="Paste your license keys here&#10;One key per line&#10;Any format accepted"
                      className="bg-[#1a1a1a] border-[#262626] text-white min-h-[200px] font-mono text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                      value={keysInput}
                      onChange={(e) => setKeysInput(e.target.value)}
                    />
                    <div className="flex justify-between text-xs text-white/40 mt-2">
                      <span>{keysInput.split("\n").filter(k => k.trim().length > 0).length} keys ready</span>
                      <span>Any format accepted</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3">
              {step !== "game" && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (step === "variant") setStep("game");
                    else if (step === "keys") setStep("variant");
                  }}
                  className="text-white/70 hover:text-white"
                >
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              {step !== "keys" && (
                <Button
                  onClick={() => {
                    if (step === "game" && selectedProduct) setStep("variant");
                    else if (step === "variant") setStep("keys");
                  }}
                  disabled={
                    (step === "game" && !selectedProduct) ||
                    (step === "variant" && !selectedVariant && variants.length > 0)
                  }
                  className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === "keys" && (
                <Button
                  onClick={handleAddStock}
                  disabled={processing || !keysInput.trim()}
                  className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
                >
                  {processing ? "Adding..." : "Add to Stock"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}