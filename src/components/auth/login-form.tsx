"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function LoginForm() {
  return (
    <Card className="relative z-10 w-full max-w-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.3),0_0_60px_var(--cyber-cyan-glow)]">
      <CardHeader className="text-center pb-4">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-[0_0_40px_var(--primary-glow)] relative">
          <Zap className="h-8 w-8 text-black" />
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-pulse-glow" />
        </div>
        
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome to FinPulse</CardTitle>
        <CardDescription className="text-text-tertiary mt-2">
          Connect banks, save in jars, and manage money with AI — sign in to continue.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          size="lg"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>
        
        <p className="text-center text-xs text-text-tertiary">
          Sandbox mode available without bank API keys
        </p>
      </CardContent>
    </Card>
  );
}
