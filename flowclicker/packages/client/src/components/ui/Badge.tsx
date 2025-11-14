import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow hover:bg-primary-dark",
        secondary:
          "border-transparent bg-secondary text-white shadow hover:bg-blue-600",
        success:
          "border-transparent bg-success text-white shadow hover:bg-green-600",
        destructive:
          "border-transparent bg-danger text-white shadow hover:bg-red-600",
        warning:
          "border-transparent bg-warning text-white shadow hover:bg-yellow-600",
        outline: "text-text-primary border-border",
        ghost: "border-transparent text-text-secondary hover:bg-bg-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
