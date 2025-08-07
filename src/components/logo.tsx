import { cn } from "@/lib/utils";
import React from "react";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
      {...props}
    >
      <title>RSensorGrid Logo</title>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
      <path d="M19 12l-2 2" />
      <path d="M19 12l-2-2" />
      <path d="M5 12l2 2" />
      <path d="M5 12l2-2" />
      <path d="M12 5l2-2" />
      <path d="M12 5l-2-2" />
      <path d="M12 19l2 2" />
      <path d="M12 19l-2 2" />
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}
