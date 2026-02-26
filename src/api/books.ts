import { apiClient } from "./client";
import type { BooksResponse, Book, BooksQuery } from "@/types";

export const booksApi = {
  getBooks: async (params: BooksQuery = {}) => {
    const res = await apiClient.get<{ data: BooksResponse }>("/api/books", { params });
    return res.data.data;
  },
  getBook: async (id: number) => {
    const res = await apiClient.get<{ data: Book }>(`/api/books/${id}`);
    return res.data.data;
  },
  getRecommended: async (page = 1) => {
    const res = await apiClient.get<{ data: BooksResponse }>("/api/books/recommend", { params: { page } });
    return res.data.data;
  },
};
