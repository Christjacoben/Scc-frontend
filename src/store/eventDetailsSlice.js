import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchEventDetails = createAsyncThunk(
  "eventDetails/fetchEventDetails",
  async (eventTitle, thunkAPI) => {
    try {
      const response = await fetch(
        `https://ssc-backend.onrender.com/api/scanEvent/${eventTitle}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Failed to fetch event details"
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Network error");
    }
  }
);

const eventDetailsSlice = createSlice({
  name: "eventDetails",
  initialState: {
    event: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.event = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default eventDetailsSlice.reducer;
