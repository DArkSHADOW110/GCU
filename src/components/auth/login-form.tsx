"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function LoginForm() {
  return (
    <Card className="relative z-10 w-full max-w-md border-surface-border/80 shadow-glow">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-glow">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Welcome to FinPulse</CardTitle>
        <CardDescription>
          Connect banks, save in jars, and manage money with AI — sign in to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="lg"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>
        <p className="mt-4 text-center text-xs text-slate-500">
          Sandbox mode available without bank API keys
        </p>
      </CardContent>
    </Card>
  );
}
