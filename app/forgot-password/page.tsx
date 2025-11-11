"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Lightbulb, Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      // Success
      setSent(true);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
            </div>

            <h1 className="text-2xl font-bold gradient-text mb-4">
              Check Your Email
            </h1>

            <p className="text-gray-400 mb-6">
              We've sent password reset instructions to{" "}
              <span className="text-white font-medium">{email}</span>
            </p>

            <div className="space-y-4">
              <div className="p-4 glass rounded-xl text-sm text-gray-300">
                <p className="mb-2">
                  <strong>Didn't receive the email?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-left">
                  <li>Check your spam folder</li>
                  <li>Verify you entered the correct email</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>

              <Button
                variant="secondary"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Try Another Email
              </Button>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Lightbulb size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Instructions
            </Button>

            <div className="text-center space-y-2">
              <Link
                href="/login"
                className="text-sm text-primary hover:underline block"
              >
                Back to Login
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <div className="p-4 glass rounded-xl">
          <p className="text-sm text-gray-400">
            <strong className="text-white">Security Note:</strong> For your
            protection, we'll send reset instructions only if an account exists
            with this email address.
          </p>
        </div>
      </div>
    </div>
  );
}
