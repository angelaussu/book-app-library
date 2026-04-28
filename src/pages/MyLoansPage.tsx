import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, BookOpen, RotateCcw, Clock } from "lucide-react";
import dayjs from "dayjs";
import { useMyLoans } from "@/hooks/useMyLoans";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  BORROWED: "bg-blue-100 text-blue-800",
  RETURNED: "bg-green-100 text-green-800",
  LATE: "bg-red-100 text-red-800",
};

export function MyLoansPage() {
  const [tab, setTab] = useState("all");
  const { loans, isLoading, isError, refetch, returnMutation } = useMyLoans();

  const filtered = loans.filter((l) => {
    if (tab === "active") return l.status === "BORROWED" || l.status === "LATE";
    if (tab === "returned") return l.status === "RETURNED";
    return true;
  });

  const activeCount = loans.filter((l) => l.status === "BORROWED" || l.status === "LATE").length;
  const returnedCount = loans.filter((l) => l.status === "RETURNED").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Loans</h1>
        <p className="text-muted-foreground text-sm">Track your borrowed books and return history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Loans", value: loans.length, icon: BookOpen, color: "text-primary" },
          { label: "Active", value: activeCount, icon: Clock, color: "text-blue-600" },
          { label: "Returned", value: returnedCount, icon: RotateCcw, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-card p-4 text-center">
            <Icon size={20} className={cn("mx-auto mb-1", color)} />
            <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({isLoading ? "…" : loans.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({isLoading ? "…" : activeCount})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({isLoading ? "…" : returnedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                  <Skeleton className="w-12 h-16 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="font-medium text-destructive">Failed to load loans.</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-muted-foreground">No loans here</p>
              {tab === "all" && (
                <Link to="/books">
                  <Button variant="outline" size="sm" className="mt-3">Browse Books</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((loan) => {
                const isOverdue = dayjs().isAfter(dayjs(loan.dueAt)) && loan.status !== "RETURNED";
                const isActive = loan.status === "BORROWED" || loan.status === "LATE";

                return (
                  <div key={loan.id} className="flex gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                    {/* Cover */}
                    <Link to={`/books/${loan.book?.id}`} className="shrink-0">
                      <div className="w-12 h-16 rounded overflow-hidden bg-muted">
                        {loan.book?.coverImage ? (
                          <img src={loan.book.coverImage} alt={loan.book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <Link to={`/books/${loan.book?.id}`} className="font-medium text-sm leading-tight hover:text-primary truncate flex-1">
                          {loan.book?.title ?? "Unknown Book"}
                        </Link>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", statusColor[loan.status] ?? "bg-muted")}>
                          {isOverdue && isActive ? "Overdue" : loan.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{loan.book?.author?.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> Borrowed: {dayjs(loan.borrowedAt).format("DD MMM YYYY")}
                        </span>
                        <span className={cn("flex items-center gap-1", isOverdue && isActive && "text-red-600 font-medium")}>
                          <Clock size={11} /> Due: {dayjs(loan.dueAt).format("DD MMM YYYY")}
                          {isOverdue && isActive && " (Overdue)"}
                        </span>
                        {loan.returnedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <RotateCcw size={11} /> Returned: {dayjs(loan.returnedAt).format("DD MMM YYYY")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {isActive && (
                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={returnMutation.isPending}
                          onClick={() => returnMutation.mutate(loan.id)}
                        >
                          <RotateCcw size={14} />
                          Return
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
