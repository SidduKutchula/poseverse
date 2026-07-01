import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import api from "../utils/api";

const MoodBoardContext = createContext(null);

export const MoodBoardProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Local storage backup for offline or initial state
  const [savedPoses, setSavedPoses] = useState(() => {
    try {
      const local = localStorage.getItem("savedPoses");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Sync with backend if logged in
  useEffect(() => {
    const fetchSavedPoses = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get("/moodboard");
        // The API returns full populated objects or an empty array
        const ids = response.data.map((p) => p.id || p._id);
        setSavedPoses(ids);
        localStorage.setItem("savedPoses", JSON.stringify(ids));
      } catch (error) {
        console.warn("Failed to sync moodboard with server, using local storage:", error.message);
      }
    };

    fetchSavedPoses();
  }, [isAuthenticated]);

  const toggleSave = async (poseId) => {
    if (!isAuthenticated) {
      showToast("Please sign in to save poses to your mood board.", "info");
      return false; // Tells the component to navigate to login
    }

    const isAlreadySaved = savedPoses.includes(poseId);
    let updated;

    if (isAlreadySaved) {
      updated = savedPoses.filter(id => id !== poseId);
      showToast("Pose removed from Mood Board", "info");
    } else {
      updated = [...savedPoses, poseId];
      showToast("Pose saved to Mood Board!", "success");
    }

    // Optimistic UI update
    setSavedPoses(updated);
    localStorage.setItem("savedPoses", JSON.stringify(updated));

    // Async server update
    try {
      if (isAlreadySaved) {
        await api.delete(`/moodboard/${poseId}`);
      } else {
        await api.post("/moodboard/add", { poseId });
      }
    } catch (error) {
      console.error("Failed to sync toggle with server:", error.message);
    }
    return true;
  };

  return (
    <MoodBoardContext.Provider value={{ savedPoses, toggleSave, setSavedPoses }}>
      {children}
    </MoodBoardContext.Provider>
  );
};

export const useMoodBoard = () => {
  const context = useContext(MoodBoardContext);
  if (!context) {
    throw new Error("useMoodBoard must be used within a MoodBoardProvider");
  }
  return context;
};
export default MoodBoardContext;
