
import { cn } from "@/lib/utils";
import { type LucideProps, Wifi } from "lucide-react";

export function Logo({ className, ...props }: LucideProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Wifi
        className="h-7 w-7 text-primary"
        strokeWidth={2.5}
      />
      <span className="text-xl font-bold tracking-tighter text-foreground">
        RSensorGrid
      </span>
    </div>
  );
}
