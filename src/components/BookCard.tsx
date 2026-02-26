import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Book } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const available = book.availableCopies > 0;

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-muted overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
              <span className="text-4xl">📚</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant={available ? "success" : "secondary"}
              className="text-xs shadow-sm"
            >
              {available ? "Available" : "Borrowed"}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {book.author?.name ?? "Unknown Author"}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">
                {book.rating?.toFixed(1) ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({book.reviewCount})
              </span>
            </div>
            {book.category && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {book.category.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
