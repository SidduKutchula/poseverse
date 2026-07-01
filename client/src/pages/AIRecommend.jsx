import React from "react";
import { motion } from "framer-motion";
import AIWizard from "../components/ai/AIWizard";

const AIRecommend = () => {
  return (
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
            AI Suggestion Engine
          </h1>
          <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto">
            Answer a few quick questions about your photoshoot parameters to get highly recommended, custom pose guides.
          </p>
        </div>

        {/* Wizard Component */}
        <AIWizard />
      </div>
    </motion.div>
  );
};

export default AIRecommend;
