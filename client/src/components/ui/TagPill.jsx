import React from "react";

const TagPill = ({ label }) => {
  if (!label) return null;
  return (
    <span className="bg-primaryLight text-primaryDark px-2.5 py-1 text-xs rounded-sm font-medium tracking-wide">
      {label}
    </span>
  );
};

export default TagPill;
