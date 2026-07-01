import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useMoodBoard } from "../context/MoodBoardContext";
import { useToast } from "../context/ToastContext";
import { User, Mail, Calendar, Shield, Heart, ArrowRight, LogOut, Compass } from "lucide-react";
import SEO from "../components/layout/SEO";

const Profile = () => {
  const { user, logout } = useAuth();
  const { savedPoses } = useMoodBoard();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    showToast("Signed out successfully", "info");
    navigate("/");
  };

  // Mock joined date for presentation since user schema may not have it populated
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  if (!user) {
    return (
      <div className="flex justify-center items-center py-40 bg-[#FAFAF8] min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${user.name} — Profile`}
        description="View your PoseVerse profile, saved photoshoot configurations, and administrative dashboard access details."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#FAFAF8] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full font-sans"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: User Profile Card */}
          <div className="md:col-span-1 bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primaryLight text-primary font-serif flex items-center justify-center font-bold text-4xl border border-primary/20 shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-textPrimary">{user.name}</h2>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-primaryLight text-primaryDark border border-primary/10">
                {user.role}
              </span>
            </div>
            
            <hr className="w-full border-border" />
            
            <div className="w-full text-left space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-textSecondary">
                <Mail size={16} className="text-textMuted shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-textSecondary">
                <Calendar size={16} className="text-textMuted shrink-0" />
                <span>Joined {joinedDate}</span>
              </div>
              {user.role === "admin" && (
                <div className="flex items-center gap-2.5 text-primary">
                  <Shield size={16} className="text-primary shrink-0" />
                  <span className="font-semibold">System Administrator</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-4 bg-transparent hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold py-2.5 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          {/* Right Column: Quick Stats & Dashboard Action */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-primaryLight/70 text-primary flex items-center justify-center">
                  <Heart size={24} className="fill-primary text-primary" />
                </div>
                <div>
                  <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Saved Poses</span>
                  <h3 className="font-serif text-2xl font-bold text-textPrimary mt-0.5">{savedPoses.length}</h3>
                </div>
              </div>

              <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#E8E4DE] text-[#605A54] flex items-center justify-center">
                  <Compass size={24} />
                </div>
                <div>
                  <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Status</span>
                  <h3 className="font-serif text-sm font-bold text-textPrimary mt-1.5">
                    {savedPoses.length > 0 ? "Curator Active" : "Inspiration Needed"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="bg-white border border-border p-6 rounded-sm shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-textPrimary">Your Mood Board</h3>
              <p className="text-sm text-textSecondary font-light leading-relaxed">
                Sequence, organize, and share your private board. Create interactive PDFs and notes to present ideas to your photoshoot agency or wedding planner.
              </p>
              <div className="pt-2">
                <Link
                  to="/moodboard"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-5 py-2.5 rounded-sm shadow-sm transition-colors"
                >
                  Go to Mood Board
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Admin Portal Shortcut */}
            {user.role === "admin" && (
              <div className="bg-[#FAECE7] border border-[#F09975]/30 p-6 rounded-sm shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-[#993C1D]" />
                  <h3 className="font-serif text-lg font-bold text-[#993C1D]">Admin Dashboard</h3>
                </div>
                <p className="text-sm text-[#7A5447] font-light leading-relaxed">
                  As a system administrator, you can manage the core database. Upload and verify pose collections, analyze system stats, moderate user configurations, and toggle featured content.
                </p>
                <div className="pt-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 bg-[#D85A30] hover:bg-[#B74A25] text-white text-xs font-semibold px-5 py-2.5 rounded-sm shadow-sm transition-colors"
                  >
                    Launch Admin Console
                    <Shield size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Profile;
