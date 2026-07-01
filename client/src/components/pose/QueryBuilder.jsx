import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Search, ChevronRight, ChevronLeft, Camera } from "lucide-react";
import api from "../../utils/api";

const QueryBuilder = ({ isOpen, onClose, onResultsFetched }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({
    event: "",
    people: "",
    pose: "",
    mood: "",
    cameraAngle: "",
    background: "",
    lighting: "",
    clothing: "",
  });

  const stepsList = [
    {
      field: "event",
      label: "Occasion / Event",
      options: ["Wedding", "Engagement", "Pre Wedding", "Birthday", "Baby Shower", "Maternity", "Family", "Travel", "Fashion", "Graduation", "Traditional", "Corporate", "Festival", "Friends"],
    },
    {
      field: "people",
      label: "Posing Subjects",
      options: ["Solo Male", "Solo Female", "Couple", "Family", "Group", "Kids", "Baby"],
    },
    {
      field: "pose",
      label: "Pose Type",
      options: ["Standing", "Sitting", "Walking", "Running", "Jumping", "Leaning", "Holding Hands", "Hugging", "Looking Camera", "Looking Away", "Back Pose", "Close Up", "Wide Shot", "Drone View", "Candid"],
    },
    {
      field: "mood",
      label: "Vibe / Mood",
      options: ["Romantic", "Cute", "Luxury", "Elegant", "Minimal", "Happy", "Funny", "Professional", "Traditional"],
    },
    {
      field: "cameraAngle",
      label: "Camera Angle",
      options: ["Eye Level", "High Angle", "Low Angle", "Side View", "Front View", "Back View", "Top View", "Close Portrait", "Full Body", "Wide Landscape"],
    },
    {
      field: "background",
      label: "Background Environment",
      options: ["Temple", "Beach", "Mountains", "Garden", "Studio", "Street", "Forest", "Cafe", "Lake", "Sunset"],
    },
    {
      field: "lighting",
      label: "Lighting Style",
      options: ["Golden Hour", "Morning", "Sunset", "Night", "Indoor Lights", "Natural Light", "Soft Light"],
    },
    {
      field: "clothing",
      label: "Clothing / Outfit",
      options: ["Traditional", "Western", "Casual", "Formal", "Wedding Dress", "Suit", "Lehenga", "Saree", "Sherwani"],
    },
  ];

  const handleSelect = (option) => {
    const currentField = stepsList[step].field;
    setSelections((prev) => ({ ...prev, [currentField]: option }));
    if (step < stepsList.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleNext = () => {
    if (step < stepsList.length - 1 && selections[stepsList[step].field]) {
      setStep((s) => s + 1);
    }
  };

  // Compiler helper matching specified format:
  // [Mood] [Clothing] [Event] [People] [Pose] [Lighting] [Background] [Camera Angle] professional portrait photography 85mm lens cinematic
  const compileQuery = () => {
    const parts = [];
    if (selections.mood) parts.push(selections.mood);
    
    // Add "indian" prefix if traditional elements are selected to optimize results for Indian themes
    const isTraditionalStyle = 
      selections.clothing === "Traditional" || 
      selections.clothing === "Lehenga" || 
      selections.clothing === "Saree" || 
      selections.clothing === "Sherwani" || 
      selections.event === "Traditional" ||
      selections.event === "Festival";
      
    if (isTraditionalStyle) {
      parts.push("indian");
    }

    if (selections.clothing) parts.push(selections.clothing);
    if (selections.event) parts.push(selections.event);
    if (selections.people) parts.push(selections.people);
    if (selections.pose) parts.push(selections.pose);
    if (selections.lighting) parts.push(selections.lighting);
    if (selections.background) parts.push(selections.background);
    if (selections.cameraAngle) parts.push(selections.cameraAngle);

    // Append professional photography style keys
    parts.push("professional portrait photography 85mm lens cinematic");

    return parts.join(" ").toLowerCase();
  };

  const handleSearch = async () => {
    setLoading(true);
    const query = compileQuery();
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
      const formattedPoses = (response.data || []).map((item) => ({
        ...item,
        id: item.id || item._id,
        _id: item._id || item.id,
      }));

      onResultsFetched(formattedPoses, query);
      onClose();
    } catch (error) {
      console.error("Failed to run pexels search wizard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStepInfo = stepsList[step];
  const progressPercent = Math.round(((step + 1) / stepsList.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white border border-border rounded-sm shadow-xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="font-serif text-lg font-bold text-textPrimary">AI Search Query Builder</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-border transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F3F0EB] h-1">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Wizard Selections */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
              Step {step + 1} of {stepsList.length}
            </span>
            <h4 className="font-serif text-xl font-bold text-textPrimary">
              Select {currentStepInfo.label}
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentStepInfo.options.map((opt) => {
              const isSelected = selections[currentStepInfo.field] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`p-3 text-sm font-medium border text-center rounded-sm transition-all ${
                    isSelected
                      ? "bg-primaryLight border-primary text-primaryDark font-semibold"
                      : "bg-white border-border hover:border-primary hover:bg-[#FAECE7]/20 text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Compiled query live preview */}
          <div className="bg-[#FAFAF8] border border-border p-4 rounded-sm space-y-2 mt-4">
            <span className="text-[10px] uppercase font-bold text-textMuted block">Compiled Search Query Preview:</span>
            <p className="text-sm font-mono text-primary font-medium italic break-words">
              {compileQuery() || "(Waiting for selections...)"}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border flex justify-between bg-[#FAFAF8]">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-1 text-xs font-semibold py-2 px-4 rounded-sm transition-colors ${
              step === 0 ? "text-textMuted cursor-not-allowed" : "text-textSecondary hover:text-textPrimary hover:bg-border"
            }`}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex gap-2">
            {step < stepsList.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selections[currentStepInfo.field]}
                className={`flex items-center gap-1 text-xs font-semibold py-2 px-4 rounded-sm transition-colors border ${
                  !selections[currentStepInfo.field]
                    ? "text-textMuted border-border bg-transparent cursor-not-allowed"
                    : "bg-white text-textPrimary hover:border-primary"
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSearch}
                disabled={loading || !selections[currentStepInfo.field]}
                className="bg-primary hover:bg-primaryDark text-white text-xs font-bold py-2.5 px-6 rounded-sm shadow-sm transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    Searching Pexels...
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Search Pexels API
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QueryBuilder;
