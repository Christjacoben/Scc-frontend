import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import eventReducer from "./eventSlice";
import eventDetailsReducer from "./eventDetailsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    events: eventReducer,
    eventDetails: eventDetailsReducer,
  },
});
