"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { supabase } from "@/lib/supabase";
import {
  Settings as SettingsIcon,
  LogOut,
  User,
  Mail,
  Calendar,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Crown,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface UserSettings {
  id: string;
  validation_enabled: boolean;
  default_view: "list" | "grid" | "mindmap";
  subscription_tier: "free" | "pro";
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_end_date: string | null;
  ideas_count: number;
  created_at: string;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [validationEnabled, setValidationEnabled] = useState(false);
  const [defaultView, setDefaultView] = useState<"list" | "grid" | "mindmap">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Confirmation dialogs
  const [showDeleteIdeasConfirm, setShowDeleteIdeasConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showDeleteAccountFinalConfirm, setShowDeleteAccountFinalConfirm] = useState(false);
  const [deleteAccountInput, setDeleteAccountInput] = useState("");

  // Subscription management
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setSettings(result.data);
        setValidationEnabled(result.data.validation_enabled);
        setDefaultView(result.data.default_view);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !settings) return;

    try {
      setSaving(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          validation_enabled: validationEnabled,
          default_view: defaultView,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        toast.success("Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const exportIdeas = async () => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/settings/export-ideas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ideacapture-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Ideas exported successfully");
      } else {
        toast.error("Failed to export ideas");
      }
    } catch (error) {
      console.error("Error exporting ideas:", error);
      toast.error("Failed to export ideas");
    }
  };

  const deleteAllIdeas = async () => {
    if (!user) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/settings/delete-ideas", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("All ideas deleted successfully");
        setShowDeleteIdeasConfirm(false);
      } else {
        toast.error(result.error || "Failed to delete ideas");
      }
    } catch (error) {
      console.error("Error deleting ideas:", error);
      toast.error("Failed to delete ideas");
    }
  };

  const deleteAccount = async () => {
    if (!user || deleteAccountInput !== "DELETE") return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/settings/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Account data deleted. Signing out...");
        setTimeout(() => {
          signOut();
        }, 2000);
      } else {
        toast.error(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const hasChanges = settings
    ? validationEnabled !== settings.validation_enabled ||
      defaultView !== settings.default_view
    : false;

  const openBillingPortal = async () => {
    if (!user) return;

    try {
      setLoadingPortal(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error || "Failed to open billing portal");
        setLoadingPortal(false);
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal");
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/subscribe");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold gradient-text text-center mb-8">
          Settings
        </h1>

        {/* Account Information */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-semibold">Account Information</h2>
              <div className="space-y-2 text-sm">
                {user?.email && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.id && (
                  <div className="flex items-center gap-2 text-white/60">
                    <User size={16} />
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                )}
                {user?.created_at && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar size={16} />
                    <span>
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                settings?.subscription_tier === "pro"
                  ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                  : "bg-gray-500/20"
              }`}>
                <Crown size={24} className={
                  settings?.subscription_tier === "pro" ? "text-white" : "text-gray-400"
                } />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Subscription</h2>
                <p className="text-sm text-white/60">
                  {settings?.subscription_tier === "pro"
                    ? "You're on the Pro plan"
                    : "You're on the Free plan"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Plan Info */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/70">Current Plan</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    settings?.subscription_tier === "pro"
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-yellow-400"
                      : "bg-white/10 text-white/80"
                  }`}>
                    {settings?.subscription_tier === "pro" ? "Pro" : "Free"}
                  </span>
                </div>

                {/* Ideas Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Ideas</span>
                  <span className="text-sm text-white">
                    {settings?.ideas_count || 0}
                    {settings?.subscription_tier === "free" && " / 10"}
                    {settings?.subscription_tier === "pro" && " / unlimited"}
                  </span>
                </div>

                {/* Pro-only features */}
                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-white/50 mb-2">Plan Features:</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        settings?.subscription_tier === "pro" ? "bg-primary" : "bg-white/30"
                      }`} />
                      <span className={settings?.subscription_tier === "pro" ? "text-white/90" : "text-white/50"}>
                        {settings?.subscription_tier === "pro" ? "Unlimited" : "10"} ideas max
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        settings?.subscription_tier === "pro" ? "bg-primary" : "bg-white/30"
                      }`} />
                      <span className={settings?.subscription_tier === "pro" ? "text-white/90" : "text-white/50"}>
                        {settings?.subscription_tier === "pro" ? "5" : "2"}-minute voice recordings
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        settings?.subscription_tier === "pro" ? "bg-primary" : "bg-white/30"
                      }`} />
                      <span className={settings?.subscription_tier === "pro" ? "text-white/90" : "text-white/50"}>
                        {settings?.subscription_tier === "pro" ? "5" : "3"} refinement questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        settings?.subscription_tier === "pro" ? "bg-primary" : "bg-red-500/50"
                      }`} />
                      <span className={settings?.subscription_tier === "pro" ? "text-white/90" : "text-white/50"}>
                        AI validation {settings?.subscription_tier === "pro" ? "included" : "not available"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscription end date for Pro */}
                {settings?.subscription_tier === "pro" && settings?.subscription_end_date && (
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-sm text-white/70">Renews on</span>
                    <span className="text-sm text-white">
                      {new Date(settings.subscription_end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {settings?.subscription_tier === "free" ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  <Sparkles size={20} className="mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openBillingPortal}
                  loading={loadingPortal}
                  disabled={loadingPortal}
                >
                  <CreditCard size={20} className="mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <SettingsIcon size={24} className="text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Preferences</h2>
            </div>

            <div className="space-y-6">
              {/* Validation Toggle */}
              <Toggle
                enabled={validationEnabled}
                onChange={setValidationEnabled}
                label="Auto-Validation"
                description="Automatically validate new ideas with AI analysis"
              />

              {/* Default View */}
              <div className="space-y-3">
                <label className="text-base font-medium text-white">
                  Default View
                </label>
                <p className="text-sm text-white/60">
                  Choose how you want to view your ideas (for future use)
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "list", label: "List" },
                    { value: "grid", label: "Grid" },
                    { value: "mindmap", label: "Mind Map" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDefaultView(option.value as "list" | "grid" | "mindmap")
                      }
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        defaultView === option.value
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              {hasChanges && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={saveSettings}
                  loading={saving}
                  disabled={saving}
                >
                  <Save size={20} className="mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Download size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold">Data Management</h2>
            </div>

            <div className="space-y-4">
              {/* Export Ideas */}
              <div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={exportIdeas}
                >
                  <Download size={20} className="mr-2" />
                  Export All Ideas as JSON
                </Button>
                <p className="text-sm text-white/60 mt-2">
                  Download all your ideas in JSON format for backup or transfer
                </p>
              </div>

              {/* Delete All Ideas */}
              <div>
                {!showDeleteIdeasConfirm ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => setShowDeleteIdeasConfirm(true)}
                    >
                      <Trash2 size={20} className="mr-2" />
                      Delete All Ideas
                    </Button>
                    <p className="text-sm text-white/60 mt-2">
                      Permanently delete all your ideas (cannot be undone)
                    </p>
                  </>
                ) : (
                  <div className="space-y-3 p-4 rounded-lg border-2 border-red-500/50 bg-red-500/10">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={20} />
                      <p className="font-semibold">Are you sure?</p>
                    </div>
                    <p className="text-sm text-white/80">
                      This will permanently delete all your ideas. This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={deleteAllIdeas}
                      >
                        Yes, Delete All
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setShowDeleteIdeasConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Account */}
              <div>
                {!showDeleteAccountConfirm ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => setShowDeleteAccountConfirm(true)}
                    >
                      <AlertTriangle size={20} className="mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-sm text-white/60 mt-2">
                      Permanently delete your account and all associated data
                    </p>
                  </>
                ) : !showDeleteAccountFinalConfirm ? (
                  <div className="space-y-3 p-4 rounded-lg border-2 border-red-500/50 bg-red-500/10">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={20} />
                      <p className="font-semibold">Delete Account?</p>
                    </div>
                    <p className="text-sm text-white/80">
                      This will permanently delete your account, all your ideas,
                      and all associated data. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => setShowDeleteAccountFinalConfirm(true)}
                      >
                        Continue
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setShowDeleteAccountConfirm(false);
                          setDeleteAccountInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-lg border-2 border-red-500/50 bg-red-500/10">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={20} />
                      <p className="font-semibold">Final Confirmation</p>
                    </div>
                    <p className="text-sm text-white/80">
                      Type <strong>DELETE</strong> to confirm account deletion:
                    </p>
                    <input
                      type="text"
                      value={deleteAccountInput}
                      onChange={(e) => setDeleteAccountInput(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-white/20 text-white focus:outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={deleteAccount}
                        disabled={deleteAccountInput !== "DELETE"}
                      >
                        Delete Account
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setShowDeleteAccountConfirm(false);
                          setShowDeleteAccountFinalConfirm(false);
                          setDeleteAccountInput("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut size={20} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
