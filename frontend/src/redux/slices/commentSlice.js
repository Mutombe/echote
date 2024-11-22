import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '@/utils/axiosConfig';

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (quoteId) => {
    const response = await api.get(`/quotes/${quoteId}/comments/`);
    return response.data;
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ quoteId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/quotes/${quoteId}/comments/`, { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const selectComments = (state) => state.comments.items;
export const selectCommentsByQuoteId = (quoteId) =>
  createSelector([selectComments], (comments) =>
    comments.filter((comment) => comment.quoteId === quoteId)
  );

export default commentsSlice.reducer;

