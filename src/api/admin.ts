import { apiClient } from "./client";
import type { Book, Loan, User, Pagination } from "@/types";

export interface AdminOverview {
  totalBooks: number;
  availableBooks: number;
  totalUsers: number;
  activeLoans: number;
  lateLoans: number;
  totalLoans: number;
}

export interface AdminBooksResponse {
  books: Book[];
  pagination: Pagination;
}

export interface AdminLoansResponse {
  loans: Loan[];
  pagination?: Pagination;
}

export interface AdminUsersResponse {
  users: User[];
  pagination?: Pagination;
}

export const adminApi = {
  getOverview: async () => {
    const res = await apiClient.get("/api/admin/overview");
    console.log("Overview raw response:", res.data);
    const d = res.data.data ?? res.data;
    return {
      totalBooks:    d.totalBooks    ?? d.books        ?? 0,
      availableBooks:d.availableBooks?? d.availableCopies ?? d.available ?? 0,
      totalUsers:    d.totalUsers    ?? d.users        ?? 0,
      activeLoans:   d.activeLoans   ?? d.borrowed     ?? d.active     ?? 0,
      lateLoans:     d.lateLoans     ?? d.overdueLoans ?? d.overdue    ?? d.late ?? 0,
      totalLoans:    d.totalLoans    ?? d.total        ?? 0,
    } as AdminOverview;
  },
  getBooks: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const res = await apiClient.get<{ data: AdminBooksResponse }>("/api/admin/books", { params });
    return res.data.data;
  },
  getLoans: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await apiClient.get<{ data: AdminLoansResponse }>("/api/admin/loans", { params });
    return res.data.data;
  },
  getUsers: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const res = await apiClient.get<{ data: AdminUsersResponse }>("/api/admin/users", { params });
    return res.data.data;
  },
};
