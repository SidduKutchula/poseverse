import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="font-serif text-xl tracking-tight text-textPrimary">
              <span>Pose</span>
              <span className="italic text-primary font-bold ml-0.5">Verse</span>
            </Link>
            <p className="text-sm text-textSecondary max-w-xs">
              Empowering photographers and couples to plan their perfect photoshoot with curated poses, expert angles, and AI-driven matching.
            </p>
          </div>

          {/* Navigation Col */}
          <div>
            <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider mb-4">
              Explore PoseVerse
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  Browse Poses
                </Link>
              </li>
              <li>
                <Link to="/ai-recommend" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  AI Suggestion Engine
                </Link>
              </li>
              <li>
                <Link to="/moodboard" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  Saved Mood Boards
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Contact Col */}
          <div>
            <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider mb-4">
              Resources & Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  Photography Guides
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-textSecondary hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-textMuted">
            &copy; {new Date().getFullYear()} PoseVerse. All rights reserved. Made with love for photographers.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs text-textMuted hover:text-primary">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-xs text-textMuted hover:text-primary">Pinterest</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-xs text-textMuted hover:text-primary">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
