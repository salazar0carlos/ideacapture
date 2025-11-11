"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BottomNav } from "@/components/BottomNav";
import type { Database } from "@/lib/database.types";

// Routes where BottomNav should be hidden
const noNavRoutes = ["/login", "/signup"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [supabase] = useState(() => createClientComponentClient<Database>());

  useEffect(() => {
    // Check auth state on mount (important for PWA)
    const checkAuth = async () => {
      try {
        // This will use cached session if available (offline support)
        const { data: { session } } = await supabase.auth.getSession();

        // Store auth state in localStorage for offline PWA access
        if (session) {
          localStorage.setItem('auth_state', 'authenticated');
        } else {
          localStorage.removeItem('auth_state');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // In offline mode, check localStorage
        const cachedAuthState = localStorage.getItem('auth_state');
        if (!cachedAuthState && !noNavRoutes.includes(pathname)) {
          // If no cached auth and not on auth pages, we might need to redirect
          // But we'll let middleware handle it when online
        }
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();

    // Listen for auth state changes (important for PWA auth persistence)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem('auth_state', 'authenticated');
      } else {
        localStorage.removeItem('auth_state');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname]);

  // Show bottom nav only on authenticated pages
  const showBottomNav = !noNavRoutes.includes(pathname);

  return (
    <>
      <main className={showBottomNav ? "min-h-screen pb-[80px]" : "min-h-screen"}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </>
  );
}
