import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "./client-provider";

export const metadata: Metadata = {
  title: "Sistema de Restaurante",
  description: "Sistema de gestión para restaurantes con Next.js y GraphQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
