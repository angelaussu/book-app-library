import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { booksApi } from "@/api/books";
import { loansApi } from "@/api/loans";
import { reviewsApi } from "@/api/reviews";
import type { RootState } from "@/store";
import type { ReviewsResponse } from "@/types";

export function useBookDetail(bookId: number) {
  const qc = useQueryClient();
  const user = useSelector((s: RootState) => s.auth.user);

  const bookQuery = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => booksApi.getBook(bookId),
    enabled: !!bookId,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewsApi.getBookReviews(bookId, { limit: 20 }),
    enabled: !!bookId,
  });

  const borrowMutation = useMutation({
    mutationFn: (days: number) => loansApi.borrowBook(bookId, days),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["book", bookId] });
      const prev = qc.getQueryData(["book", bookId]);
      qc.setQueryData(["book", bookId], (old: any) =>
        old ? { ...old, availableCopies: Math.max(0, old.availableCopies - 1) } : old
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success("Book borrowed successfully!");
    },
    onError: (err: any, _vars, ctx: any) => {
      qc.setQueryData(["book", bookId], ctx?.prev);
      toast.error(err.response?.data?.message ?? "Failed to borrow book.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["book", bookId] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ star, comment }: { star: number; comment: string }) =>
      reviewsApi.createOrUpdateReview(bookId, star, comment),
    onSuccess: () => {
      toast.success("Review submitted!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to submit review."),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["book", bookId] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId),
    onMutate: async (reviewId: number) => {
      await qc.cancelQueries({ queryKey: ["reviews", bookId] });
      const prev = qc.getQueryData<ReviewsResponse>(["reviews", bookId]);
      qc.setQueryData(["reviews", bookId], (old: ReviewsResponse | undefined) =>
        old
          ? { ...old, reviews: old.reviews.filter((r) => r.id !== reviewId) }
          : old
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success("Review deleted.");
    },
    onError: (_err: any, _vars, ctx: any) => {
      qc.setQueryData(["reviews", bookId], ctx?.prev);
      toast.error("Failed to delete review.");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["book", bookId] });
    },
  });

  const reviews = reviewsQuery.data?.reviews ?? [];
  const myReview = reviews.find((r) => r.userId === user?.id);

  return {
    book: bookQuery.data,
    bookQuery,
    reviewsQuery,
    reviews,
    myReview,
    user,
    borrowMutation,
    reviewMutation,
    deleteReviewMutation,
  };
}
