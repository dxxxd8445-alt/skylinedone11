"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  Eye,
  Camera,
  Save,
  ChevronRight,
  Key,
  Mail,
  Phone,
  Menu,
  X,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Download,
  Copy,
  ExternalLink,
  Users,
  DollarSign,
  MousePointer,
  BarChart,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TabType = "dashboard" | "orders" | "delivered" | "loaders" | "affiliate" | "profile" | "security";

interface Order {
  id: string;
  order_number: string;
  date: string;
  status: string;
  total: number;
  product: string;
  duration: string;
  paymentMethod?: string;
  licenseKey?: string;
}

interface License {
  id: string;
  license_key: string;
  product_name: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  order_id: string | null;
}

interface AffiliateData {
  id: string;
  affiliate_code: string;
  commission_rate: number;
  status: string;
  payment_email: string;
  payment_method: string;
  crypto_type?: string;
  cashapp_tag?: string;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_referrals: number;
  total_sales: number;
}

interface AffiliateStats {
  totalClicks: number;
  totalReferrals: number;
  conversionRate: number;
  pendingEarnings: number;
  approvedEarnings: number;
  paidEarnings: number;
  totalEarnings: number;
}

interface AffiliateReferral {
  id: string;
  referred_email: string;
  commission_amount: number;
  status: string;
  created_at: string;
  order_amount: number;
}


