import { useState } from "react";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, Edit2, Save, X, BookOpen, Clock, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { usersApi } from "@/api/users";
import { updateUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: usersApi.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      usersApi.updateProfile({
        name: form.name || undefined,
        phone: form.phone || undefined,
      }),
    onSuccess: (updated) => {
      dispatch(updateUser(updated.profile));
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated!");
      setEditing(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Update failed."),
  });

  const startEditing = () => {
    setForm({ name: data?.profile.name ?? "", phone: data?.profile.phone ?? "" });
    setEditing(true);
  };

  const profile = data?.profile;
  const stats = data?.loanStats;
  const initials = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2 pt-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="text-center py-12">
        <p className="font-medium text-destructive">Failed to load profile.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => qc.invalidateQueries({ queryKey: ["me"] })}>
          Try again
        </Button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Loans", value: stats?.total ?? 0, icon: BookOpen, color: "text-primary", bg: "bg-blue-50" },
    { label: "Active Loans", value: stats?.borrowed ?? 0, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Returned", value: stats?.returned ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Reviews Given", value: data?.reviewsCount ?? 0, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Edit2 size={14} /> Edit Profile
          </Button>
        )}
      </div>

      {/* Avatar + basic info */}
      <div className="flex items-center gap-5 mb-6 p-5 border rounded-lg bg-card">
        <Avatar className="w-16 h-16 text-lg">
          {profile.profilePhoto && <AvatarImage src={profile.profilePhoto} alt={profile.name} />}
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name" className="text-xs mb-1 block">Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-xs mb-1 block">Phone</Label>
                <Input
                  id="edit-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+62 812 xxxx xxxx"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save size={14} /> {updateMutation.isPending ? "Saving…" : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  <X size={14} /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                  {profile.role}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail size={13} /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-2">
                    <Phone size={13} /> {profile.phone}
                  </span>
                )}
                <span className="text-xs">Member since {dayjs(profile.createdAt).format("MMMM YYYY")}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Stats */}
      <div>
        <h2 className="font-semibold mb-4">Borrowing Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn("rounded-lg border p-4 text-center", bg)}>
              <Icon size={20} className={cn("mx-auto mb-1.5", color)} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {(stats?.late ?? 0) > 0 && (
          <p className="mt-3 text-sm text-orange-600 flex items-center gap-1.5">
            <Clock size={14} />
            You have {stats?.late} overdue loan{(stats?.late ?? 0) > 1 ? "s" : ""}. Please return them as soon as possible.
          </p>
        )}
      </div>
    </div>
  );
}
