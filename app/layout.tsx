import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ CONFIGURACIÓN DE METADATOS PARA GOOGLE Y REDES SOCIALES
export const metadata: Metadata = {
  title: "GXFRE | Calendario Oficial de Streams",
  description: "Sigue los próximos directos, votaciones y eventos especiales de GXFRE. ¡La cartelera oficial en un solo lugar!",
  keywords: ["GXFRE", "Calendario", "Twitch", "Streamer", "Eventos", "Votaciones"],
  
  // 🔍 VERIFICACIÓN DE GOOGLE SEARCH CONSOLE
  verification: {
    google: "BsraKmB15E0DrWuxDH1v82d36CavO0Ej6ndELOpIegI",
  },

  // 📱 VISTA PREVIA EN REDES (WhatsApp, Twitter, Google)
  openGraph: {
    title: "GXFRE | Calendario Oficial",
    description: "Consulta el horario de los próximos directos aquí.",
    url: "https://calendario-gxfre.vercel.app",
    siteName: "GXFRE Calendario",
    images: [
      {
        url: "/logo-gxfre.png", // Usa tu logo como miniatura
        width: 1200,
        height: 630,
        alt: "GXFRE Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GXFRE | Calendario de Streams",
    description: "Todos los eventos de la semana actualizados.",
    images: ["/logo-gxfre.png"],
  },
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
        {/* CARGA DEL CSS EXTERNO PARA EL RECORTADOR */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/cropperjs@1.6.1/dist/cropper.min.css" 
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}