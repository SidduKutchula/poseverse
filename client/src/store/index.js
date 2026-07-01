import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import moodBoardReducer from "./slices/moodBoardSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    moodBoard: moodBoardReducer,
  },
});

export default store;
