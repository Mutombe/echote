import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/axiosConfig';

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/books/search/?q=${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchBookDetails = createAsyncThunk(
  'books/fetchBookDetails',
  async (googleBooksId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/books/${googleBooksId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    searchResults: [],
    selectedBook: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    selectBookForQuote(state, action) {
      state.selectedBook = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchBookDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedBook = action.payload;
      })
      .addCase(fetchBookDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { selectBookForQuote } = booksSlice.actions;

export const selectSearchResults = (state) => state.books.searchResults;
export const selectBookById = (state, googleBooksId) =>
  state.books.searchResults.find((book) => book.google_books_id === googleBooksId);
export const selectSelectedBook = (state) => state.books.selectedBook;
export const selectBooksStatus = (state) => state.books.status;
export const selectBooksError = (state) => state.books.error;

export default booksSlice.reducer;
