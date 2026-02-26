import { apiClient } from "./client";
import type { CategoriesResponse } from "@/types";

export const categoriesApi = {
  getCategories: async () => {
    const res = await apiClient.get<{ data: CategoriesResponse }>("/api/categories");
    return res.data.data.categories;
  },
};
