"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Trash2, RefreshCw, Users, Power, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [forcingLogout, setForcingLogout] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        throw new Error("Failed to load customers");
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string, email: string) => {
    console.log(`[Frontend] Delete button clicked for customer ID:`, id, typeof id);
    
    if (!id || id === 'undefined') {
      alert("❌ Error: Customer ID is missing. Please refresh the page and try again.");
      return;
    }
    
    setSelectedCustomer({ id, email, username: '', created_at: '' });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    
    setDeleting(true);
    
    try {
      console.log(`[Frontend] Attempting to delete customer: ${selectedCustomer.id}`);
      
      const url = `/api/admin/customers/${selectedCustomer.id}`;
      console.log(`[Frontend] Calling DELETE ${url}`);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log(`[Frontend] Response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Frontend] Response data:`, data);

      if (response.ok) {
        console.log(`[Frontend] Delete successful! Reloading customers...`);
        setDeleteModalOpen(false);
        await loadCustomers();
        toast({
          title: "Success",
          description: `Customer ${selectedCustomer.email} deleted successfully`,
        });
      } else {
        const errorMsg = data.details || data.error || 'Unknown error';
        console.error(`[Frontend] Delete failed:`, errorMsg);
        toast({
          title: "Error",
          description: `Failed to delete customer: ${errorMsg}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[Frontend] Exception during delete:", error);
      toast({
        title: "Error",
        description: `Error deleting customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const forceLogout = async (customer: Customer) => {
    if (!confirm(`Force logout ${customer.email}? This will end their current session.`)) {
      return;
    }

    setForcingLogout(true);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/force-logout`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Forced logout for ${customer.email}`,
        });
      } else {
        throw new Error(data.error || "Failed to force logout");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to force logout customer",
        variant: "destructive",
      });
    } finally {
      setForcingLogout(false);
    }
  };

  const openResetPasswordModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewPassword("");
    setResetPasswordModalOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedCustomer) return;

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setResetting(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetPasswordModalOpen(false);
        toast({
          title: "Success",
          description: `Password reset for ${selectedCustomer.email}`,
        });
      } else {
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminShell title="Customers" subtitle="Manage customer accounts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="text-white/60 mt-1">Manage customer accounts and data</p>
          </div>
          <Button
            onClick={loadCustomers}
            disabled={loading}
            className="bg-[#2563eb] hover:bg-[#3b82f6] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-white">{customers.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#2563eb]/10">
                <Users className="w-6 h-6 text-[#2563eb]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search customers by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
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
                      <TableHead className="text-white/60">Email</TableHead>
                      <TableHead className="text-white/60">Username</TableHead>
                      <TableHead className="text-white/60">Orders</TableHead>
                      <TableHead className="text-white/60">Licenses</TableHead>
                      <TableHead className="text-white/60">Created</TableHead>
                      <TableHead className="text-white/60 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50">
                        <TableCell className="text-white font-mono text-sm">{customer.email}</TableCell>
                        <TableCell className="text-white">{customer.username}</TableCell>
                        <TableCell className="text-white/60 text-sm">0</TableCell>
                        <TableCell className="text-white/60 text-sm">0</TableCell>
                        <TableCell className="text-white/60 text-sm">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => openResetPasswordModal(customer)}
                              disabled={resetting}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-3 py-1"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4 mr-1" />
                              Reset
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => forceLogout(customer)}
                              disabled={forcingLogout}
                              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1"
                              title="Force Logout"
                            >
                              <Power className="w-4 h-4 mr-1" />
                              Logout
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deleteCustomer(customer.id, customer.email)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCustomers.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-[#2563eb]" />
                          </div>
                          <p className="text-white/60">No customers found</p>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete Account?</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <p className="text-white/80 text-center mb-2">
              Do you want to delete this account?
            </p>
            <p className="text-white/60 text-center text-sm font-mono">
              {selectedCustomer?.email}
            </p>
          </div>

          <DialogFooter className="gap-3 flex justify-center">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              className="bg-black hover:bg-gray-900 text-white font-semibold px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordModalOpen} onOpenChange={setResetPasswordModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-yellow-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Set a new password for this customer account
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label className="text-white/80 mb-2 block">Customer Email</Label>
              <p className="text-white font-mono text-sm bg-[#1a1a1a] px-3 py-2 rounded border border-[#262626]">
                {selectedCustomer?.email}
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-white/80 mb-2 block">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="bg-[#1a1a1a] border-[#262626] text-white"
                disabled={resetting}
              />
              <p className="text-white/40 text-xs mt-1">
                Minimum 6 characters required
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 flex justify-center">
            <Button
              onClick={() => setResetPasswordModalOpen(false)}
              disabled={resetting}
              variant="outline"
              className="bg-transparent border-[#262626] text-white hover:bg-[#1a1a1a] px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmResetPassword}
              disabled={resetting || !newPassword || newPassword.length < 6}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6"
            >
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
