"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

interface StatusFilterProps {
  /** The URL search param key this filter controls. */
  paramKey: string;
  paramKey2?: string;
  allValues2?: string;
  options: FilterOption[];
  /** Value used when "no filter" is selected. Defaults to "all". */
  allValue?: string;
  allLabel?: string;
  className?: string;
}

export default function StatusFilter({
  paramKey,
  options,
  allValue = "all",
  allLabel = "All Status",
  className,
}: StatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const current = searchParams.get(paramKey) ?? allValue;

  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === allValue) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, value);
      }
      // Reset to page 1 whenever filter changes
      params.delete("page");
      return params.toString();
    },
    [searchParams, paramKey, allValue],
  );

  const handleChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(value)}`);
    });
  };

  return (
    <div className={`relative sm:w-55 ${className ?? ""}`}>
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10 pointer-events-none" />
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-10 min-h-11 focus:ring-0 focus:border-white/20 w-full">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
          <SelectItem value={allValue}>{allLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
