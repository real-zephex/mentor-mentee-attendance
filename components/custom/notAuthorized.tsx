"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";

const NotAuthorized = () => {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto size-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-destructive size-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You don&apos;t have the necessary permissions to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotAuthorized;
