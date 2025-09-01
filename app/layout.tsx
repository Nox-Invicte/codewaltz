import LayoutClient from "./LayoutClient";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CodeWaltz",
  description: "Store your code snippets securely",
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-hidden`}>
        <LayoutClient geistSans={geistSans.variable} geistMono={geistMono.variable}>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
