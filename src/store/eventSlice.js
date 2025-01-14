import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await fetch("https://ssc-backend.onrender.com/api/events");
  const data = await response.json();
  console.log("data", data);
  return data;
});

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default eventSlice.reducer;
