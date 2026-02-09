import type { Metadata } from "next";
import { Geist, Geist_Mono, Italiana, Cormorant_Garamond } from "next/font/google"; // Import fonts
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const italiana = Italiana({
    weight: "400",
    variable: "--font-italiana",
    subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
    weight: ["300", "400", "500", "600", "700"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    subsets: ["latin"],
});


export const metadata: Metadata = {
    title: "Odyssey",
    description: "A cinematic journey through Indonesia",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${italiana.variable} ${cormorant.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
