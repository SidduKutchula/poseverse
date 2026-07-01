import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to original request path or default to explore
  const from = location.state?.from?.pathname || "/explore";

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError("");
    try {
      await googleLogin(response.credential);
      showToast("Signed in with Google successfully!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Google Sign-In failed.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "777413693240-mock.apps.googleusercontent.com", // Stub client ID, works for frontend rendering
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          { theme: "outline", size: "large", width: 356, text: "signin_with" }
        );
      }
    };

    initGoogle();

    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      showToast("Signed in successfully!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#FAFAF8] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-[420px] w-full bg-white border border-border p-8 rounded-sm shadow-sm space-y-6">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <Link to="/" className="font-serif text-2xl tracking-tight text-textPrimary inline-flex items-center justify-center">
            <span>Pose</span>
            <span className="italic text-primary font-bold ml-0.5">Verse</span>
          </Link>
          <h2 className="font-serif text-xl font-bold text-textPrimary">Sign In to Your Account</h2>
          <p className="text-xs text-textSecondary">Access your saved mood boards and AI suggestions.</p>
        </div>

        {/* Google OAuth Button Container */}
        <div className="flex justify-center w-full">
          <div id="googleSignInButton" className="w-full flex justify-center min-h-[40px]"></div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-textMuted text-xs uppercase font-medium">Or email sign in</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 pl-10 pr-4 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder-textMuted"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast("Password reset link sent (Demo only)", "info")}
                className="text-xs font-semibold text-primary hover:underline hover:text-primaryDark"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 pl-10 pr-4 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder-textMuted"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryDark text-white text-sm font-semibold py-2.5 px-4 rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-b-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-textSecondary">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
