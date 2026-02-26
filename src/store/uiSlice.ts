import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  search: string;
  selectedCategory: string | number;
}

const initialState: UIState = {
  search: "",
  selectedCategory: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string | number>) {
      state.selectedCategory = action.payload;
    },
    resetFilters(state) {
      state.search = "";
      state.selectedCategory = "";
    },
  },
});

export const { setSearch, setSelectedCategory, resetFilters } = uiSlice.actions;
export default uiSlice.reducer;
