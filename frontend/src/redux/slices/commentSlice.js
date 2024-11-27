import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '@/utils/axiosConfig';

export const fetchCommentsByQuote = createAsyncThunk(
  'comments/fetchByQuote',
  async (quoteId) => {
    const response = await api.get(`api/comments/quote/${quoteId}/`);
    return response.data;
  }
);

export const createNestedComment = createAsyncThunk(
  'comments/createNested',
  async ({ quoteId, text, parentId = null }, { rejectWithValue }) => {
    try {
      const response = await api.post(`api/comments/`, { 
        quote: quoteId, 
        content: text, 
        parent: parentId 
      });
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

