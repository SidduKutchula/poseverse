import React, { useState } from "react";
import { X, Heart, Link as LinkIcon, Download, Sparkles } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PoseCard from "../pose/PoseCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MoodBoardItem = ({ pose, index, id, onRemove, provided, snapshot }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    setIsRemoving(true);
  };

  return (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      animate={isRemoving ? { opacity: 0, scale: 0.9, y: 15 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (isRemoving) {
          onRemove(id);
        }
      }}
      className={`relative group/card transition-transform duration-100 ${
        snapshot.isDragging ? "scale-105 z-30 ring-2 ring-primary/45" : ""
      }`}
    >
      {/* The PoseCard itself */}
      <PoseCard pose={pose} index={index} />

      {/* Hover Remove Cross Button */}
      <button
        type="button"
        onClick={handleRemoveClick}
        className="absolute top-3 right-14 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/card:opacity-100 transition-opacity duration-150 z-20"
        title="Remove from Mood Board"
      >
        <X size={16} strokeWidth={3} />
      </button>
    </motion.div>
  );
};

const MoodBoard = ({ poses, isReadOnly = false, onRemove, onShare, onReorder, onDownloadPDF }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(poses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    if (onReorder) {
      onReorder(items);
    }
  };

  if (!poses || poses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
        {/* SVG Illustration replacement */}
        <div className="w-20 h-20 bg-[#FAECE7] rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-sm mb-2">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-textPrimary">
            Your Mood Board is Empty
          </h3>
          <p className="text-sm text-textSecondary font-light">
            Create your inspiration board. Tap the heart icon on any pose in the catalog to add it here.
          </p>
        </div>
        <Link
          to="/explore"
          className="bg-primary hover:bg-primaryDark text-white text-sm font-semibold px-6 py-2.5 rounded-sm transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          Explore Poses
        </Link>
      </div>
    );
  }

  // If read-only mode, render plain grid without DnD wrappers
  if (isReadOnly) {
    return (
      <div className="space-y-6">
        {/* Banner for shared boards */}
        <div className="bg-[#FAECE7] border border-primary/20 p-5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-serif text-base font-bold text-primaryDark">Create Your Own Mood Board</h4>
            <p className="text-xs text-textSecondary mt-0.5">Build custom boards and get smart AI suggestions for your next shoot.</p>
          </div>
          <Link
            to="/signup"
            className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-sm inline-flex items-center gap-1"
          >
            <Sparkles size={14} />
            Create your own on PoseVerse
          </Link>
        </div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {poses.map((pose, index) => (
            <div key={pose.id || pose._id} className="relative">
              <PoseCard pose={pose} index={index} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header action panel for sharing (edit mode) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 border border-border rounded-sm shadow-sm">
        <div>
          <h4 className="font-serif text-lg font-bold text-textPrimary">Your Curated Pose Collection</h4>
          <p className="text-xs text-textSecondary mt-0.5 font-light">Drag cards to change the shooting order or remove poses that don't fit.</p>
        </div>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-sm"
        >
          <LinkIcon size={14} />
          Share with Photographer
        </button>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="moodboard-droppable" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-20"
            >
              {poses.map((pose, index) => {
                const id = pose.id || pose._id;
                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided, snapshot) => (
                      <MoodBoardItem
                        pose={pose}
                        index={index}
                        id={id}
                        onRemove={onRemove}
                        provided={provided}
                        snapshot={snapshot}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <span className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
            {poses.length} Poses Saved
          </span>
          <div className="flex gap-3">
            <button
              onClick={onDownloadPDF}
              className="bg-transparent hover:bg-primaryLight border border-primary text-primary hover:text-primaryDark text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors flex items-center gap-1.5"
            >
              <Download size={14} />
              Download as PDF
            </button>
            <button
              onClick={onShare}
              className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-6 py-2.5 rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
            >
              <LinkIcon size={14} />
              Share Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodBoard;
