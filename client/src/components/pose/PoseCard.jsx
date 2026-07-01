import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Camera, Share2 } from "lucide-react";
import { useMoodBoard } from "../../context/MoodBoardContext";
import { useToast } from "../../context/ToastContext";
import PoseImage from "../ui/PoseImage";
import DifficultyBadge from "../ui/DifficultyBadge";
import TagPill from "../ui/TagPill";
import { CATEGORY_COVERS } from "../../data/poses";
import { trackEvent } from "../../utils/analytics";

const PoseCard = ({ pose, index }) => {
  const navigate = useNavigate();
  const { savedPoses, toggleSave } = useMoodBoard();
  const { showToast } = useToast();
  const poseId = pose.id || pose._id;

  const isSaved = savedPoses.includes(poseId);
  const imageUrl = pose.image || pose.thumbnails?.[0] || CATEGORY_COVERS[pose.category];

  const handleSave = async (e) => {
    e.stopPropagation();
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

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/pose/${poseId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied!", "success");
    trackEvent("share_pose", {
      pose_id: poseId,
      pose_name: pose.name,
      category: pose.category
    });
  };

  return (
    <motion.div
      className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-border flex flex-col h-full"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      {/* IMAGE AREA (ZONE 1 & 2 & Save Button Zone) */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        onClick={() => navigate(`/pose/${poseId}`)}
      >
        <PoseImage
          pose={pose}
          className="w-full h-full"
        />

        {/* Difficulty badge top-left */}
        <div className="absolute top-3 left-3 z-10">
          <DifficultyBadge level={pose.difficulty} />
        </div>

        {/* Save button top-right (ZONE 4) */}
        <motion.button
          type="button"
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm z-10"
          onClick={handleSave}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            key={isSaved ? "saved" : "unsaved"}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.35, 1] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Heart
              size={16}
              className={isSaved ? "fill-primary text-primary" : "text-textSecondary"}
            />
          </motion.div>
        </motion.button>

        {/* Hover overlay (ZONE 2) */}
        <div
          className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          onClick={() => navigate(`/pose/${poseId}`)}
        >
          <button className="px-4 py-2 border border-white text-white text-sm rounded-sm font-medium hover:bg-white/10 transition-colors">
            View Pose Guide
          </button>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 flex flex-col grow">
        {/* Title (ZONE 3) */}
        <h3
          className="font-serif text-base text-textPrimary truncate hover:text-primary transition-colors font-semibold"
          onClick={() => navigate(`/pose/${poseId}`)}
        >
          {pose.name}
        </h3>

        {/* Tags */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <TagPill label={pose.category} />
          {pose.peopleCount && <TagPill label={pose.peopleCount} />}
        </div>

        {/* Description */}
        {pose.description && (
          <p className="text-xs text-textSecondary font-light line-clamp-2 mt-2.5 leading-relaxed">
            {pose.description}
          </p>
        )}

        {/* Steps Preview */}
        {pose.steps && pose.steps.length > 0 && (
          <div className="mt-3 bg-[#FAFAF8] p-2.5 rounded-sm border border-border space-y-1">
            <span className="text-[9px] uppercase font-bold text-textMuted block mb-0.5">Quick Steps:</span>
            {pose.steps.slice(0, 2).map((step, idx) => (
              <div key={idx} className="text-[11px] text-textSecondary flex gap-1 items-start leading-tight">
                <span className="text-primary font-semibold shrink-0">{idx + 1}.</span>
                <span className="line-clamp-1"><span className="font-medium text-textPrimary">{step.label || `Step ${idx+1}`}:</span> {step.description}</span>
              </div>
            ))}
            {pose.steps.length > 2 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/pose/${poseId}`);
                }}
                className="text-[9px] font-semibold text-primary hover:text-primaryDark block mt-1 transition-colors"
              >
                + {pose.steps.length - 2} more step{pose.steps.length - 2 > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}

        {/* Footer (ZONE 5) */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="text-xs text-textMuted flex items-center gap-1">
            <Camera size={12} />
            {pose.cameraAngle || "Eye Level"}
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="p-1 rounded-full hover:bg-[#F3F0EB] text-textMuted hover:text-primary transition-colors"
            title="Copy pose URL"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PoseCard;
