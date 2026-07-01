import React from "react";

const DifficultyBadge = ({ level }) => {
  const styles = {
    Beginner: "bg-[#EAF5EC] text-[#2E7D32]",
    Easy: "bg-[#E3F2FD] text-[#1565C0]",
    Intermediate: "bg-[#FFF3E0] text-[#E65100]",
    Pro: "bg-[#FFEBEE] text-[#C62828]",
  };

  const badgeClass = styles[level] || "bg-[#F3F0EB] text-[#6B6560]";

  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-sm uppercase tracking-wider ${badgeClass}`}>
      {level}
    </span>
  );
};

export default DifficultyBadge;
