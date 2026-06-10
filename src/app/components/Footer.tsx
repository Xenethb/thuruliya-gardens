'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- STRICT TYPING ---
interface SiteSettings {
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
}

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

export function Footer() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        async function fetchFooterSettings() {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as SiteSettings);
                }
            } catch (error) {
                console.error("Error fetching footer settings:", error);
            }
        }
        fetchFooterSettings();
    }, []);

    return (
        <footer className="bg-[#2C3E2B] text-[#FAF9F6]">
            <div className="max-w-7xl mx-auto px-6 py-14">
                {/* Changed grid-cols-4 to grid-cols-1 md:grid-cols-3 to keep it balanced */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
                            <div className="w-9 h-9 rounded-full bg-[#FAF9F6] flex items-center justify-center transition-transform group-hover:scale-105">
                                <Leaf className="w-5 h-5 text-[#2C3E2B]" />
                            </div>
                            <span className="font-serif tracking-wide text-xl text-[#FAF9F6]">
                                Thuruliya Gardens
                            </span>
                        </Link>
                        <p className="text-[#FAF9F6]/70 mb-5 text-sm font-light leading-relaxed">
                            Sri Lanka&apos;s premium plant nursery and landscaping company. Bringing luxury tropical nature to every space.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { href: settings?.instagram || 'https://www.instagram.com/thuruliya.lk/', icon: <InstagramIcon className="w-4 h-4" /> },
                                { href: settings?.facebook || 'https://www.facebook.com/ThuruliyaGardens/', icon: <FacebookIcon className="w-4 h-4" /> },
                                { href: settings?.tiktok || 'https://www.tiktok.com/@thuruliya_gardens/', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg> },
                            ].map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-all text-white"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-5 text-[#FAF9F6]/90 text-xs font-bold uppercase tracking-[0.15em]">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Shop Plants', href: '/products' },
                                { label: 'Projects', href: '/projects' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Contact', href: '/contact' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[#FAF9F6]/60 hover:text-white transition-colors text-sm font-light"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-5 text-[#FAF9F6]/90 text-xs font-bold uppercase tracking-[0.15em]">
                            Contact Us
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { icon: <MapPin className="w-4 h-4 shrink-0 mt-0.5" />, text: settings?.address || '1119/d Dhammodaya Mw., Battaramulla 10120 / Hokandara' },
                                { icon: <Phone className="w-4 h-4 shrink-0" />, text: settings?.phone || '+94 76 345 5267' },
                                { icon: <Mail className="w-4 h-4 shrink-0" />, text: settings?.email || 'thuruliyagardenslk@gmail.com' },
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-[#FAF9F6]/60 text-sm font-light">
                                    {item.icon}
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-light text-[#FAF9F6]/40">
                    <p>© {new Date().getFullYear()} Thuruliya Gardens Nursery & Landscaping. All rights reserved.</p>
                    <p>Sri Lanka&apos;s premier plant destination.</p>
                </div>
            </div>
        </footer>
    );
}