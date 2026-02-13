import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConvexClientProvider from "@/lib/ClerkConvexWrapper";
import AuthValidator from "@/wrappers/AuthValidator";
import Navbar from "@/components/custom/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Manage your class attendance efficiently",
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <AuthValidator>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider>
                  <Navbar />
                  {children}
                  <Toaster />
                </TooltipProvider>
              </ThemeProvider>
            </AuthValidator>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
