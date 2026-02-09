import type { Metadata } from "next";
import { Inter, Italiana, Cormorant_Garamond } from "next/font/google"; // Import standard Inter font
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
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
                className={`${inter.variable} ${italiana.variable} ${cormorant.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
