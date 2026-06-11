import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You are already signed in</p>
          <Link href="/">
            <a>
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Go Home
              </Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Pose<em className="text-primary not-italic">Verse</em>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-soft">
          {/* OAuth Button */}
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground mb-6"
          >
            Continue with Manus
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </p>
            <a href="#" className="block text-primary hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
