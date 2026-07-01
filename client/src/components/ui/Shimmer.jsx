import React from "react";

const Shimmer = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-sm overflow-hidden shadow-sm border border-border p-3 animate-pulse ${className}`}>
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] rounded-sm bg-[#F3F0EB] shimmer mb-3" />
      {/* Title Skeleton */}
      <div className="h-5 bg-[#F3F0EB] shimmer rounded-sm w-3/4 mb-2" />
      {/* Tags Skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-4 bg-[#F3F0EB] shimmer rounded-sm w-12" />
        <div className="h-4 bg-[#F3F0EB] shimmer rounded-sm w-16" />
      </div>
      {/* Footer Skeleton */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
        <div className="h-3 bg-[#F3F0EB] shimmer rounded-sm w-20" />
        <div className="h-4 bg-[#F3F0EB] shimmer rounded-sm w-4" />
      </div>
    </div>
  );
};

export default Shimmer;
