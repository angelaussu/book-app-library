import { apiClient } from "./client";
import type { ReviewsResponse, Review } from "@/types";

export const reviewsApi = {
  getBookReviews: async (bookId: number, params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get<{ data: ReviewsResponse }>(`/api/reviews/book/${bookId}`, { params });
    return res.data.data;
  },
  createOrUpdateReview: async (bookId: number, star: number, comment: string) => {
    const res = await apiClient.post<{ data: Review }>("/api/reviews", { bookId, star, comment });
    return res.data.data;
  },
  deleteReview: async (reviewId: number) => {
    const res = await apiClient.delete(`/api/reviews/${reviewId}`);
    return res.data;
  },
};
