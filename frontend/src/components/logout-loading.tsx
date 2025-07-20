"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutLoadingProps {
  isVisible: boolean;
}

export function LogoutLoading({ isVisible }: LogoutLoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm",
      "flex items-center justify-center",
      "transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="bg-card border rounded-lg p-8 shadow-lg">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Signing out</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we securely sign you out...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}