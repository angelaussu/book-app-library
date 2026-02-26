export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: number;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  author?: Author;
  category?: Category;
}

export interface Review {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    profilePhoto: string | null;
  };
}

export interface Loan {
  id: number;
  status: "BORROWED" | "RETURNED" | "LATE";
  displayStatus: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  durationDays: number;
  book?: Book;
  user?: User;
}

export interface LoanStats {
  borrowed: number;
  late: number;
  returned: number;
  total: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BooksResponse {
  books: Book[];
  pagination: Pagination;
}

export interface LoansResponse {
  loans: Loan[];
  pagination?: Pagination;
}

export interface ReviewsResponse {
  bookId: number;
  reviews: Review[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ProfileResponse {
  profile: User;
  loanStats: LoanStats;
  reviewsCount: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BooksQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | number;
  rating?: number;
}
