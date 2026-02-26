import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Filter } from "lucide-react";
import { booksApi } from "@/api/books";
import { categoriesApi } from "@/api/categories";
import { setSearch, setSelectedCategory } from "@/store/uiSlice";
import type { RootState } from "@/store";
import { BookCard } from "@/components/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";

export function BooksPage() {
  const dispatch = useDispatch();
  const { search, selectedCategory } = useSelector((s: RootState) => s.ui);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", { page, search: debouncedSearch, category: selectedCategory }],
    queryFn: () =>
      booksApi.getBooks({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      }),
  });

  const books = data?.books ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Browse Books</h1>
        <p className="text-muted-foreground text-sm">
          {pagination ? `${pagination.total} books available` : "Explore our library collection"}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or author…"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => dispatch(setSearch(""))}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-1">Category:</span>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            !selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-accent"
          }`}
          onClick={() => dispatch(setSelectedCategory(""))}
        >
          All
        </button>
        {categoriesData?.map((cat) => (
          <button
            key={cat.id}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-accent"
            }`}
            onClick={() => dispatch(setSelectedCategory(selectedCategory === cat.id ? "" : cat.id))}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Active filters indicator */}
      {(search || selectedCategory) && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span>Filters:</span>
          {search && <Badge variant="secondary" className="gap-1">{search} <X size={10} className="cursor-pointer" onClick={() => dispatch(setSearch(""))} /></Badge>}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {categoriesData?.find(c => c.id === selectedCategory)?.name}
              <X size={10} className="cursor-pointer" onClick={() => dispatch(setSelectedCategory(""))} />
            </Badge>
          )}
        </div>
      )}

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium text-destructive">Failed to load books</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium text-muted-foreground">No books found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
