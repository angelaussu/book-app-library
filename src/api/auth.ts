import { apiClient } from "./client";
import type { LoginResponse } from "@/types";

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ data: LoginResponse }>("/api/auth/login", { email, password });
    return res.data.data;
  },
  register: async (name: string, email: string, password: string, phone?: string) => {
    const res = await apiClient.post("/api/auth/register", { name, email, password, phone });
    return res.data;
  },
};
