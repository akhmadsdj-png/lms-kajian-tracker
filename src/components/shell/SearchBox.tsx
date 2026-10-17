"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchIcon } from "./icons";

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/search" ? (params.get("q") ?? "") : "";

  return (
    <form action="/search" role="search" className="flex w-full items-center">
      <label htmlFor={autoFocus ? "q-page" : "q"} className="sr-only">
        Cari kajian
      </label>
      <input
        key={current}
        id={autoFocus ? "q-page" : "q"}
        name="q"
        type="search"
        defaultValue={current}
        autoFocus={autoFocus}
        placeholder="Cari kajian, kitab, atau tema"
        className="h-10 min-w-0 flex-1 rounded-l-full border border-rule bg-paper px-4 placeholder:text-pencil focus:border-pen focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="flex h-10 w-16 shrink-0 items-center justify-center rounded-r-full border border-l-0 border-rule bg-raised hover:bg-rule"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