export default function AccountPage() {
  const { user, signOut, isLoading, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [ordersLicensesLoading, setOrdersLicensesLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Affiliate state
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [affiliateReferrals, setAffiliateReferrals] = useState<AffiliateReferral[]>([]);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    payment_email: "",
    payment_method: "paypal",
    crypto_type: "",
    cashapp_tag: ""
  });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.username ?? "", email: user.email ?? "", phone: user.phone ?? "" });
      setProfileImage(user.avatarUrl ?? null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setOrdersLicensesLoading(true);
    fetch("/api/store-auth/orders-licenses")
      .then((r) => r.json())
      .then((data) => {
        const rawOrders = data.orders ?? [];
        const rawLicenses = data.licenses ?? [];
        setLicenses(rawLicenses);
        const byOrderId = new Map<string, License>();
        rawLicenses.forEach((l: License) => { if (l.order_id) byOrderId.set(l.order_id, l); });
        setOrders(
          rawOrders.map((o: { id: string; order_number: string; product_name: string; duration: string; amount: number; status: string; created_at: string }) => ({
            id: o.id,
            order_number: o.order_number,
            date: o.created_at,
            status: o.status,
            total: o.amount,
            product: o.product_name,
            duration: o.duration,
            licenseKey: byOrderId.get(o.id)?.license_key,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setOrdersLicensesLoading(false));
  }, [user]);

  // Load affiliate data when affiliate tab is active
  useEffect(() => {
    if (activeTab === "affiliate" && user) {
      loadAffiliateData();
    }
  }, [activeTab, user]);

  const loadAffiliateData = async () => {
    setAffiliateLoading(true);
    try {
      const response = await fetch("/api/affiliate/stats");
      if (response.ok) {
        const data = await response.json();
        setAffiliateData(data.affiliate);
        setAffiliateStats(data.stats);
        setAffiliateReferrals(data.recentReferrals);
      } else if (response.status === 404) {
        // User doesn't have an affiliate account yet
        setAffiliateData(null);
      }
    } catch (error) {
      console.error("Failed to load affiliate data:", error);
    } finally {
      setAffiliateLoading(false);
    }
  };

  const handleAffiliateRegister = async () => {
    // Validate based on payment method
    if (affiliateForm.payment_method === 'paypal' && !affiliateForm.payment_email) {
      alert("Please enter your PayPal email");
      return;
    }
    
    if (affiliateForm.payment_method === 'cashapp' && !affiliateForm.cashapp_tag) {
      alert("Please enter your Cash App tag (e.g., $YourTag)");
      return;
    }
    
    if (affiliateForm.payment_method === 'crypto') {
      if (!affiliateForm.crypto_type) {
        alert("Please select a cryptocurrency type");
        return;
      }
      if (!affiliateForm.payment_email) {
        alert("Please enter your crypto address");
        return;
      }
    }

    setIsRegistering(true);
    try {
      console.log('Sending registration data:', affiliateForm);
      
      const response = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(affiliateForm)
      });

      const data = await response.json();
      
      console.log('Registration response:', { status: response.status, data });
      
      if (response.ok) {
        await loadAffiliateData(); // Reload data
        alert("Affiliate account created successfully!");
        // Reset form
        setAffiliateForm({
          payment_email: "",
          payment_method: "paypal",
          crypto_type: "",
          cashapp_tag: ""
        });
      } else {
        alert(data.error || "Failed to create affiliate account");
      }
    } catch (err) {
      console.error("Affiliate registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Failed to create affiliate account: " + errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const copyAffiliateLink = (code: string) => {
    const link = `https://skylinecheats.org?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedKey("affiliate-link");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setRedirecting(true);
      router.replace("/");
    }
  }, [isLoading, user]);

  if (redirecting || (!isLoading && !user)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1a1a1a] rounded-full animate-spin" />
          <div className="w-16 h-16 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1a1a1a] rounded-full animate-spin" />
          <div className="w-16 h-16 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      console.log('[Profile] Saving profile with image:', profileImage ? 'Yes' : 'No');
      
      const result = await updateProfile({
        username: profileForm.fullName,
        avatarUrl: profileImage || undefined,
        phone: profileForm.phone,
      });
      
      console.log('[Profile] Update result:', result);
      
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('[Profile] Update failed:', result.error);
        alert(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    const result = await changePassword(securityForm.currentPassword, securityForm.newPassword);

    setIsChangingPassword(false);

    if (result.success) {
      setPasswordSuccess(true);
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } else {
      setPasswordError(result.error || "Failed to change password");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "pending":
      case "paid":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0 flex items-center gap-1.5">
            <Clock className="w-3 h-3 animate-pulse" />
            In Progress
          </Badge>
        );
      case "failed":
      case "refunded":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            {status}
          </Badge>
        );
    }
  };

  const stats = {
    totalOrders: orders.length,
    inProgress: orders.filter((o) => o.status === "pending" || o.status === "paid").length,
    completed: orders.filter((o) => o.status === "completed").length,
    deliveredCount: licenses.length,
  };

  const navItems = [
    { id: "dashboard" as TabType, icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders" as TabType, icon: ShoppingBag, label: "Orders" },
    { id: "delivered" as TabType, icon: Package, label: "Delivered" },
    { id: "loaders" as TabType, icon: Download, label: "Loaders" },
    { id: "affiliate" as TabType, icon: Users, label: "Affiliate" },
    { id: "profile" as TabType, icon: User, label: "Profile" },
    { id: "security" as TabType, icon: Shield, label: "Security" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Enhanced Welcome Header */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#2563eb]/10">
                        <Sparkles className="w-5 h-5 text-[#2563eb]" />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Welcome back, {user?.username || "User"}!
                      </h1>
                    </div>
                    <p className="text-white/60 mt-2">
                      Here&apos;s what&apos;s happening with your account
                    </p>
                  </div>
                  <div className="hidden md:block p-3 rounded-xl bg-[#2563eb]/10">
                    <TrendingUp className="w-8 h-8 text-[#2563eb]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { 
                  icon: Package, 
                  label: "Total Orders", 
                  value: stats.totalOrders, 
                  gradient: "from-[#2563eb]/20 to-transparent",
                  iconBg: "bg-[#2563eb]/10",
                  iconColor: "text-[#2563eb]"
                },
                { 
                  icon: Clock, 
                  label: "In Progress", 
                  value: stats.inProgress,
                  gradient: "from-yellow-500/20 to-transparent",
                  iconBg: "bg-yellow-500/10",
                  iconColor: "text-yellow-500"
                },
                { 
                  icon: CheckCircle2, 
                  label: "Completed", 
                  value: stats.completed,
                  gradient: "from-green-500/20 to-transparent",
                  iconBg: "bg-green-500/10",
                  iconColor: "text-green-500"
                },
                { 
                  icon: Key, 
                  label: "License Keys", 
                  value: stats.deliveredCount,
                  gradient: "from-blue-500/20 to-transparent",
                  iconBg: "bg-blue-500/10",
                  iconColor: "text-blue-500"
                },
              ].map((stat, index) => (
                <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
                  <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#2563eb]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400 opacity-50" />
                    </div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Recent Orders */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#1a1a1a]">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#2563eb]" />
                    Recent Orders
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="text-[#2563eb] hover:text-[#3b82f6] hover:bg-[#2563eb]/10"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order, index) => (
                        <div
                          key={order.id}
                          className="group/item relative"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-xl blur opacity-0 group-hover/item:opacity-100 transition duration-300" />
                          <div className="relative flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#2563eb]/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-[#2563eb]/10 group-hover/item:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-[#2563eb]" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{order.product}</p>
                                <p className="text-sm text-white/50 font-mono">
                                  {order.order_number} • {order.duration}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="text-sm text-white/60 mt-1 font-semibold">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!ordersLicensesLoading && orders.length === 0 && (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-[#2563eb]" />
                          </div>
                          <p className="text-white/60">No orders yet</p>
                          <p className="text-white/40 text-sm mt-1">Your orders will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <ShoppingBag className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Your Orders</h1>
                    <p className="text-white/60 mt-1">View and manage your order history</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-0">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                            <TableHead className="text-white/60 font-semibold">Order ID</TableHead>
                            <TableHead className="text-white/60 font-semibold">Product</TableHead>
                            <TableHead className="text-white/60 font-semibold">Date</TableHead>
                            <TableHead className="text-white/60 font-semibold">Status</TableHead>
                            <TableHead className="text-white/60 font-semibold">Total</TableHead>
                            <TableHead className="text-white/60 font-semibold text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50 group/row transition-colors">
                              <TableCell className="font-mono text-white/80">{order.order_number}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-white group-hover/row:text-[#2563eb] transition-colors">{order.product}</p>
                                  <p className="text-sm text-white/50">{order.duration}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/70">
                                {new Date(order.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="font-bold text-white">${order.total.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                  className="text-[#2563eb] hover:text-[#3b82f6] hover:bg-[#2563eb]/10"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {orders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                                  <ShoppingBag className="w-8 h-8 text-[#2563eb]" />
                                </div>
                                <p className="text-white/60">No orders yet</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "delivered":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <Package className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Delivered Licenses</h1>
                    <p className="text-white/60 mt-1">
                      Licenses for purchases under your account email
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-0">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                            <TableHead className="text-white/60 font-semibold">Product</TableHead>
                            <TableHead className="text-white/60 font-semibold">License Key</TableHead>
                            <TableHead className="text-white/60 font-semibold">Status</TableHead>
                            <TableHead className="text-white/60 font-semibold">Expires</TableHead>
                            <TableHead className="text-white/60 font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {licenses.map((l) => (
                            <TableRow key={l.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50 group/row transition-colors">
                              <TableCell className="font-semibold text-white">{l.product_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-sm text-white/80 bg-black/30 px-3 py-1.5 rounded-lg">
                                    {l.license_key}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(l.license_key, l.id)}
                                    className="opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-[#2563eb]/10"
                                  >
                                    {copiedKey === l.id ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-white/60" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={l.status === "active" ? "bg-green-500/20 text-green-400 border-0" : "bg-white/10 text-white/60 border-0"}>
                                  {l.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white/70">
                                {l.expires_at ? new Date(l.expires_at).toLocaleDateString("en-US") : "Never"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/your-invite-code', '_blank')}
                                  className="text-[#2563eb] hover:text-[#3b82f6] hover:bg-[#2563eb]/10"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {licenses.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                                  <Key className="w-8 h-8 text-[#2563eb]" />
                                </div>
                                <p className="text-white/60">No licenses yet</p>
                                <p className="text-white/40 text-sm mt-1">Orders completed under your account email will appear here</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "loaders":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <Download className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Cheat Loaders</h1>
                    <p className="text-white/60 mt-1">Download the latest loader to use your cheats</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-8">
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Main Download Card */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 via-transparent to-blue-500/10 rounded-2xl" />
                      <div className="relative bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#2563eb]/30 rounded-2xl p-8">
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2563eb] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#2563eb]/30">
                              <Download className="w-10 h-10 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">Skyline Loader v1.0</h3>
                            <p className="text-white/60 mb-4">
                              The official Skyline cheat loader. Required to run all Skyline products.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-6">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Latest Version
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                                <Shield className="w-3 h-3 mr-1" />
                                Secure
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 border">
                                <Zap className="w-3 h-3 mr-1" />
                                Fast
                              </Badge>
                            </div>
                            <a
                              href="https://cdn.discordapp.com/attachments/1469886516196147424/1471247056235532583/loader_1.exe?ex=698e3d18&is=698ceb98&hm=8aeb30fdf73ef891b2a425832d6faf2124923183bc26b6ebdfcc13d23a399c7f&"
                              download
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-blue-600 hover:from-blue-600 hover:to-[#2563eb] text-white font-semibold rounded-xl shadow-lg shadow-[#2563eb]/30 transition-all hover:scale-105"
                            >
                              <Download className="w-5 h-5" />
                              Download Loader
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#2563eb]" />
                        How to Use
                      </h4>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2563eb]/20 rounded-full flex items-center justify-center text-[#2563eb] text-sm font-bold">
                            1
                          </div>
                          <div>
                            <p className="text-white font-medium">Download the loader</p>
                            <p className="text-white/60 text-sm">Click the download button above to get the latest version</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2563eb]/20 rounded-full flex items-center justify-center text-[#2563eb] text-sm font-bold">
                            2
                          </div>
                          <div>
                            <p className="text-white font-medium">Run the loader</p>
                            <p className="text-white/60 text-sm">Extract and run loader_1.exe as administrator</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2563eb]/20 rounded-full flex items-center justify-center text-[#2563eb] text-sm font-bold">
                            3
                          </div>
                          <div>
                            <p className="text-white font-medium">Enter your license key</p>
                            <p className="text-white/60 text-sm">Copy your license key from the "Delivered" tab and paste it into the loader</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2563eb]/20 rounded-full flex items-center justify-center text-[#2563eb] text-sm font-bold">
                            4
                          </div>
                          <div>
                            <p className="text-white font-medium">Start your game</p>
                            <p className="text-white/60 text-sm">Launch your game and enjoy your cheat!</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    {/* Support */}
                    <div className="bg-gradient-to-br from-[#2563eb]/10 to-blue-500/5 border border-[#2563eb]/20 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#2563eb]/20 rounded-xl flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-[#2563eb]" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2">Need Help?</h4>
                          <p className="text-white/60 mb-4">
                            Join our Discord server for support, updates, and to connect with the community.
                          </p>
                          <a
                            href="https://discord.gg/skylineggs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            Join Discord
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "affiliate":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <Users className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Affiliate Program</h1>
                    <p className="text-white/60 mt-1">Earn commissions by referring customers</p>
                  </div>
                </div>
              </div>
            </div>

            {affiliateLoading ? (
              <div className="py-12 flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                  <div className="w-12 h-12 border-t-4 border-[#2563eb] rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : !affiliateData ? (
              // Registration Form
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                  <CardHeader className="border-b border-[#1a1a1a]">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Award className="w-5 h-5 text-[#2563eb]" />
                      Join Our Affiliate Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-[#0a0a0a]/50 rounded-xl border border-[#1a1a1a]">
                          <div className="w-12 h-12 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="w-6 h-6 text-[#2563eb]" />
                          </div>
                          <h3 className="font-bold text-white mb-2">5% Commission</h3>
                          <p className="text-white/60 text-sm">Earn 5% on every sale you refer</p>
                        </div>
                        <div className="text-center p-6 bg-[#0a0a0a]/50 rounded-xl border border-[#1a1a1a]">
                          <div className="w-12 h-12 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <BarChart className="w-6 h-6 text-[#2563eb]" />
                          </div>
                          <h3 className="font-bold text-white mb-2">Real-time Tracking</h3>
                          <p className="text-white/60 text-sm">Monitor clicks and conversions</p>
                        </div>
                        <div className="text-center p-6 bg-[#0a0a0a]/50 rounded-xl border border-[#1a1a1a]">
                          <div className="w-12 h-12 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-6 h-6 text-[#2563eb]" />
                          </div>
                          <h3 className="font-bold text-white mb-2">Fast Payouts</h3>
                          <p className="text-white/60 text-sm">Monthly payments via PayPal</p>
                        </div>
                      </div>

                      <div className="max-w-md mx-auto space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="payment_method" className="text-white font-medium">
                            Payment Method
                          </Label>
                          <select
                            id="payment_method"
                            value={affiliateForm.payment_method}
                            onChange={(e) => setAffiliateForm({ ...affiliateForm, payment_method: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                          >
                            <option value="paypal">PayPal</option>
                            <option value="cashapp">Cash App</option>
                            <option value="crypto">Cryptocurrency</option>
                          </select>
                        </div>

                        {affiliateForm.payment_method === 'paypal' && (
                          <div className="space-y-2">
                            <Label htmlFor="payment_email" className="text-white font-medium">
                              PayPal Email
                            </Label>
                            <Input
                              id="payment_email"
                              type="email"
                              value={affiliateForm.payment_email}
                              onChange={(e) => setAffiliateForm({ ...affiliateForm, payment_email: e.target.value })}
                              placeholder="your-paypal@email.com"
                              className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                          </div>
                        )}

                        {affiliateForm.payment_method === 'cashapp' && (
                          <div className="space-y-2">
                            <Label htmlFor="cashapp_tag" className="text-white font-medium">
                              Cash App Tag
                            </Label>
                            <Input
                              id="cashapp_tag"
                              type="text"
                              value={affiliateForm.cashapp_tag}
                              onChange={(e) => setAffiliateForm({ ...affiliateForm, cashapp_tag: e.target.value })}
                              placeholder="$YourCashAppTag"
                              className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                            />
                          </div>
                        )}

                        {affiliateForm.payment_method === 'crypto' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="crypto_type" className="text-white font-medium">
                                Cryptocurrency Type
                              </Label>
                              <select
                                id="crypto_type"
                                value={affiliateForm.crypto_type}
                                onChange={(e) => setAffiliateForm({ ...affiliateForm, crypto_type: e.target.value })}
                                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                              >
                                <option value="">Select Cryptocurrency</option>
                                <option value="btc">Bitcoin (BTC)</option>
                                <option value="eth">Ethereum (ETH)</option>
                                <option value="ltc">Litecoin (LTC)</option>
                                <option value="bch">Bitcoin Cash (BCH)</option>
                                <option value="xrp">Ripple (XRP)</option>
                                <option value="ada">Cardano (ADA)</option>
                                <option value="dot">Polkadot (DOT)</option>
                                <option value="matic">Polygon (MATIC)</option>
                                <option value="sol">Solana (SOL)</option>
                                <option value="usdt">Tether (USDT)</option>
                                <option value="usdc">USD Coin (USDC)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="crypto_address" className="text-white font-medium">
                                {affiliateForm.crypto_type ? `${affiliateForm.crypto_type.toUpperCase()} Address` : 'Crypto Address'}
                              </Label>
                              <Input
                                id="crypto_address"
                                type="text"
                                value={affiliateForm.payment_email}
                                onChange={(e) => setAffiliateForm({ ...affiliateForm, payment_email: e.target.value })}
                                placeholder={`Enter your ${affiliateForm.crypto_type?.toUpperCase() || 'crypto'} address`}
                                className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 font-mono text-sm"
                              />
                            </div>
                          </>
                        )}

                        <Button
                          onClick={handleAffiliateRegister}
                          disabled={isRegistering}
                          className="w-full py-6 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-bold text-lg shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 transition-all"
                        >
                          {isRegistering ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <Award className="w-5 h-5 mr-2" />
                              Join Affiliate Program
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Affiliate Dashboard
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { 
                      icon: DollarSign, 
                      label: "Total Earnings", 
                      value: `$${affiliateStats?.totalEarnings.toFixed(2) || '0.00'}`, 
                      gradient: "from-green-500/20 to-transparent",
                      iconBg: "bg-green-500/10",
                      iconColor: "text-green-500"
                    },
                    { 
                      icon: MousePointer, 
                      label: "Total Clicks", 
                      value: affiliateStats?.totalClicks || 0,
                      gradient: "from-blue-500/20 to-transparent",
                      iconBg: "bg-blue-500/10",
                      iconColor: "text-blue-500"
                    },
                    { 
                      icon: Users, 
                      label: "Referrals", 
                      value: affiliateStats?.totalReferrals || 0,
                      gradient: "from-purple-500/20 to-transparent",
                      iconBg: "bg-purple-500/10",
                      iconColor: "text-purple-500"
                    },
                    { 
                      icon: TrendingUp, 
                      label: "Conversion Rate", 
                      value: `${affiliateStats?.conversionRate.toFixed(1) || '0.0'}%`,
                      gradient: "from-[#2563eb]/20 to-transparent",
                      iconBg: "bg-[#2563eb]/10",
                      iconColor: "text-[#2563eb]"
                    },
                  ].map((stat, index) => (
                    <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
                      <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#2563eb]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                        </div>
                        <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Affiliate Link */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                    <CardHeader className="border-b border-[#1a1a1a]">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <LinkIcon className="w-5 h-5 text-[#2563eb]" />
                        Your Affiliate Link
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                          <code className="flex-1 font-mono text-white text-sm break-all">
                            https://skylinecheats.org?ref={affiliateData.affiliate_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAffiliateLink(affiliateData.affiliate_code)}
                            className="hover:bg-[#2563eb]/10"
                          >
                            {copiedKey === "affiliate-link" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <Copy className="w-5 h-5 text-white/60" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>Commission Rate:</span>
                          <Badge className="bg-[#2563eb]/20 text-[#2563eb] border-0">
                            {affiliateData.commission_rate}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Method Info */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                    <CardHeader className="border-b border-[#1a1a1a]">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <CreditCard className="w-5 h-5 text-[#2563eb]" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                          <p className="text-white/60 text-sm mb-2">Method</p>
                          <p className="text-white font-semibold capitalize">
                            {affiliateData.payment_method === 'paypal' && '💳 PayPal'}
                            {affiliateData.payment_method === 'cashapp' && '💰 Cash App'}
                            {affiliateData.payment_method === 'crypto' && '₿ Cryptocurrency'}
                          </p>
                        </div>
                        
                        {affiliateData.payment_method === 'paypal' && (
                          <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                            <p className="text-white/60 text-sm mb-2">PayPal Email</p>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-mono text-sm break-all flex-1">{affiliateData.payment_email}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(affiliateData.payment_email || '', 'paypal-email')}
                                className="hover:bg-[#2563eb]/10"
                              >
                                {copiedKey === 'paypal-email' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white/60" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {affiliateData.payment_method === 'cashapp' && (
                          <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                            <p className="text-white/60 text-sm mb-2">Cash App Tag</p>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-mono text-sm flex-1">{affiliateData.cashapp_tag}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(affiliateData.cashapp_tag || '', 'cashapp-tag')}
                                className="hover:bg-[#2563eb]/10"
                              >
                                {copiedKey === 'cashapp-tag' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-white/60" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {affiliateData.payment_method === 'crypto' && (
                          <>
                            <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                              <p className="text-white/60 text-sm mb-2">Cryptocurrency Type</p>
                              <p className="text-white font-semibold uppercase">{affiliateData.crypto_type}</p>
                            </div>
                            <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                              <p className="text-white/60 text-sm mb-2">Wallet Address</p>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-mono text-xs break-all flex-1">{affiliateData.payment_email}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(affiliateData.payment_email || '', 'crypto-address')}
                                  className="hover:bg-[#2563eb]/10"
                                >
                                  {copiedKey === 'crypto-address' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-white/60" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Referrals */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                    <CardHeader className="border-b border-[#1a1a1a]">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <BarChart className="w-5 h-5 text-[#2563eb]" />
                        Recent Referrals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {affiliateReferrals.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                                <TableHead className="text-white/60 font-semibold">Customer</TableHead>
                                <TableHead className="text-white/60 font-semibold">Order Amount</TableHead>
                                <TableHead className="text-white/60 font-semibold">Commission</TableHead>
                                <TableHead className="text-white/60 font-semibold">Status</TableHead>
                                <TableHead className="text-white/60 font-semibold">Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {affiliateReferrals.map((referral) => (
                                <TableRow key={referral.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50 transition-colors">
                                  <TableCell className="text-white/80">{referral.referred_email}</TableCell>
                                  <TableCell className="font-semibold text-white">${referral.order_amount.toFixed(2)}</TableCell>
                                  <TableCell className="font-bold text-green-400">${referral.commission_amount.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge className={
                                      referral.status === 'paid' ? "bg-green-500/20 text-green-400 border-0" :
                                      referral.status === 'approved' ? "bg-blue-500/20 text-blue-400 border-0" :
                                      "bg-yellow-500/20 text-yellow-400 border-0"
                                    }>
                                      {referral.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-white/70">
                                    {new Date(referral.created_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="py-16 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-[#2563eb]" />
                          </div>
                          <p className="text-white/60">No referrals yet</p>
                          <p className="text-white/40 text-sm mt-1">Share your affiliate link to start earning</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <User className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    <p className="text-white/60 mt-1">Manage your personal information</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Enhanced Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#1a1a1a]">
                      <div className="relative group/avatar">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full blur opacity-0 group-hover/avatar:opacity-75 transition duration-500" />
                        <Avatar className="relative w-28 h-28 border-4 border-[#1a1a1a] group-hover/avatar:border-[#2563eb]/50 transition-colors">
                          <AvatarImage src={profileImage || undefined} alt="Profile" />
                          <AvatarFallback className="bg-[#2563eb]/20 text-[#2563eb] text-3xl font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">Profile Picture</h3>
                        <p className="text-sm text-white/60 mb-3">
                          Click on the avatar to upload a new image
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">Max size: 2MB</span>
                          <span className="text-white/30">•</span>
                          <span className="text-xs text-white/50">Formats: JPG, PNG, GIF</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Form Fields */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2 group/input">
                        <Label htmlFor="fullName" className="text-white font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#2563eb] transition-colors" />
                          <Input
                            id="fullName"
                            value={profileForm.fullName}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, fullName: e.target.value })
                            }
                            className="pl-11 bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 group/input">
                        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input
                            id="email"
                            value={profileForm.email}
                            readOnly
                            className="pl-11 bg-[#0a0a0a]/50 border-[#1a1a1a] text-white/50 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-white/40">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2 sm:col-span-2 group/input">
                        <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#2563eb] transition-colors" />
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, phone: e.target.value })
                            }
                            className="pl-11 bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Save Button */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="relative bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 transition-all overflow-hidden group/btn"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      {saveSuccess && (
                        <span className="text-green-400 text-sm flex items-center gap-2 animate-fade-in">
                          <CheckCircle2 className="w-5 h-5" />
                          Changes saved successfully!
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2563eb]/10">
                    <Shield className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Security Settings</h1>
                    <p className="text-white/60 mt-1">Manage your account security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="border-b border-[#1a1a1a]">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="w-5 h-5 text-[#2563eb]" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2 group/input">
                      <Label htmlFor="currentPassword" className="text-white font-medium">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2 group/input">
                      <Label htmlFor="newPassword" className="text-white font-medium">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={securityForm.newPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, newPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2 group/input">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                      />
                    </div>

                    {passwordError && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm animate-shake">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="relative bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 transition-all overflow-hidden group/btn"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        {isChangingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                      {passwordSuccess && (
                        <span className="text-green-400 text-sm flex items-center gap-2 animate-fade-in">
                          <CheckCircle2 className="w-5 h-5" />
                          Password updated!
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2FA Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="border-b border-[#1a1a1a]">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="w-5 h-5 text-[#2563eb]" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">2FA Status</p>
                      <p className="text-sm text-white/60">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0 px-4 py-2">
                      Not Enabled
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 bg-transparent border-[#1a1a1a] hover:bg-[#2563eb]/10 hover:border-[#2563eb] text-white transition-all"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563eb]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Header />

      <main className="relative pt-20 pb-32 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Enhanced Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563eb]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                    <CardContent className="p-6">
                      {/* Enhanced Profile Info */}
                      <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-[#1a1a1a]">
                        <div className="relative group/avatar mb-4">
                          <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition-opacity" />
                          <Avatar className="relative w-24 h-24 border-4 border-[#1a1a1a] ring-2 ring-[#2563eb]/20">
                            <AvatarImage src={profileImage || undefined} alt="Profile" />
                            <AvatarFallback className="bg-[#2563eb]/20 text-[#2563eb] text-2xl font-bold">
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">{user?.username || "User"}</h3>
                        <p className="text-sm text-white/60 break-all">{user?.email}</p>
                        <div className="mt-3 px-3 py-1.5 bg-[#2563eb]/10 rounded-full">
                          <span className="text-xs text-[#2563eb] font-semibold">Premium Member</span>
                        </div>
                      </div>

                      {/* Enhanced Navigation */}
                      <nav className="space-y-1.5">
                        {navItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group/nav overflow-hidden ${
                              activeTab === item.id
                                ? "bg-[#2563eb]/10 text-[#2563eb]"
                                : "text-white/60 hover:bg-[#0a0a0a] hover:text-white"
                            }`}
                          >
                            {activeTab === item.id && (
                              <span className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/20 to-transparent" />
                            )}
                            <item.icon className={`w-5 h-5 relative ${activeTab === item.id ? 'group-hover/nav:scale-110' : ''} transition-transform`} />
                            <span className="relative">{item.label}</span>
                            {activeTab === item.id && (
                              <ChevronRight className="w-4 h-4 ml-auto relative" />
                            )}
                          </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-[#1a1a1a]">
                          <button
                            onClick={handleSignOut}
                            className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-400 hover:bg-blue-500/10 transition-all group/logout overflow-hidden"
                          >
                            <LogOut className="w-5 h-5 group-hover/logout:scale-110 transition-transform" />
                            Logout
                          </button>
                        </div>
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </aside>

            {/* Enhanced Mobile Bottom Tab Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[#1a1a1a] z-40 safe-area-pb">
              <div className="flex items-center justify-around px-2 py-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 active:scale-95 ${
                      activeTab === item.id
                        ? "text-[#2563eb]"
                        : "text-white/60"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${
                      activeTab === item.id ? "bg-[#2563eb]/10 scale-110" : ""
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold truncate">{item.label.split(' ')[0]}</span>
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 text-blue-400 active:scale-95"
                >
                  <div className="p-2 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 pb-24 lg:pb-0">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Enhanced Order Details Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-lg p-0 overflow-hidden mx-4 sm:mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              {/* Enhanced Header with gradient */}
              <div className="relative bg-gradient-to-br from-[#2563eb]/20 via-[#2563eb]/10 to-transparent p-8 pb-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#2563eb]/10 rounded-full blur-3xl" />
                <DialogHeader className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#2563eb]/20 backdrop-blur-sm ring-2 ring-[#2563eb]/30">
                      <Receipt className="w-6 h-6 text-[#2563eb]" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Order Details
                    </DialogTitle>
                  </div>
                  <p className="text-sm text-white/70 font-mono bg-black/30 px-3 py-1.5 rounded-lg inline-block">
                    {selectedOrder.order_number}
                  </p>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-6 -mt-6">
                {/* Product Card */}
                <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-6 border border-[#1a1a1a] hover:border-[#2563eb]/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#2563eb]/10 flex-shrink-0">
                        <Sparkles className="w-7 h-7 text-[#2563eb]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">
                          {selectedOrder.product}
                        </h3>
                        <p className="text-sm text-white/60">{selectedOrder.duration}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-14 sm:pl-0">
                      <p className="text-3xl font-bold text-[#2563eb]">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0a0a0a]/50 rounded-xl p-4 border border-[#1a1a1a] hover:border-[#2563eb]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#2563eb]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Date
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="bg-[#0a0a0a]/50 rounded-xl p-4 border border-[#1a1a1a] hover:border-[#2563eb]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-[#2563eb]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Payment
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      {selectedOrder.paymentMethod || "Crypto"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-[#0a0a0a]/50 rounded-xl p-4 mb-6 border border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#2563eb]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Status
                      </span>
                    </div>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                {/* License Key */}
                {selectedOrder.licenseKey && (
                  <div className="bg-gradient-to-r from-[#2563eb]/10 to-[#2563eb]/5 rounded-2xl p-5 border border-[#2563eb]/30 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Key className="w-5 h-5 text-[#2563eb]" />
                      <span className="text-xs text-[#2563eb] uppercase tracking-wider font-bold">
                        License Key
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-white bg-black/40 rounded-lg px-4 py-3 text-sm select-all break-all">
                        {selectedOrder.licenseKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedOrder.licenseKey!, 'modal')}
                        className="flex-shrink-0 hover:bg-[#2563eb]/10"
                      >
                        {copiedKey === 'modal' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <Button
                  onClick={() => setOrderModalOpen(false)}
                  className="w-full py-6 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-bold text-lg shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/50 transition-all rounded-xl"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
      `}</style>
    </div>
  );
}