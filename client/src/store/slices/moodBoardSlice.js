import { createSlice } from "@reduxjs/toolkit";

const getInitialSavedPoses = () => {
  try {
    const local = localStorage.getItem("savedPoses");
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
};

const initialState = {
  savedPoses: getInitialSavedPoses(),
};

const moodBoardSlice = createSlice({
  name: "moodBoard",
  initialState,
  reducers: {
    setSavedPoses: (state, action) => {
      state.savedPoses = action.payload;
      localStorage.setItem("savedPoses", JSON.stringify(action.payload));
    },
    addSavedPose: (state, action) => {
      if (!state.savedPoses.includes(action.payload)) {
        state.savedPoses.push(action.payload);
        localStorage.setItem("savedPoses", JSON.stringify(state.savedPoses));
      }
    },
    removeSavedPose: (state, action) => {
      state.savedPoses = state.savedPoses.filter((id) => id !== action.payload);
      localStorage.setItem("savedPoses", JSON.stringify(state.savedPoses));
    },
  },
});

export const { setSavedPoses, addSavedPose, removeSavedPose } = moodBoardSlice.actions;
export default moodBoardSlice.reducer;
