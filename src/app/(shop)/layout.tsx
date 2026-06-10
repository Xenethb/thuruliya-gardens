'use client';

import { useEffect, useState } from "react";
import { Header } from "@/app/components/Header";
import { CategoryNav } from "@/app/components/CategoryNav";
import { Footer } from "@/app/components/Footer";
import { Loader2, Wrench } from "lucide-react";

// FIREBASE
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 1. STRICT TYPE DEFINITION (Fixes the 'any' error)
interface SiteSettings {
    seoTitle?: string;
    seoDescription?: string;
    maintenanceMode?: boolean;
}

export default function ShopLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchGlobalSettings() {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as SiteSettings;
                    setSettings(data);

                    // Dynamically apply SEO Title and Description to the browser
                    if (data.seoTitle) document.title = data.seoTitle;

                    if (data.seoDescription) {
                        let metaDescription = document.querySelector('meta[name="description"]');
                        if (!metaDescription) {
                            metaDescription = document.createElement('meta');
                            metaDescription.setAttribute('name', 'description');
                            document.head.appendChild(metaDescription);
                        }
                        metaDescription.setAttribute('content', data.seoDescription);
                    }
                }
            } catch (error) {
                console.error("Error fetching global settings:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchGlobalSettings();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F0F5F1] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#2C3E2B] mb-4" />
            </div>
        );
    }

    if (settings?.maintenanceMode) {
        return (
            <div className="min-h-screen bg-[#F0F5F1] flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-[#D5E5D6] shadow-sm mb-6">
                    <Wrench className="w-10 h-10 text-[#2C3E2B]" />
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif text-[#2C3E2B] mb-4">We're upgrading the garden!</h1>
                <p className="text-[#4A6A48] max-w-md mx-auto font-medium leading-relaxed">
                    Thuruliya Gardens is currently undergoing scheduled maintenance to bring you a better experience. Please check back shortly.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
            {/* Removed the 'settings' prop to fix the TS2322 errors */}
            <Header />
            <CategoryNav />

            <main className="flex-grow">
                {children}
            </main>

            <Footer />
        </div>
    );
}