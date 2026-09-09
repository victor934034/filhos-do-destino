import type { Metadata } from "next";
import { Cinzel, Inter, IBM_Plex_Mono } from "next/font/google";
import { ToastRolagens } from "@/components/ui/ToastRolagens";
import { ToastMensagens } from "@/components/ui/ToastMensagens";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-spectral-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Filhos do Destino — Sua mesa. Seu mito.",
  description:
    "Crie, mestre e jogue Filhos do Destino: o RPG de mitologia grega moderna. Fichas, mesa ao vivo e estúdio de transmissão num só lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzel.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastRolagens />
        <ToastMensagens />
      </body>
    </html>
  );
}
