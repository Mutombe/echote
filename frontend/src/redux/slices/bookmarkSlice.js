import { createSlice } from '@reduxjs/toolkit';

const bookmarksSlice = createSlice({
    name: 'bookmarks',
    initialState: {
        items: {}
    },
    reducers: {
        toggleBookmark: (state, action) => {
            const quoteId = action.payload;
            state.items[quoteId] = !state.items[quoteId];
        }
    }
});

export const { toggleBookmark } = bookmarksSlice.actions;
export const selectBookmarks = (state) => state.bookmarks.items;

export default bookmarksSlice.reducer;
