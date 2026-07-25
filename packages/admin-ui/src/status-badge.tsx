import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        active: "bg-green-100 text-green-800",
        killed: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status === "active" ? "Active" : "Killed";
  return (
    <span className={clsx(badgeVariants({ status }), className)}>
      {label}
    </span>
  );
}
