import type * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary";
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  const variantClass = variant === "secondary" ? "button secondary" : "button";

  return <button className={`${variantClass} ${className}`.trim()} {...props} />;
}
