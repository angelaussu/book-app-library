import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "@/store";
import type { User } from "@/types";

interface Props {
  allowedRoles?: User["role"][];
}

export function ProtectedRoute({ allowedRoles }: Props = {}) {
  const { token, user } = useSelector((s: RootState) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/books"} replace />;
  }

  return <Outlet />;
}
