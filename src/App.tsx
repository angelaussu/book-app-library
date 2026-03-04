import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store } from "@/store";
import type { RootState } from "@/store";
import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { BooksPage } from "@/pages/BooksPage";
import { BookDetailPage } from "@/pages/BookDetailPage";
import { MyLoansPage } from "@/pages/MyLoansPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminBooksPage } from "@/pages/admin/AdminBooksPage";
import { AdminLoansPage } from "@/pages/admin/AdminLoansPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";

function SmartRedirect() {
  const user = useSelector((s: RootState) => s.auth.user);
  return <Navigate to={user?.role === "ADMIN" ? "/admin/dashboard" : "/books"} replace />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User routes */}
            <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
              <Route element={<Layout />}>
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailPage />} />
                <Route path="/my-loans" element={<MyLoansPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/books" element={<AdminBooksPage />} />
                <Route path="/admin/loans" element={<AdminLoansPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}
