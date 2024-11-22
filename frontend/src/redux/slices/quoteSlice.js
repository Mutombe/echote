import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '@/utils/axiosConfig';

export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async () => {
    const response = await api.get(`/quotes/feed/`);
    return response.data.quotes;
  }
);

export const createQuote = createAsyncThunk(
  'quotes/createQuote',
  async ({ text, context, tags, bookId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/quotes/create-quote/`, {
        text,
        context,
        tags,
        book: bookId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const quotesSlice = createSlice({
  name: 'quotes',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});


export const selectQuotes = (state) => state.quotes.items;
export const selectQuoteById = (quoteId) =>
  createSelector([selectQuotes], (quotes) =>
    quotes.find((quote) => quote.id === quoteId)
  );

export default quotesSlice.reducer;
