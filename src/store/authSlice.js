import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAunthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAunthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAunthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
