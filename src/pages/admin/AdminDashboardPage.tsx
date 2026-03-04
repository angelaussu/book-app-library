import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { BookOpen, Users, FileText, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { adminApi } from "@/api/admin";
import type { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  description?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={20} className={iconColor} />
          </div>
        </div>
        {value === undefined ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        )}
        <p className="text-sm font-medium mt-0.5">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  const { data: overview } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.getOverview,
  });

  const { data: recentLoans, isLoading: loansLoading } = useQuery({
    queryKey: ["admin", "loans", "recent"],
    queryFn: () => adminApi.getLoans({ limit: 5 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, {user?.name}. Here's what's happening in your library.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Books"
          value={overview?.totalBooks}
          icon={BookOpen}
          description="In the catalog"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Available Copies"
          value={overview?.availableBooks}
          icon={TrendingUp}
          description="Ready to borrow"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Total Users"
          value={overview?.totalUsers}
          icon={Users}
          description="Registered members"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Loans"
          value={overview?.activeLoans}
          icon={FileText}
          description="Currently borrowed"
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Late Returns"
          value={overview?.lateLoans}
          icon={AlertTriangle}
          description="Overdue loans"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          title="Total Loans"
          value={overview?.totalLoans}
          icon={Clock}
          description="All time"
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
      </div>

      {/* Recent Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loansLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !recentLoans?.loans?.length ? (
            <p className="text-sm text-muted-foreground">No loans yet.</p>
          ) : (
            <div className="divide-y">
              {recentLoans.loans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{loan.book?.title ?? `Book #${loan.id}`}</p>
                    <p className="text-muted-foreground text-xs truncate">
                      {loan.user?.name ?? "Unknown user"} &middot; Due {dayjs(loan.dueAt).format("D MMM YYYY")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      loan.status === "RETURNED"
                        ? "secondary"
                        : loan.status === "LATE"
                        ? "destructive"
                        : "default"
                    }
                    className="ml-3 shrink-0"
                  >
                    {loan.displayStatus ?? loan.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
