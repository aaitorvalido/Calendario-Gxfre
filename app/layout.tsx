import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // 👈 Importamos el envoltorio

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel de Control - Stream",
  description: "Gestión de directos y votaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* CARGA DEL CSS EXTERNO PARA QUE EL RECORTADOR FUNCIONE PERFECTO */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/cropperjs@1.6.1/dist/cropper.min.css" 
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* 🔐 ENVOLVEMOS TODA LA APP AQUÍ */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}