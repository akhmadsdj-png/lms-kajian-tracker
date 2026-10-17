"use client";

import { signIn } from "next-auth/react";

export function SignInButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button onClick={() => signIn("google")} className={className}>
      {children}
    </button>
  );
}
