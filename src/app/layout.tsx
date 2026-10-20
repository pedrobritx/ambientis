import type { Metadata } from "next";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/fraunces/latin-400.css";
import "../styles/foundations.css";
import "../styles/forest.css";
import "./globals.css";
import "../styles/interactions.css";
export const metadata: Metadata = {
  title: "Ambientis · Ambiente de revisão",
  description:
    "Demonstração local do fluxo de trabalho ambiental, com dados fictícios.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-meridian-environment="forest">
      <body>{children}</body>
    </html>
  );
}
