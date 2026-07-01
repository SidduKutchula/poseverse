import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, Mail, Lock, UserPlus } from "lucide-react";

const Signup = () => {
  const { register, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError("");
    try {
      await googleLogin(response.credential);
      showToast("Signed in with Google successfully!", "success");
      navigate("/explore", { replace: true });
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
          client_id: "777413693240-mock.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignUpButton"),
          { theme: "outline", size: "large", width: 356, text: "signup_with" }
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
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(name, email, password);
      showToast("Account created successfully!", "success");
      navigate("/explore", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Try a different email.";
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
          <h2 className="font-serif text-xl font-bold text-textPrimary">Create an Account</h2>
          <p className="text-xs text-textSecondary">Save your curated boards and get personalized guides.</p>
        </div>

        {/* Google OAuth Button Container */}
        <div className="flex justify-center w-full">
          <div id="googleSignUpButton" className="w-full flex justify-center min-h-[40px]"></div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-textMuted text-xs uppercase font-medium">Or email sign up</span>
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
              Your Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 pl-10 pr-4 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder-textMuted"
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-textSecondary">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In instead
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Signup;
