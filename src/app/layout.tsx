import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Thuruliya Gardens",
    description: "Premium tropical plants and luxury landscaping in Sri Lanka.",
};

// This is now just a blank canvas! No headers, no footers.
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="antialiased">
        {children}
        </body>
        </html>
    );
}