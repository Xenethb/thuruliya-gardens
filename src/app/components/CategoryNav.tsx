'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface NavItem {
    label: string;
    href: string;
    subcategories?: string[];
}

interface FirestoreCategory {
    id: string;
    name: string;
    slug?: string;
    active?: boolean;
    order?: number;
    subcategories?: (string | { name: string; active: boolean })[];
}

export function CategoryNav() {
    const [navItems, setNavItems] = useState<NavItem[]>([{ label: 'Home', href: '/' }]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNav, setShowNav] = useState(true); // Controls Master Visibility

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);
    const pathname = usePathname();

    // --- FETCH LIVE CATEGORIES & SETTINGS ---
    useEffect(() => {
        async function fetchNavigation() {
            try {
                // 1. Check Master Settings Toggle First
                const settingsRef = doc(db, "settings", "general");
                const settingsSnap = await getDoc(settingsRef);

                // If the switch exists and is set to false, hide the nav and stop loading!
                if (settingsSnap.exists() && settingsSnap.data().showCategoryNav === false) {
                    setShowNav(false);
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch Categories
                const querySnapshot = await getDocs(collection(db, "categories"));
                let fetchedCats = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as FirestoreCategory[];

                fetchedCats = fetchedCats
                    .filter(cat => cat.active !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                const dynamicNavItems: NavItem[] = fetchedCats.map(cat => {
                    let activeSubs: string[] = [];
                    if (cat.subcategories && Array.isArray(cat.subcategories)) {
                        activeSubs = cat.subcategories
                            .filter((sub) => typeof sub === 'string' || sub.active !== false)
                            .map((sub) => typeof sub === 'string' ? sub : sub.name);
                    }

                    const safeSlug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                    return {
                        label: cat.name,
                        href: `/categories/${safeSlug}`,
                        ...(activeSubs.length > 0 && { subcategories: activeSubs })
                    };
                });

                setNavItems([{ label: 'Home', href: '/' }, ...dynamicNavItems]);
            } catch (error) {
                console.error("Failed to load navigation categories", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchNavigation();
    }, []);

    // If the master switch is off, render absolutely nothing.
    if (!showNav) return null;

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden sm:block bg-[#4A6A48] border-b border-[#3A5A38] sticky top-16 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-white/70 text-sm font-bold uppercase tracking-wider">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading Categories...
                        </div>
                    ) : (
                        <ul className="flex items-center gap-1 h-full">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                                return (
                                    <li
                                        key={item.label}
                                        className="relative h-full flex items-center"
                                        onMouseEnter={() => item.subcategories && setOpenDropdown(item.label)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-2 px-5 py-3 text-sm tracking-wider uppercase font-bold text-white hover:bg-[#3A5A38] transition-colors relative group h-full"
                                        >
                                            {item.label}
                                            {item.subcategories && (
                                                <ChevronDown className="w-4 h-4 text-white/70" />
                                            )}
                                            {isActive && (
                                                <span className="absolute bottom-0 left-4 right-4 h-1 bg-white rounded-t-sm" />
                                            )}
                                        </Link>

                                        {/* Desktop Dropdown Menu */}
                                        {item.subcategories && openDropdown === item.label && (
                                            <div className="absolute top-full left-0 mt-0 bg-white rounded-b-xl shadow-xl border border-stone-100 min-w-56 z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {item.subcategories.map((sub) => (
                                                    <Link
                                                        key={sub}
                                                        href={`${item.href}?sub=${encodeURIComponent(sub)}`}
                                                        onClick={() => setOpenDropdown(null)}
                                                        className="w-full text-left px-5 py-3 hover:bg-stone-50 text-stone-700 hover:text-[#4A6A48] transition-colors flex items-center justify-between group/item text-sm font-bold tracking-wide"
                                                    >
                                                        {sub}
                                                        <ChevronRight className="w-4 h-4 text-stone-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </nav>

            {/* Mobile Accordion Navigation */}
            <nav className="sm:hidden bg-[#4A6A48] border-b border-[#3A5A38]">
                {isLoading ? (
                    <div className="flex items-center gap-2 px-5 py-4 text-white/70 text-sm font-bold uppercase tracking-wider">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading Categories...
                    </div>
                ) : (
                    navItems.map((item) => (
                        <div key={item.label} className="border-b border-[#3A5A38] last:border-0">
                            {item.subcategories ? (
                                <button
                                    onClick={() => setOpenMobileAccordion(openMobileAccordion === item.label ? null : item.label)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-base font-bold text-white hover:bg-[#3A5A38] transition-colors uppercase tracking-wider"
                                >
                                    {item.label}
                                    <ChevronDown
                                        className={`w-5 h-5 text-white/70 transition-transform duration-200 ${
                                            openMobileAccordion === item.label ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="block w-full px-5 py-4 text-base font-bold text-white hover:bg-[#3A5A38] transition-colors uppercase tracking-wider"
                                >
                                    {item.label}
                                </Link>
                            )}

                            {/* Mobile Dropdown Sub-Items */}
                            {item.subcategories && openMobileAccordion === item.label && (
                                <div className="bg-white border-t border-stone-100 transition-all">
                                    <Link
                                        href={item.href}
                                        className="block w-full text-left px-8 py-4 text-sm font-bold text-[#4A6A48] hover:bg-stone-50 border-b border-stone-100 uppercase tracking-wider"
                                    >
                                        View All {item.label}
                                    </Link>
                                    {item.subcategories.map((sub) => (
                                        <Link
                                            key={sub}
                                            href={`${item.href}?sub=${encodeURIComponent(sub)}`}
                                            className="block w-full text-left px-8 py-3.5 text-sm font-bold text-stone-600 hover:bg-stone-50 border-b border-stone-100 last:border-0"
                                        >
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </nav>
        </>
    );
}