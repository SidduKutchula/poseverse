import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSavedPoses, addSavedPose, removeSavedPose } from "../store/slices/moodBoardSlice";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import api from "../utils/api";

const MoodBoardContext = createContext(null);

export const MoodBoardProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const savedPoses = useSelector((state) => state.moodBoard.savedPoses);

  // Sync with backend if logged in
  useEffect(() => {
    const fetchSavedPoses = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get("/moodboard");
        const ids = response.data.map((p) => p.id || p._id);
        dispatch(setSavedPoses(ids));
      } catch (error) {
        console.warn("Failed to sync moodboard with server, using local storage:", error.message);
      }
    };

    fetchSavedPoses();
  }, [isAuthenticated, dispatch]);

  const toggleSave = async (poseId) => {
    if (!isAuthenticated) {
      showToast("Please sign in to save poses to your mood board.", "info");
      return false;
    }

    const isAlreadySaved = savedPoses.includes(poseId);

    if (isAlreadySaved) {
      dispatch(removeSavedPose(poseId));
      showToast("Pose removed from Mood Board", "info");
    } else {
      dispatch(addSavedPose(poseId));
      showToast("Pose saved to Mood Board!", "success");
    }

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

  const setSavedPosesRedux = (poses) => {
    dispatch(setSavedPoses(poses));
  };

  return (
    <MoodBoardContext.Provider value={{ savedPoses, toggleSave, setSavedPoses: setSavedPosesRedux }}>
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

