import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ArrowLeft, Camera, Settings, Download } from "lucide-react";
import { useMoodBoard } from "../context/MoodBoardContext";
import { useToast } from "../context/ToastContext";
import PoseImage from "../components/ui/PoseImage";
import DifficultyBadge from "../components/ui/DifficultyBadge";
import TagPill from "../components/ui/TagPill";
import StepGuide from "../components/pose/StepGuide";
import SEO from "../components/layout/SEO";
import api from "../utils/api";
import { POSES } from "../data/poses";
import { trackEvent } from "../utils/analytics";

const RelatedPoseCard = ({ relPose }) => {
  const relPoseId = relPose.id || relPose._id;

  return (
    <div className="bg-white border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/pose/${relPoseId}`}>
        <div className="aspect-[3/4] overflow-hidden bg-[#F3F0EB]">
          <PoseImage
            pose={relPose}
            className="w-full h-full hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-3">
          <h4 className="font-serif text-sm font-bold text-textPrimary truncate hover:text-primary">
            {relPose.name}
          </h4>
          <div className="flex gap-1.5 mt-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-textMuted bg-[#FAFAF8] px-2 py-0.5 rounded-sm border border-border">
              {relPose.difficulty}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-textMuted bg-[#FAFAF8] px-2 py-0.5 rounded-sm border border-border">
              {relPose.categoryLabel || relPose.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const PoseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { savedPoses, toggleSave } = useMoodBoard();

  const [activeThumb, setActiveThumb] = useState(0);
  const [pose, setPose] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSaved = pose ? savedPoses.includes(pose.id || pose._id) : false;

  useEffect(() => {
    const fetchPoseDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/poses/${id}`);
        setPose(response.data);
        
        // Fetch related poses in the same category
        const relResponse = await api.get(`/poses?category=${response.data.category}&limit=5`);
        const filteredRelated = (relResponse.data.poses || [])
          .filter((p) => (p.id || p._id) !== id)
          .slice(0, 4);
        setRelated(filteredRelated);
      } catch (error) {
        console.warn("Failed to fetch pose details from API, using fallback:", error.message);
        const localPose = POSES.find((item) => item.id === id || item._id === id);
        if (localPose) {
          setPose(localPose);
          const localRelated = POSES.filter(
            (item) => item.category === localPose.category && item.id !== localPose.id
          ).slice(0, 4);
          setRelated(localRelated);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoseDetails();
    setActiveThumb(0);
  }, [id]);

  const handleSave = async () => {
    if (!pose) return;
    const poseId = pose.id || pose._id;
    const isSaving = !savedPoses.includes(poseId);
    const success = await toggleSave(poseId);
    if (success) {
      trackEvent(isSaving ? "save_pose" : "unsave_pose", {
        pose_id: poseId,
        pose_name: pose.name,
        category: pose.category
      });
    } else {
      navigate("/login");
    }
  };

  const handleShare = () => {
    if (!pose) return;
    const poseId = pose.id || pose._id;
    const shareUrl = `${window.location.origin}/pose/${poseId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied to clipboard!", "success");
    trackEvent("share_pose", {
      pose_id: poseId,
      pose_name: pose.name,
      category: pose.category
    });
  };

  const handleDownload = () => {
    if (!pose) return;
    const poseId = pose.id || pose._id;
    const link = document.createElement("a");
    link.href = pose.image;
    link.target = "_blank";
    link.download = `${pose.name.replace(/\s+/g, "_")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Opening reference image in a new tab for download.", "success");
    trackEvent("download_reference", {
      pose_id: poseId,
      pose_name: pose.name,
      category: pose.category
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 bg-[#FAFAF8] min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-textSecondary font-serif italic text-primary animate-pulse">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (!pose) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-[#FAFAF8] min-h-screen">
        <h2 className="font-serif text-2xl font-bold text-textPrimary">Pose Not Found</h2>
        <p className="text-sm text-textSecondary mt-2">The pose you are looking for does not exist or has been moved.</p>
        <Link to="/explore" className="inline-block mt-4 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm hover:bg-primaryDark">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${pose.name} — Photography Pose Guide`}
        description={pose.description || `Step-by-step photography guide for the ${pose.name} pose, featuring lens choices, camera aperture, and outfit styling suggestions.`}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#FAFAF8] min-h-screen py-8 font-sans"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-1.5 text-sm font-medium text-textSecondary hover:text-primary transition-colors mb-6 py-1 px-2.5 rounded-sm hover:bg-[#F3F0EB]"
          >
            <ArrowLeft size={16} />
            Back to Explore
          </button>

          {/* Main Grid: Left (55%) and Right (45%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: Image Gallery (55% / 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image Container with 0.3s Fade Swapping */}
              <div className="aspect-[4/5] w-full rounded-md overflow-hidden shadow-sm border border-border bg-white relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeThumb}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <PoseImage
                      pose={{ ...pose, image: pose.thumbnails?.[activeThumb] || pose.image }}
                      className="w-full h-full"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 3 Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((thumbIndex) => {
                  const isCurrent = activeThumb === thumbIndex;
                  return (
                    <button
                      key={thumbIndex}
                      type="button"
                      onClick={() => setActiveThumb(thumbIndex)}
                      className={`aspect-square w-full rounded-md overflow-hidden bg-white shadow-sm border transition-all duration-150 ${
                        isCurrent 
                          ? "border-primary border-2 ring-2 ring-primaryLight" 
                          : "border-border hover:border-primaryMid"
                      }`}
                    >
                      <PoseImage
                        pose={{ ...pose, image: pose.thumbnails?.[thumbIndex] || pose.image }}
                        className="w-full h-full"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Details Panel (45% / 5 cols) - Sticky */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 bg-white border border-border p-6 rounded-sm shadow-sm">
              {/* Breadcrumb */}
              <div className="text-xs text-textMuted font-medium uppercase tracking-wider">
                <Link to="/explore" className="hover:text-primary">Poses</Link>
                <span className="mx-1.5">/</span>
                <span className="text-textSecondary">{pose.categoryLabel || pose.category}</span>
              </div>

              {/* Pose Title */}
              <div>
                <h1 className="font-serif text-3xl font-bold text-textPrimary leading-tight">
                  {pose.name}
                </h1>
                {pose.description && (
                  <p className="text-sm text-textSecondary mt-2 leading-relaxed font-light">
                    {pose.description}
                  </p>
                )}
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge level={pose.difficulty} />
                {pose.categoryLabel && <TagPill label={pose.categoryLabel} />}
                {pose.peopleCount && <TagPill label={pose.peopleCount} />}
                {pose.style && <TagPill label={pose.style} />}
              </div>

              <hr className="border-border" />

              {/* Step Guide */}
              <div>
                <h3 className="font-serif text-lg font-bold text-textPrimary mb-4">
                  Step-by-Step Directions
                </h3>
                <StepGuide steps={pose.steps} />
              </div>

              <hr className="border-border" />

              {/* Camera / Settings Grid (2x2) */}
              <div>
                <h3 className="font-serif text-base font-bold text-textPrimary mb-3 flex items-center gap-1.5">
                  <Settings size={16} className="text-primary" />
                  Best Camera Settings
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAFAF8] border border-border p-3 rounded-sm">
                    <span className="text-xs text-textMuted uppercase font-semibold block mb-0.5">Lens</span>
                    <span className="text-sm text-textPrimary font-medium">{pose.bestSettings?.lens || "85mm portrait"}</span>
                  </div>
                  <div className="bg-[#FAFAF8] border border-border p-3 rounded-sm">
                    <span className="text-xs text-textMuted uppercase font-semibold block mb-0.5">Aperture</span>
                    <span className="text-sm text-textPrimary font-medium">{pose.bestSettings?.aperture || "f/2.2"}</span>
                  </div>
                  <div className="bg-[#FAFAF8] border border-border p-3 rounded-sm">
                    <span className="text-xs text-textMuted uppercase font-semibold block mb-0.5">Best Light</span>
                    <span className="text-sm text-textPrimary font-medium">{pose.bestSettings?.light || pose.lightingSuggestion || "Golden hour"}</span>
                  </div>
                  <div className="bg-[#FAFAF8] border border-border p-3 rounded-sm">
                    <span className="text-xs text-textMuted uppercase font-semibold block mb-0.5">Outfit</span>
                    <span className="text-sm text-textPrimary font-medium">{pose.bestSettings?.outfit || "Traditional wear"}</span>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className={`grow py-3 px-4 rounded-sm text-sm font-semibold transition-colors flex items-center justify-center gap-2 border shadow-sm ${
                    isSaved
                      ? "bg-primaryLight border-primary text-primaryDark hover:bg-primaryLight/70"
                      : "bg-primary hover:bg-primaryDark text-white border-transparent"
                  }`}
                >
                  <Heart size={16} className={isSaved ? "fill-primary text-primary" : ""} />
                  {isSaved ? "Saved to Mood Board" : "Save to Mood Board"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="py-3 px-4 rounded-sm border border-border hover:border-primaryMid text-textSecondary hover:text-textPrimary transition-colors flex items-center justify-center gap-2 text-sm font-medium bg-white"
                >
                  <Share2 size={16} />
                  Share
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="py-3 px-4 rounded-sm border border-border hover:border-primaryMid text-textSecondary hover:text-textPrimary transition-colors flex items-center justify-center gap-2 text-sm font-medium bg-white"
                  title="Download Reference Image"
                >
                  <Download size={16} />
                  Download Reference
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Related Section: You Might Also Like */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="font-serif text-2xl font-bold text-textPrimary mb-6">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((relPose) => (
                  <RelatedPoseCard key={relPose.id || relPose._id} relPose={relPose} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default PoseDetail;
