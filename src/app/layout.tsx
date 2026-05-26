import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prode",
  description: "Hacé tus predicciones de fútbol",
  icons: { icon: "/logo_simple.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-white">
        <AuthProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
