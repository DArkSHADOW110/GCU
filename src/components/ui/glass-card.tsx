"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowBorder?: boolean;
}

export function GlassCard({ children, className, glowBorder = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-xl",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
        "border border-white/[0.08]",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.3)]",
        glowBorder && "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-[#00e5ff]/30 before:via-transparent before:to-[#00e5ff]/10 before:-z-10",
        className
      )}
    >
      {children}
    </div>
  );
}
