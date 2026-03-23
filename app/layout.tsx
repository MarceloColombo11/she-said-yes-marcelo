import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
});

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Suelen & Marcelo — 28.11.2026",
    description:
        "Celebremos juntos o amor de Suelen e Marcelo. 28 de novembro de 2026.",
    openGraph: {
        title: "Suelen & Marcelo — 28.11.2026",
        description:
            "Celebremos juntos o amor de Suelen e Marcelo. 28 de novembro de 2026.",
    },
    icons: {
        icon: "/Monograma simples.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-BR"
            className={`${playfair.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
        >
            <head>
                <link
                    rel="stylesheet"
                    href="https://db.onlinewebfonts.com/c/042ebc0a3ba5a211f0893b31ab8da1d4?family=Hello+Paris+Serif"
                />
            </head>
            <body className="min-h-full flex flex-col font-sans">
                <a
                    href="#main"
                    className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-lg bg-sage px-4 py-2 text-white font-medium transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
                >
                    Pular para conteúdo
                </a>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
