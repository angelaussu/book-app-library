import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, BookOpen, Calendar, Hash, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { booksApi } from "@/api/books";
import { loansApi } from "@/api/loans";
import { reviewsApi } from "@/api/reviews";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

dayjs.extend(relativeTime);

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useSelector((s: RootState) => s.auth.user);

  const [borrowDays, setBorrowDays] = useState("7");
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const bookId = Number(id);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => booksApi.getBook(bookId),
    enabled: !!bookId,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewsApi.getBookReviews(bookId, { limit: 20 }),
    enabled: !!bookId,
  });

  const borrowMutation = useMutation({
    mutationFn: () => loansApi.borrowBook(bookId, Number(borrowDays)),
    onMutate: async () => {
      // Optimistic UI: decrement availableCopies
      await qc.cancelQueries({ queryKey: ["book", bookId] });
      const prev = qc.getQueryData(["book", bookId]);
      qc.setQueryData(["book", bookId], (old: any) =>
        old ? { ...old, availableCopies: Math.max(0, old.availableCopies - 1) } : old
      );
      return { prev };
    },
    onSuccess: () => {
      setBorrowDialogOpen(false);
      toast.success("Book borrowed successfully!");
      qc.invalidateQueries({ queryKey: ["book", bookId] });
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: any, _vars, ctx) => {
      qc.setQueryData(["book", bookId], ctx?.prev);
      toast.error(err.response?.data?.message ?? "Failed to borrow book.");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.createOrUpdateReview(bookId, reviewStar, reviewComment),
    onSuccess: () => {
      toast.success("Review submitted!");
      setShowReviewForm(false);
      setReviewComment("");
      setReviewStar(5);
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
      qc.invalidateQueries({ queryKey: ["book", bookId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to submit review."),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted.");
      qc.invalidateQueries({ queryKey: ["reviews", bookId] });
    },
    onError: () => toast.error("Failed to delete review."),
  });

  if (isLoading) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-48 h-72 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return <div className="text-center py-16 text-muted-foreground">Book not found.</div>;

  const available = book.availableCopies > 0;
  const reviews = reviewsData?.reviews ?? [];
  const myReview = reviews.find((r) => r.userId === user?.id);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 -ml-2">
        <ArrowLeft size={16} className="mr-1" /> Back
      </Button>

      {/* Book info */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover */}
        <div className="shrink-0">
          <div className="w-44 h-64 rounded-xl overflow-hidden shadow-lg bg-muted mx-auto md:mx-0">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                <span className="text-5xl">📚</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={available ? "success" : "secondary"}>
              {available ? `${book.availableCopies} available` : "Unavailable"}
            </Badge>
            {book.category && <Badge variant="outline">{book.category.name}</Badge>}
          </div>

          <h1 className="text-2xl font-bold mb-1 leading-tight">{book.title}</h1>
          <p className="text-muted-foreground mb-3">by {book.author?.name ?? "Unknown Author"}</p>

          <div className="flex items-center gap-3 mb-4">
            <StarRating value={book.rating} size={18} />
            <span className="font-semibold">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({book.reviewCount} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
            {book.publishedYear && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {book.publishedYear}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {book.totalCopies} copies total
            </span>
            <span className="flex items-center gap-1.5">
              <Hash size={14} />
              ISBN: {book.isbn}
            </span>
          </div>

          {book.description && (
            <p className="text-sm leading-relaxed text-muted-foreground mb-5">{book.description}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!available || borrowMutation.isPending}
              onClick={() => setBorrowDialogOpen(true)}
            >
              <Bookmark size={16} />
              {available ? "Borrow this Book" : "Not Available"}
            </Button>
            <Button variant="outline" onClick={() => setShowReviewForm((v) => !v)}>
              <Star size={16} />
              {myReview ? "Edit My Review" : "Add Review"}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Review form */}
      {showReviewForm && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-3">{myReview ? "Edit Your Review" : "Write a Review"}</h3>
          <div className="mb-3">
            <Label className="mb-1.5 block text-sm">Your Rating</Label>
            <StarRating value={reviewStar} interactive onChange={setReviewStar} size={24} />
          </div>
          <div className="mb-3">
            <Label htmlFor="comment" className="mb-1.5 block text-sm">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this book…"
              value={reviewComment || (myReview?.comment ?? "")}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={reviewMutation.isPending}
              onClick={() => {
                const comment = reviewComment || myReview?.comment || "";
                if (!comment.trim()) return toast.error("Please write a comment.");
                reviewMutation.mutate();
              }}
            >
              {reviewMutation.isPending ? "Submitting…" : "Submit Review"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Reviews ({reviewsData?.pagination.total ?? 0})</h2>
        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3 p-4 rounded-lg border">
                <Avatar className="w-9 h-9 shrink-0">
                  {review.user?.profilePhoto && <AvatarImage src={review.user.profilePhoto} />}
                  <AvatarFallback className="text-xs">
                    {review.user?.name?.slice(0, 2).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user?.name ?? "Anonymous"}</span>
                    <StarRating value={review.star} size={12} />
                    <span className="text-xs text-muted-foreground ml-auto">
                      {dayjs(review.createdAt).fromNow()}
                    </span>
                    {review.userId === user?.id && (
                      <button
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        disabled={deleteReviewMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Borrow dialog */}
      <Dialog open={borrowDialogOpen} onOpenChange={setBorrowDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Borrow "{book.title}"</DialogTitle>
            <DialogDescription>Choose how many days you'd like to borrow this book.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="days">Borrowing Duration</Label>
            <Select value={borrowDays} onValueChange={setBorrowDays}>
              <SelectTrigger id="days">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="5">5 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Due date:{" "}
              <span className="font-medium text-foreground">
                {dayjs().add(Number(borrowDays), "day").format("DD MMM YYYY")}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBorrowDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => borrowMutation.mutate()} disabled={borrowMutation.isPending}>
              {borrowMutation.isPending ? "Borrowing…" : "Confirm Borrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
