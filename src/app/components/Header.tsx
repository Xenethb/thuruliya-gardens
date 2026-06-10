'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- FIREBASE IMPORTS ---
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function Header() {
    const [companyName, setCompanyName] = useState('Thuruliya Gardens');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Fetch the company name and logo from Firebase Settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.companyName) setCompanyName(data.companyName);

                    // If you upload a logo in your admin panel later, it will fetch it here!
                    if (data.logoUrl) setLogoUrl(data.logoUrl);
                }
            } catch (error) {
                console.error("Error fetching header settings:", error);
            }
        }
        fetchSettings();
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
            {/* 1. Changed to ALWAYS justify-center on all screen sizes */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center w-full">

                {/* Logo pointing to Home Page */}
                <Link href="/" className="flex items-center gap-3 shrink-0 group">

                    {/* 2. Replaced the Leaf Icon with your Custom Image */}
                    <img
                        // If no live database logo exists, it looks for "logo.png" in your public folder
                        src={logoUrl || "/logo.png"}
                        alt={`${companyName} Logo`}
                        className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
                    />

                    <span className="font-serif tracking-wide text-2xl text-[#2C3E2B]">
                        {companyName}
                    </span>
                </Link>

            </div>
        </header>
    );
}