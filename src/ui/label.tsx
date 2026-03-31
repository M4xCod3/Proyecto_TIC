import React from "react";

export function Label({
  children,
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium text-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}