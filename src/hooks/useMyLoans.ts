import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loansApi } from "@/api/loans";

export function useMyLoans() {
  const qc = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ["loans", "my"],
    queryFn: () => loansApi.getMyLoans({ limit: 50 }),
  });

  const returnMutation = useMutation({
    mutationFn: (loanId: number) => loansApi.returnBook(loanId),
    onSuccess: () => {
      toast.success("Book returned successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to return book."),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return {
    loans: loansQuery.data?.loans ?? [],
    isLoading: loansQuery.isLoading,
    isError: loansQuery.isError,
    refetch: loansQuery.refetch,
    returnMutation,
  };
}
