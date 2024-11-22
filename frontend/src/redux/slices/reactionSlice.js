import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '@/utils/axiosConfig';

export const fetchReactions = createAsyncThunk(
  'reactions/fetchReactions',
  async (quoteId) => {
    const response = await api.get(`/quotes/${quoteId}/reactions/`);
    return response.data;
  }
);

export const createReaction = createAsyncThunk(
  'reactions/createReaction',
  async ({ quoteId, reactionType }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/quotes/${quoteId}/reactions/`, { reaction_type: reactionType });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const reactionsSlice = createSlice({
  name: 'reactions',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchReactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createReaction.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});


export const selectReactions = (state) => state.reactions.items;
export const selectReactionsByQuoteId = (quoteId) =>
  createSelector([selectReactions], (reactions) =>
    reactions.filter((reaction) => reaction.quoteId === quoteId)
  );

export default reactionsSlice.reducer;

