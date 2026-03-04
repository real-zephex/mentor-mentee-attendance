"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Wait for auth_token cookie to be fully set in the browser
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "An error occurred");
      }
    } catch (error) {
      setError((error as Error).message || "An error occurred");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="grid w-full max-w-4xl gap-4 rounded-2xl border bg-background p-4 shadow-sm md:grid-cols-2 md:p-6">
        <div className="flex flex-col justify-center space-y-4 rounded-xl bg-primary px-5 py-8 text-primary-foreground">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-primary-foreground/90">
            Manage students, sessions, and attendance records from one dashboard.
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="mb-1 text-2xl font-semibold">Sign in</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Continue to the attendance workspace.
          </p>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Go back to{" "}
            <Link href="/" className="font-medium text-foreground underline">
              home
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
