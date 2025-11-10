"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/Card";
import { Settings as SettingsIcon, LogOut, User } from "lucide-react";
import type { Database } from "@/lib/database.types";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] gap-8">
        <h1 className="text-4xl font-bold gradient-text text-center">
          Settings
        </h1>

        {/* User Info Card */}
        {userEmail && (
          <Card className="w-full max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/60 mb-1">Signed in as</p>
                <p className="text-lg font-medium text-white">{userEmail}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Preferences Card */}
        <Card className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-foreground/20 flex items-center justify-center">
              <SettingsIcon size={40} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Preferences</h2>
            <p className="text-white/60">
              Coming in next session - customize your IdeaCapture experience and manage validation settings
            </p>
          </div>
        </Card>

        {/* Logout Button */}
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full max-w-md flex items-center justify-center gap-3 glass rounded-2xl px-6 py-4 hover:bg-danger/10 hover:border-danger/30 transition-all duration-300 group"
          >
            <LogOut size={24} className="text-danger group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium text-danger">Logout</span>
          </button>
        ) : (
          <Card className="w-full max-w-md">
            <div className="flex flex-col gap-4">
              <p className="text-center text-white text-lg font-medium">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 glass rounded-xl px-6 py-3 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-base font-medium text-white">Cancel</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-danger hover:bg-danger/80 rounded-xl px-6 py-3 transition-all duration-300"
                >
                  <span className="text-base font-medium text-white">Logout</span>
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
