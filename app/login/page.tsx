"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Link from "next/link";
import type { Database } from "@/lib/database.types";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/");
      } else {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Ensure client-side only rendering for Auth component
  if (typeof window === 'undefined' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-2">
            IdeaCapture
          </h1>
          <p className="text-white/60 text-lg">
            Never lose an idea again
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Welcome Back
          </h2>

          {/* Auth UI */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#6366F1",
                    brandAccent: "#8B5CF6",
                    brandButtonText: "white",
                    defaultButtonBackground: "rgba(255, 255, 255, 0.05)",
                    defaultButtonBackgroundHover: "rgba(255, 255, 255, 0.1)",
                    defaultButtonBorder: "rgba(255, 255, 255, 0.1)",
                    defaultButtonText: "white",
                    dividerBackground: "rgba(255, 255, 255, 0.1)",
                    inputBackground: "rgba(255, 255, 255, 0.05)",
                    inputBorder: "rgba(255, 255, 255, 0.1)",
                    inputBorderHover: "#6366F1",
                    inputBorderFocus: "#6366F1",
                    inputText: "white",
                    inputLabelText: "rgba(255, 255, 255, 0.7)",
                    inputPlaceholder: "rgba(255, 255, 255, 0.4)",
                    messageText: "rgba(255, 255, 255, 0.9)",
                    messageTextDanger: "#EF4444",
                    anchorTextColor: "#6366F1",
                    anchorTextHoverColor: "#8B5CF6",
                  },
                  space: {
                    spaceSmall: "8px",
                    spaceMedium: "16px",
                    spaceLarge: "24px",
                    labelBottomMargin: "8px",
                    anchorBottomMargin: "16px",
                    emailInputSpacing: "8px",
                    socialAuthSpacing: "8px",
                    buttonPadding: "14px 16px",
                    inputPadding: "14px 16px",
                  },
                  fontSizes: {
                    baseBodySize: "16px",
                    baseInputSize: "16px",
                    baseLabelSize: "14px",
                    baseButtonSize: "16px",
                  },
                  fonts: {
                    bodyFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    buttonFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    inputFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    labelFontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "12px",
                    buttonBorderRadius: "12px",
                    inputBorderRadius: "12px",
                  },
                },
              },
              className: {
                container: "auth-container",
                button: "!min-h-[48px] !font-medium !text-base",
                input: "!min-h-[48px] !text-base",
                label: "!text-sm !font-medium",
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
            redirectTo={`${window.location.origin}/`}
          />

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          Secure authentication powered by Supabase
        </p>
      </div>
    </div>
  );
}
