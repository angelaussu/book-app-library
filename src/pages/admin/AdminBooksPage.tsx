import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen } from "lucide-react";
import { adminApi } from "@/api/admin";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function AdminBooksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "books", { page, search }],
    queryFn: () => adminApi.getBooks({ page, limit: 10, search: search || undefined }),
  });

  const books = data?.books ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Books</h1>
        <p className="text-muted-foreground text-sm">Manage all books in the library</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search books…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Author</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-center px-4 py-3 font-medium">Copies</th>
              <th className="text-center px-4 py-3 font-medium">Available</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
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
              <tr><td colSpan={6} className="text-center py-10 text-destructive">Failed to load books.</td></tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <BookOpen size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No books found</p>
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{book.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{book.author?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{book.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-center">{book.totalCopies}</td>
                  <td className="px-4 py-3 text-center">{book.availableCopies}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={book.availableCopies > 0 ? "success" : "secondary"}>
                      {book.availableCopies > 0 ? "Available" : "Borrowed"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {books.length} of {pagination.total} books
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
