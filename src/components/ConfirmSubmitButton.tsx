"use client";

import { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui";

export function ConfirmSubmitButton({
  confirmMessage,
  variant = "danger",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
