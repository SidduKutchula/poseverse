import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useMoodBoard } from "../context/MoodBoardContext";
import { useToast } from "../context/ToastContext";
import SEO from "../components/layout/SEO";
import api from "../utils/api";
import MoodBoardComponent from "../components/moodboard/MoodBoard";
import { trackEvent } from "../utils/analytics";

const MoodBoardPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toggleSave } = useMoodBoard();
  const { showToast } = useToast();

  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const isReadOnly = !!token;

  useEffect(() => {
    // If personal view and auth is loaded, verify login
    if (!isReadOnly && !authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchBoardPoses = async () => {
      setLoading(true);
      try {
        if (isReadOnly) {
          // Public shared board view (no auth needed)
          const response = await api.get(`/moodboard/share/${token}`);
          setPoses(response.data.poses || []);
        } else {
          // Personal board view (auth required)
          const response = await api.get("/moodboard");
          setPoses(response.data || []);
        }
      } catch (error) {
        showToast("Error loading mood board poses", "error");
        console.error("Failed to load moodboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchBoardPoses();
    }
  }, [token, isReadOnly, isAuthenticated, authLoading, navigate]);

  const handleRemove = async (poseId) => {
    await toggleSave(poseId);
    setPoses((prev) => prev.filter((p) => (p.id || p._id) !== poseId));
  };

  const handleReorder = async (reorderedPoses) => {
    setPoses(reorderedPoses);
    try {
      const poseIds = reorderedPoses.map((p) => p.id || p._id);
      await api.post("/moodboard/reorder", { poses: poseIds });
    } catch (error) {
      console.error("Failed to sync drag and drop order with server:", error.message);
      showToast("Failed to save custom order to server", "error");
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post("/moodboard/share");
      const { shareToken } = response.data;
      const shareUrl = `${window.location.origin}/moodboard/share/${shareToken}`;

      await navigator.clipboard.writeText(shareUrl);
      showToast("Mood board share link copied to clipboard!", "success");
      trackEvent("share_mood_board", {
        poses_count: poses.length,
        share_token: shareToken
      });
    } catch (error) {
      showToast("Failed to generate share link", "error");
      console.error("Failed to share moodboard:", error);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
    showToast("Opening browser print layout. Choose 'Save as PDF' to download.", "success");
    trackEvent("download_mood_board_pdf", {
      poses_count: poses.length
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-40 bg-[#FAFAF8] min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-textSecondary font-medium font-serif italic text-primary animate-pulse">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={isReadOnly ? "Shared Mood Board" : "Your Mood Board"}
        description="View and organize your saved photoshoot poses. Plan details, sequence angles, and share direct guides with your photographer."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#FAFAF8] min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-sans"
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-textPrimary">
              {isReadOnly ? "Shared Mood Board" : "Your Mood Board"}
            </h1>
            <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto font-light">
              {isReadOnly
                ? "View selected poses shared by a PoseVerse user."
                : `You have ${poses.length} poses saved. Sequence your shots and share with your team.`}
            </p>
          </div>

          {/* MoodBoard Component */}
          <MoodBoardComponent
            poses={poses}
            isReadOnly={isReadOnly}
            onRemove={handleRemove}
            onShare={handleShare}
            onReorder={handleReorder}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </motion.div>
    </>
  );
};

export default MoodBoardPage;
