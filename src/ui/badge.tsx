import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border text-xs font-medium transition-colors";

  const variants = {
    default: "bg-primary text-white border-transparent",
    secondary:
      "bg-secondary text-secondary-foreground border-border",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}