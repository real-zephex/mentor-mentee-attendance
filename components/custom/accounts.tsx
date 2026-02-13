"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { LogIn, UserPlus, Fingerprint } from "lucide-react";

const UserAccount = () => {
  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-2 bg-sky-500 w-full" />
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto size-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Fingerprint className="text-sky-500 size-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Attendance Tracker
          </CardTitle>
          <CardDescription className="text-base">
            Please sign in to manage your classes and students
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-4">
            <Button asChild className="w-full h-11 text-base font-semibold bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/20">
              <SignInButton mode="modal">
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  Sign In to Account
                </span>
              </SignInButton>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or create new</span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full h-11 text-base font-semibold border-muted hover:bg-muted/50 transition-colors">
              <SignUpButton mode="modal">
                <span className="flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Register as Instructor
                </span>
              </SignUpButton>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 py-4 flex justify-center">
          <p className="text-xs text-muted-foreground text-center px-8">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserAccount;
