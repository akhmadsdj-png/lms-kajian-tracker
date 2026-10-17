"use client";

import { useEffect, useRef } from "react";

// Scrollable list that opens with the current item ([aria-current="page"]) in view.
export function ScrollToActive({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (list && active) {
      const offset = active.getBoundingClientRect().top - list.getBoundingClientRect().top;
      list.scrollTop += offset - list.clientHeight / 3;
    }
  }, []);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
