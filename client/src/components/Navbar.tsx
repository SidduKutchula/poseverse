import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-soft">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <h1 className="font-serif text-2xl font-normal text-foreground">
            Pose<em className="text-primary not-italic">Verse</em>
          </h1>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => (window.location.href = "/explore")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </button>
          <button
            onClick={() => (window.location.href = "/ai-recommend")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            AI Suggest
          </button>
          {isAuthenticated && (
            <button
              onClick={() => (window.location.href = "/moodboard")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Mood Board
            </button>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="space-y-3">
            <button
              onClick={() => {
                window.location.href = "/explore";
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore
            </button>
            <button
              onClick={() => {
                window.location.href = "/ai-recommend";
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              AI Suggest
            </button>
            {isAuthenticated && (
              <button
                onClick={() => {
                  window.location.href = "/moodboard";
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Mood Board
              </button>
            )}
            <div className="space-y-2 border-t border-border pt-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
