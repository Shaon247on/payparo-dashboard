"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchInputProps {
  /** The URL search param key this input controls. */
  paramKey: string;
  placeholder?: string;
  className?: string;
  /** Debounce delay in ms. Defaults to 400. */
  debounceMs?: number;
}

export default function SearchInput({
  paramKey,
  placeholder = "Search…",
  className,
  debounceMs = 400,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(paramKey, value);
      } else {
        params.delete(paramKey);
      }
      // Reset to page 1 whenever search changes
      params.delete("page");
      return params.toString();
    },
    [searchParams, paramKey]
  );

  const handleChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      startTransition(() => {
        router.push(`${pathname}?${createQueryString(e.target.value)}`);
      });
    },
    debounceMs
  );

  return (
    <div className={`relative flex-1 ${className ?? ""}`}>
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
          isPending ? "text-white/60" : "text-white/30"
        }`}
      />
      <Input
        className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/30 pl-10 h-11 focus-visible:ring-0 focus-visible:border-white/20"
        placeholder={placeholder}
        defaultValue={searchParams.get(paramKey) ?? ""}
        onChange={handleChange}
      />
    </div>
  );
}