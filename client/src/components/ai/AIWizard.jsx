import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Check, Heart, Plus } from "lucide-react";
import api from "../../utils/api";
import PoseCard from "../pose/PoseCard";
import { useToast } from "../../context/ToastContext";
import { useMoodBoard } from "../../context/MoodBoardContext";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../utils/analytics";

const WizardCard = ({ label, emoji, selected, onClick }) => (
  <motion.div
    className={`p-4 rounded-md border-2 cursor-pointer flex flex-col items-center justify-center gap-2 text-center transition-colors duration-150 ${
      selected
        ? "bg-[#FAECE7] border-[#D85A30]"
        : "bg-white border-[#E8E4DE] hover:bg-[#FAECE7]/30 hover:border-[#F09975]"
    }`}
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
  >
    {emoji && <span className="text-2xl">{emoji}</span>}
    <span className={`text-sm font-medium ${selected ? "text-[#993C1D] font-bold" : "text-[#1A1814]"}`}>
      {label}
    </span>
  </motion.div>
);

const AIWizard = () => {
  const { showToast } = useToast();
  const { toggleSave, savedPoses } = useMoodBoard();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    occasion: "",
    location: "Outdoor", // Indoor / Outdoor / Both
    people: "Couple", // Solo / Couple / Group
    style: "Cinematic", // Traditional / Modern / Cinematic / Candid / Experimental
    experience: "First time", // First time / Occasional / Experienced
    timeOfDay: "Golden Hour" // Morning / Golden Hour / Afternoon / Night
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingText, setLoadingText] = useState("Analyzing your aesthetic profile...");

  const occasions = [
    { label: "Wedding", slug: "wedding", emoji: "💍" },
    { label: "Pre-Wedding", slug: "preWedding", emoji: "🌸" },
    { label: "Maternity", slug: "maternity", emoji: "🤰" },
    { label: "Birthday", slug: "birthday", emoji: "🎂" },
    { label: "Traditional", slug: "traditional", emoji: "🪔" },
    { label: "Couple", slug: "couple", emoji: "❤️" },
    { label: "Graduation", slug: "graduation", emoji: "🎓" },
    { label: "Fashion", slug: "fashion", emoji: "📸" },
    { label: "Festival", slug: "festival", emoji: "🎉" },
    { label: "Kids", slug: "kids", emoji: "👶" },
  ];

  const locations = ["Indoor", "Outdoor", "Both"];
  const subjects = ["Solo", "Couple", "Group"];
  
  const styles = [
    { label: "Traditional", value: "Traditional", emoji: "🥻" },
    { label: "Modern", value: "Modern", emoji: "✨" },
    { label: "Cinematic", value: "Cinematic", emoji: "🎬" },
    { label: "Candid", value: "Candid", emoji: "📸" },
    { label: "Experimental", value: "Experimental", emoji: "🧪" }
  ];

  const experiences = ["First time", "Occasional", "Experienced"];
  const timings = ["Morning", "Golden Hour", "Afternoon", "Night"];

  // 2.5s typewriter loading messages
  useEffect(() => {
    if (step !== 5 || !loading) return;

    const texts = [
      "Analyzing lighting conditions...",
      "Curating Indian cultural aesthetics...",
      "Consulting photoshoot archives...",
      "Perfecting angles and setups...",
      "Matching category reference boards...",
      "Almost ready..."
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 1200);

    return () => clearInterval(interval);
  }, [step, loading]);

  const handleSelect = (field, value) => {
    setSelections((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !selections.occasion) {
      return showToast("Please select an occasion", "info");
    }
    if (step === 2 && (!selections.location || !selections.people)) {
      return showToast("Please configure location and subject size", "info");
    }
    if (step === 3 && !selections.style) {
      return showToast("Please select a shoot style", "info");
    }
    if (step === 4 && (!selections.experience || !selections.timeOfDay)) {
      return showToast("Please pick experience and timing", "info");
    }

    const nextVal = step + 1;
    setStep(nextVal);

    if (nextVal === 5) {
      fetchRecommendations();
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setLoadingText("Analyzing your aesthetic profile...");
    
    // Enforce 2.5s visual loading experience before showing results
    const apiCallPromise = api.post("/ai/recommend", selections);
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const [response] = await Promise.all([apiCallPromise, delayPromise]);
      setResults(response.data.poses || response.data || []);
      showToast("Generated 12 photoshoot suggestions!", "success");
      trackEvent("get_ai_suggestion", {
        occasion: selections.occasion,
        location: selections.location,
        people: selections.people,
        style: selections.style,
        experience: selections.experience,
        time_of_day: selections.timeOfDay
      });
    } catch (error) {
      showToast("Error generating recommendations", "error");
      console.error(error);
      setStep(4); // Go back to prevent infinite loading state
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    let savedCount = 0;
    for (const pose of results) {
      const id = pose.id || pose._id;
      if (!savedPoses.includes(id)) {
        await toggleSave(id);
        savedCount++;
      }
    }
    if (savedCount > 0) {
      showToast(`Saved ${savedCount} new poses to your mood board!`, "success");
      trackEvent("save_all_ai_suggestions", {
        count: savedCount,
        occasion: selections.occasion
      });
    } else {
      showToast("All poses are already saved to your board.", "info");
    }
  };

  const resetWizard = () => {
    setSelections({
      occasion: "",
      location: "Outdoor",
      people: "Couple",
      style: "Cinematic",
      experience: "First time",
      timeOfDay: "Golden Hour"
    });
    setResults([]);
    setStep(1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-center text-textPrimary">
              Choose the Occasion
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {occasions.map((o) => (
                <WizardCard
                  key={o.slug}
                  label={o.label}
                  emoji={o.emoji}
                  selected={selections.occasion === o.slug}
                  onClick={() => handleSelect("occasion", o.slug)}
                />
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-center text-textPrimary">
              Shoot Details
            </h3>
            
            <div className="space-y-3 max-w-xl mx-auto">
              <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                1. Location Type
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {locations.map((loc) => (
                  <WizardCard
                    key={loc}
                    label={loc}
                    selected={selections.location === loc}
                    onClick={() => handleSelect("location", loc)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 max-w-xl mx-auto pt-2">
              <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                2. Posing Subjects
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {subjects.map((sub) => (
                  <WizardCard
                    key={sub}
                    label={`${sub} Shoot`}
                    selected={selections.people === sub}
                    onClick={() => handleSelect("people", sub)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-center text-textPrimary">
              Select Photography Style
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {styles.map((st) => (
                <WizardCard
                  key={st.value}
                  label={st.label}
                  emoji={st.emoji}
                  selected={selections.style === st.value}
                  onClick={() => handleSelect("style", st.value)}
                />
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-center text-textPrimary">
              Experience & Timing
            </h3>

            <div className="space-y-3 max-w-xl mx-auto">
              <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                1. Posing Experience
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {experiences.map((exp) => (
                  <WizardCard
                    key={exp}
                    label={exp}
                    selected={selections.experience === exp}
                    onClick={() => handleSelect("experience", exp)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 max-w-xl mx-auto pt-2">
              <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                2. Shoot Timing
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {timings.map((time) => (
                  <WizardCard
                    key={time}
                    label={time}
                    selected={selections.timeOfDay === time}
                    onClick={() => handleSelect("timeOfDay", time)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        if (loading) {
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw size={40} className="text-primary animate-spin" />
              <p className="text-lg font-serif italic text-primary animate-pulse">
                {loadingText}
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-border p-5 rounded-sm shadow-sm">
              <div className="text-center md:text-left space-y-1">
                <h3 className="font-serif text-2xl font-bold text-textPrimary">
                  Your 12 Perfect Poses
                </h3>
                <p className="text-xs text-textSecondary font-light">
                  Tailored suggestions based on your choice of <span className="font-semibold text-primary">{selections.occasion}</span>, <span className="font-semibold text-primary">{selections.style}</span> style, and timing.
                </p>
              </div>
              
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleSaveAll}
                  className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Heart size={14} className="fill-white" />
                  Save All
                </button>
                <button
                  onClick={fetchRecommendations}
                  className="bg-white border border-border hover:border-primaryMid text-textSecondary hover:text-textPrimary text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Masonry results grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 w-full">
              {results.map((pose, idx) => {
                const id = pose.id || pose._id;
                const score = pose.matchScore || (98 - idx * 2);
                return (
                  <div key={id} className="relative break-inside-avoid mb-4 group">
                    <PoseCard pose={pose} index={idx} />
                    {/* Gold matchScore badge overlay top-center */}
                    <div className="absolute top-3 left-[50%] translate-x-[-50%] bg-[#C49A3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md pointer-events-none z-10">
                      {score}% MATCH
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={resetWizard}
                className="bg-primaryLight text-primaryDark border border-primary/20 hover:bg-primaryLight/70 text-sm font-semibold px-6 py-3 rounded-sm transition-colors flex items-center gap-2"
              >
                <Sparkles size={16} />
                Start New Recommendation
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-border p-6 sm:p-8 rounded-sm shadow-sm">
      {/* Progress Bar & Header */}
      {step <= 4 && (
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center text-xs text-textMuted uppercase tracking-widest font-semibold">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[#F3F0EB] h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-primary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Main Wizard Form Wrapper with Slide transitions */}
      <div className="overflow-hidden min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      {step <= 4 && (
        <div className="mt-8 pt-6 border-t border-border flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 px-4 rounded-sm ${
              step === 1
                ? "text-textMuted cursor-not-allowed"
                : "text-textSecondary hover:text-textPrimary hover:bg-[#F3F0EB]"
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={nextStep}
            className="bg-primary hover:bg-primaryDark text-white text-sm font-semibold py-2 px-6 rounded-sm shadow-sm transition-colors flex items-center gap-1.5"
          >
            {step === 4 ? "Generate Suggestion" : "Next"}
            {step < 4 && <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIWizard;
