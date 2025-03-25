import "@/app/globals.css";
import {Metadata, Viewport} from "next";
import {Inter as FontSans} from "next/font/google";
import {GeistMono} from "geist/font/mono";
import {cn} from "@/lib/utils";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {SidebarNav} from "@/components/layout/sidebar-nav";
import {QueryProvider} from "@/components/providers/query-provider";
import {ErrorBoundary} from "@/components/providers/error-boundary";
import {ToastProvider} from "@/components/providers/toast-provider";
import React from "react";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

// const fontMono = GeistMono({ // Is not callable
//   subsets: ["latin"],
//   variable: "--font-geist-mono",
// });

export const metadata: Metadata = {
    title: "Health ISIS",
    description: "Disease Analytics Dashboard",
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "white"},
        {media: "(prefers-color-scheme: dark)", color: "#020817"},
    ],
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={cn(
                "min-h-screen font-sans antialiased",
                fontSans.variable,
                GeistMono.variable
            )}
        >
        <ErrorBoundary>
            <QueryProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ToastProvider/>
                    <div className="flex min-h-screen">
                        <SidebarNav/>
                        <main className="flex-1 pt-16 md:pt-4 px-4 md:pl-6">{children}</main>
                    </div>
                </ThemeProvider>
            </QueryProvider>
        </ErrorBoundary>
        </body>
        </html>
    );
}
