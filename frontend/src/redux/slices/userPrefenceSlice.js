import { createSlice } from '@reduxjs/toolkit';

const userPreferencesSlice = createSlice({
    name: 'userPreferences',
    initialState: {
        activeTab: 'trending'
    },
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        }
    }
});

export const { setActiveTab } = userPreferencesSlice.actions;
export const selectActiveTab = (state) => state.userPreferences.activeTab;

export default userPreferencesSlice.reducer;
