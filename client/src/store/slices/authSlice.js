import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, setLoading, logoutUser } = authSlice.actions;
export default authSlice.reducer;
