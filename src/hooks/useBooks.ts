import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books";
import { categoriesApi } from "@/api/categories";
import { setSearch, setSelectedCategory } from "@/store/uiSlice";
import type { RootState } from "@/store";
import { useDebounce } from "./useDebounce";

export function useBooks() {
  const dispatch = useDispatch();
  const { search, selectedCategory } = useSelector((s: RootState) => s.ui);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, selectedCategory]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  const booksQuery = useQuery({
    queryKey: ["books", { page, search: debouncedSearch, category: selectedCategory }],
    queryFn: () =>
      booksApi.getBooks({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      }),
  });

  return {
    books: booksQuery.data?.books ?? [],
    pagination: booksQuery.data?.pagination,
    isLoading: booksQuery.isLoading,
    isError: booksQuery.isError,
    refetch: booksQuery.refetch,
    categories: categoriesQuery.data ?? [],
    page,
    setPage,
    search,
    selectedCategory,
    setSearch: (s: string) => dispatch(setSearch(s)),
    setSelectedCategory: (c: string | number) => dispatch(setSelectedCategory(c)),
  };
}
