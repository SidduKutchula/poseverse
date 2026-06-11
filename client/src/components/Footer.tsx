import { Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-xl font-normal text-foreground mb-2">
              Pose<em className="text-primary not-italic">Verse</em>
            </h3>
            <p className="text-sm text-muted-foreground">
              Plan your perfect shoot.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => (window.location.href = "/explore")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Poses
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = "/ai-recommend")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  AI Recommendations
                </button>
              </li>
              <li>
                <button
                  onClick={() => (window.location.href = "/explore")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  About
                </button>
              </li>
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Blog
                </button>
              </li>
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Photographers */}
          <div>
            <h4 className="font-medium text-foreground mb-4">For Photographers</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Submit Poses
                </button>
              </li>
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Photographer Guide
                </button>
              </li>
              <li>
                <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Partner Program
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 PoseVerse. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground transition-colors hover:text-primary">
              <Instagram size={20} />
            </button>
            <button className="text-muted-foreground transition-colors hover:text-primary">
              <Twitter size={20} />
            </button>
            <button className="text-muted-foreground transition-colors hover:text-primary">
              <Linkedin size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
