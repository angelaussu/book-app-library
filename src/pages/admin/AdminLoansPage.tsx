import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { adminApi } from "@/api/admin";
import { loansApi } from "@/api/loans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  BORROWED: "default",
  RETURNED: "secondary",
  LATE: "destructive",
};

export function AdminLoansPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "loans", { page, status }],
    queryFn: () => adminApi.getLoans({ page, limit: 10, status: status || undefined }),
  });

  const returnMutation = useMutation({
    mutationFn: (loanId: number) => loansApi.returnBook(loanId),
    onSuccess: () => {
      toast.success("Book returned.");
      qc.invalidateQueries({ queryKey: ["admin", "loans"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to return."),
  });

  const loans = data?.loans ?? [];
  const pagination = data?.pagination;

  const filters = [
    { label: "All", value: "" },
    { label: "Active", value: "BORROWED" },
    { label: "Late", value: "LATE" },
    { label: "Returned", value: "RETURNED" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Loans</h1>
        <p className="text-muted-foreground text-sm">Manage all borrowing activity</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              status === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Book</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Borrowed</th>
              <th className="text-left px-4 py-3 font-medium">Due</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr><td colSpan={6} className="text-center py-10 text-destructive">Failed to load loans.</td></tr>
            ) : loans.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <FileText size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No loans found</p>
                </td>
              </tr>
            ) : (
              loans.map((loan) => {
                const isActive = loan.status === "BORROWED" || loan.status === "LATE";
                return (
                  <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{loan.book?.title ?? `Loan #${loan.id}`}</td>
                    <td className="px-4 py-3 text-muted-foreground">{loan.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dayjs(loan.borrowedAt).format("D MMM YYYY")}</td>
                    <td className={cn("px-4 py-3", loan.status === "LATE" && "text-destructive font-medium")}>
                      {dayjs(loan.dueAt).format("D MMM YYYY")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariant[loan.status] ?? "secondary"}>
                        {loan.displayStatus ?? loan.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={returnMutation.isPending}
                          onClick={() => returnMutation.mutate(loan.id)}
                        >
                          <RotateCcw size={13} /> Return
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {loans.length} of {pagination.total} loans
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center px-2 text-muted-foreground">Page {page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
