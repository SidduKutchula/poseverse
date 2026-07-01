import React, { useState, useEffect } from "react";
import { CATEGORY_COVERS } from "../../data/poses";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=533&fit=crop&crop=faces,center";

const getLowResUrl = (url) => {
  if (!url || !url.includes("unsplash.com")) return url;
  // Replace width and height parameters with low-res/low-quality values for fast preview
  return url
    .replace(/w=\d+/g, "w=30")
    .replace(/h=\d+/g, "h=40")
    .replace(/q=\d+/g, "q=20")
    .replace(/fit=crop/g, "fit=crop&blur=30");
};

const PoseImage = ({ pose, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [broken, setBroken] = useState(false);
  
  const baseImageUrl =
    pose?.image ||
    pose?.thumbnails?.[0] ||
    (pose?.category && CATEGORY_COVERS[pose.category]) ||
    FALLBACK_IMAGE;

  const [currentSrc, setCurrentSrc] = useState(baseImageUrl);

  // If pose.image or baseImageUrl changes, reset status
  useEffect(() => {
    setCurrentSrc(baseImageUrl);
    setLoaded(false);
    setBroken(false);
    setRetryCount(0);
  }, [baseImageUrl]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    if (retryCount < 2) {
      // Retry after 1s delay
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setTimeout(() => {
        // Append a parameter to force cache bypass for retry
        setCurrentSrc(`${baseImageUrl}&retry=${nextRetry}`);
      }, 1000);
    } else if (currentSrc !== FALLBACK_IMAGE) {
      // Fallback to stable global photo
      setCurrentSrc(FALLBACK_IMAGE);
      setRetryCount(0); // reset retry for fallback
    } else {
      // If even fallback fails, mark as broken to display premium graphic cards
      setBroken(true);
    }
  };

  const lowResUrl = getLowResUrl(baseImageUrl);

  if (broken || !baseImageUrl) {
    // Premium graphic card styling (terracotta gradient + pose name in serif font)
    // No "Image unavailable" block or broken icons!
    return (
      <div 
        className={`relative flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-[#E8A382] via-[#D87D56] to-[#A35231] text-white ${className}`}
        style={{ minHeight: "200px" }}
      >
        <span className="text-[10px] uppercase tracking-widest opacity-85 font-sans font-semibold mb-2">
          {pose?.categoryLabel || pose?.category || "Photography"} Pose
        </span>
        <h3 className="font-serif text-lg font-bold leading-snug max-w-[90%] break-words text-balance">
          {pose?.name || "Pose Guide"}
        </h3>
        <div className="mt-4 px-2 py-0.5 border border-white/30 rounded-sm text-[9px] bg-white/10 backdrop-blur-xs">
          PoseVerse Reference
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3F0EB] ${className}`}>
      {/* 1. Low-Res Blurred Placeholder for Progressive Loading */}
      {!loaded && (
        <img
          src={lowResUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-105 transition-opacity duration-300 pointer-events-none"
        />
      )}

      {/* 2. Loading Shimmer Overlay */}
      {!loaded && (
        <div className="absolute inset-0 shimmer opacity-60 mix-blend-overlay" />
      )}

      {/* 3. Main Full-Resolution Image */}
      <img
        src={currentSrc}
        alt={`${pose?.name || "Photography"} - ${pose?.category || ""} pose`}
        loading="lazy"
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default PoseImage;
