import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, LogOut, Heart, Compass, Sparkles, User, Shield } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Explore", path: "/explore", icon: <Compass size={18} /> },
    { name: "AI Suggest", path: "/ai-recommend", icon: <Sparkles size={18} /> },
    { name: "Mood Board", path: "/moodboard", icon: <Heart size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-serif text-xl tracking-tight text-textPrimary flex items-center">
              <span>Pose</span>
              <span className="italic text-primary font-bold ml-0.5">Verse</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary border-b-2 border-primary py-5" : "text-textSecondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-xs font-semibold uppercase tracking-wider text-[#D85A30] hover:text-[#B74A25] flex items-center gap-1 transition-colors"
                  >
                    <Shield size={14} />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-sm font-medium text-textPrimary hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <User size={16} className="text-primary" />
                  Hi, {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-textSecondary hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-textSecondary hover:text-primary px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary hover:bg-primaryDark text-white text-sm font-medium px-4 py-2 rounded-sm transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-sm text-textSecondary hover:text-primary hover:bg-[#F3F0EB] transition-colors focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border py-4 px-6 absolute left-0 w-full shadow-lg">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 py-2 text-base font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-textSecondary"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="border-t border-border my-2 pt-4 flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-textPrimary py-1 hover:text-primary"
                  >
                    <User size={18} className="text-primary" />
                    Hi, {user.name} (Profile)
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-[#D85A30] py-1 hover:text-[#B74A25]"
                    >
                      <Shield size={18} />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-base font-medium text-textSecondary hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2 text-base font-medium text-textSecondary hover:text-primary transition-colors border border-border rounded-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2 text-base font-medium bg-primary hover:bg-primaryDark text-white transition-colors rounded-sm shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
