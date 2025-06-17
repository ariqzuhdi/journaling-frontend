import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    if (showPolicy) {
      setHasAnimatedIn(false);
      setTimeout(() => setHasAnimatedIn(true), 10);
    }
  }, [showPolicy]);

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPolicy(false);
      setIsClosing(false);
      setHasAnimatedIn(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3 || username.length > 30) {
      toast({
        title: "Invalid username",
        description: "Username must be between 3 and 30 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: "Invalid username format",
        description:
          "Username can only contain letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!agreed) {
      toast({
        title: "Agreement required",
        description: "You must agree to the privacy policy before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register.");
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
        variant: "success",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen journal-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-serif font-semibold text-primary">
              Journal
            </h1>
          </div>
          <p className="text-charcoal/70">Create your personal sanctuary</p>
        </div>

        {/* Register Form */}
        <Card className="shadow-lg border border-accent/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-primary">
              Create Account
            </CardTitle>
            <CardDescription>
              Start your journaling journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-start space-x-2 mt-4">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-primary"
                  disabled={isLoading}
                />
                <label htmlFor="agree" className="text-sm text-charcoal">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowPolicy(true)}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Privacy & Data Protection
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {showPolicy && (
              <div
                className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center px-4
      transition-opacity duration-300 ease-in-out 
      ${isClosing ? "opacity-0" : hasAnimatedIn ? "opacity-100" : "opacity-0"}
      bg-black/40`}
              >
                <div
                  className={`bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative transform
        transition-all duration-300 ease-in-out 
        ${isClosing
                      ? "translate-y-4 opacity-0 scale-95"
                      : hasAnimatedIn
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-4 opacity-0 scale-95"
                    }`}
                >
                  <h2 className="text-lg font-semibold text-primary mb-4">
                    Privacy & Data Protection
                  </h2>
                  <div className="text-sm text-charcoal space-y-3 max-h-64 overflow-y-auto">
                    <p>
                      Your journal entries are encrypted end-to-end. Only you
                      can decrypt them using your password.
                    </p>
                    <p>
                      We do not collect, read, or share your private writing.
                      Your username and email are stored for login and support
                      purposes only.
                    </p>
                    <p>
                      Please remember your password. We cannot recover your
                      private entries if it's lost.
                    </p>
                    <p>
                      By using this app, you agree to this privacy model and
                      accept full responsibility for your data.
                    </p>
                  </div>

                  <div className="mt-6 text-right">
                    <Button
                      variant="outline"
                      onClick={closeWithAnimation}
                      className="px-4 py-2"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-charcoal/60">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/50">
            Join thousands who trust us with their thoughts
          </p>
        </div>
      </div>
    </div>
  );
}
