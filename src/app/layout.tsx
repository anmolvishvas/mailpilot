import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MailPilot — Free AI Email Writer & Email Assistant",
  description:
    "Write, reply, improve, analyze and translate emails with AI. MailPilot is a 100% free AI email assistant for individuals and teams.",
  keywords: [
    "AI email writer",
    "free email assistant",
    "email generator",
    "reply generator",
    "email improver",
    "email analyzer",
    "humanize email",
    "email translation",
  ],
  openGraph: {
    title: "MailPilot — Free AI Email Assistant",
    description:
      "Tell MailPilot what you want to say. MailPilot writes the email. 100% free forever.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
