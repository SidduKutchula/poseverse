import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PoseImage from "../ui/PoseImage";
import { CATEGORY_COVERS } from "../../data/poses";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const coverUrl = CATEGORY_COVERS[category.slug];

  const handleClick = () => {
    navigate(`/explore?category=${category.slug}`);
  };

  const mockCategoryPose = {
    name: category.label || category.name,
    image: coverUrl,
    imageVerified: true,
    category: category.slug
  };

  return (
    <motion.div
      className="relative cursor-pointer rounded-md overflow-hidden aspect-[3/2] shadow-sm group border border-border"
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      {/* Image fills card */}
      <PoseImage
        pose={mockCategoryPose}
        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 p-4 flex justify-between items-end text-white">
        <h3 className="font-serif text-lg md:text-xl font-bold tracking-wide">
          {category.label || category.name}
        </h3>
        <span className="text-xs font-sans font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {category.count ?? category.poseCount ?? 0} Poses
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
