import { configureStore } from '@reduxjs/toolkit';
import quotesReducer from '../slices/quoteSlice';
import booksReducer from '../slices/booksSlice';
import authReducer from '../slices/authSlice';
import bookmarkReducer from '../slices/bookmarkSlice';
import commentsReducer from '../slices/commentSlice';
import reactionsReducer from '../slices/reactionSlice';
import userPreferencesReducer from '../slices/userPrefenceSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        quotes: quotesReducer,
        books: booksReducer,
        bookmarks: bookmarkReducer,
        comments: commentsReducer,
        reactions: reactionsReducer,
        userPreferences: userPreferencesReducer
    }
});

export default store;
