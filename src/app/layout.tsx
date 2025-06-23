import type { Metadata } from "next";
import "./globals.css";
import AuthInitializer from "@/providers/AuthInitializer";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Network Marketing CRM - Your Success Companion",
  description: "Simple, celebration-focused CRM designed for network marketers. Manage contacts, send emails, and grow your business with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <QueryProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
