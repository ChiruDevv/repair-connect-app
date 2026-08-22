import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MERN Next App",
  description: "Full stack MERN application with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
