// This file is only used for metadata and should not render anything
// All actual pages are handled by [locale]/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network Marketing CRM - Your Success Companion",
  description: "Simple, celebration-focused CRM designed for network marketers. Manage contacts, send emails, and grow your business with ease.",
};

// This is a placeholder that shouldn't be used in practice
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
