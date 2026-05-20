"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** Total number of items across all pages. */
  totalCount: number;
  /** Number of items per page. */
  pageSize: number;
  /** The URL search param key for the page number. Defaults to "page". */
  paramKey?: string;
}

export default function Pagination({
  totalCount,
  pageSize,
  paramKey = "page",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = Number(searchParams.get(paramKey) ?? "1");

  const createQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, String(page));
      }
      return params.toString();
    },
    [searchParams, paramKey]
  );

  const goTo = (page: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(page)}`);
    });
  };

  // Don't render if only one page
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const getPageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
      <p className="text-white/35 text-sm">
        Page {currentPage} of {totalPages}
        <span className="ml-2 text-white/20">({totalCount} total)</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-25"
          disabled={currentPage <= 1}
          onClick={() => goTo(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((p, idx) =>
          p === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-white/20 text-sm select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant="ghost"
              size="icon"
              className={`h-8 w-8 text-sm transition-colors ${
                p === currentPage
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => goTo(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-25"
          disabled={currentPage >= totalPages}
          onClick={() => goTo(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}