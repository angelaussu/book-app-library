import { apiClient } from "./client";
import type { ProfileResponse } from "@/types";

export const usersApi = {
  getProfile: async () => {
    const res = await apiClient.get<{ data: ProfileResponse }>("/api/me");
    return res.data.data;
  },
  updateProfile: async (data: { name?: string; phone?: string; profilePhoto?: string }) => {
    const res = await apiClient.patch<{ data: ProfileResponse }>("/api/me", data);
    return res.data.data;
  },
};
