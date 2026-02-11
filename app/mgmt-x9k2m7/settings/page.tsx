"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadSettings, saveSettings } from "@/app/actions/admin-settings";

interface Settings {
  site_name: string;
  site_description: string;
  support_email: string;
  maintenance_mode: boolean;
  stripe_api_key: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    site_name: "Skyline Cheats",
    site_description: "Premium undetected cheats for all games",
    support_email: "support@skyline.local",
    maintenance_mode: false,
    stripe_api_key: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    try {
      setLoading(true);
      const result = await loadSettings();

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const result = await saveSettings(settings);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "✅ Success",
        description: "Settings saved to database!",
      });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "❌ Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "❌ Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 12) {
      toast({
        title: "❌ Error",
        description: "Password must be at least 12 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowercase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      toast({
        title: "❌ Error",
        description: "Password must contain uppercase, lowercase, number, and special character",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast({
        title: "✅ Success",
        description: "Password verified! Update ADMIN_PASSWORD in Vercel environment variables.",
      });

      // Show instructions in a more prominent way
      setTimeout(() => {
        alert(`To complete password change:\n\n1. Go to Vercel Dashboard\n2. Select your project\n3. Go to Settings > Environment Variables\n4. Update ADMIN_PASSWORD to: ${passwordData.newPassword}\n5. Redeploy your site\n\nNew Password: ${passwordData.newPassword}`);
      }, 500);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Settings" subtitle="Configure your admin panel">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Settings" subtitle="Configure your admin panel">
      <div className="max-w-4xl space-y-6">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Site Description
              </label>
              <input
                type="text"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#111111] border border-[#262626] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Maintenance Mode</p>
                <p className="text-xs text-white/50">Temporarily disable the site for maintenance</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenance_mode ? "bg-[#2563eb]" : "bg-[#262626]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenance_mode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>Stripe Payment Processor:</strong> Enter your Stripe Publishable API Key below to enable card payments. 
                Get your API key from your Stripe dashboard.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Stripe Publishable API Key (pk_xxx)
              </label>
              <input
                type="text"
                value={settings.stripe_api_key}
                onChange={(e) => setSettings({ ...settings, stripe_api_key: e.target.value })}
                placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                Your Stripe publishable key - safe to use in client-side code
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-orange-400 mb-2">
                <strong>Change Admin Password:</strong> Update your admin dashboard password.
              </p>
              <p className="text-xs text-orange-400/80">
                Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 12 characters)"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
              {passwordData.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordData.newPassword.length >= 12 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={passwordData.newPassword.length >= 12 ? 'text-green-400' : 'text-red-400'}>
                      At least 12 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-red-400'}>
                      Uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-red-400'}>
                      Lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-red-400'}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-red-400'}>
                      Special character
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#2563eb] transition-colors"
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {changingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => loadSettingsData()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2563eb] hover:bg-[#3b82f6] text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
