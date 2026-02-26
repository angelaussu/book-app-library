import { apiClient } from "./client";
import type { LoansResponse, Loan } from "@/types";

export const loansApi = {
  borrowBook: async (bookId: number, days: number) => {
    const res = await apiClient.post<{ data: Loan }>("/api/loans", { bookId, days });
    return res.data.data;
  },
  returnBook: async (loanId: number) => {
    const res = await apiClient.patch<{ data: Loan }>(`/api/loans/${loanId}/return`);
    return res.data.data;
  },
  getMyLoans: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await apiClient.get<{ data: LoansResponse }>("/api/loans/my", { params });
    return res.data.data;
  },
};
