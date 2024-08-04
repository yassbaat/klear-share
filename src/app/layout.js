import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "My Application",
  icons: {
    icon: "/favicon.ico",
  },
};
const inter = Inter({ subsets: ["latin"] });
import { ToastProvider } from "@/components/ui/toast"; // Assuming ToastProvider is in ui/toast

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
