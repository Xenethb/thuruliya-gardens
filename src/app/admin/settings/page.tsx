'use client';

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import { toast, Toaster } from "sonner";

// FIREBASE
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface SiteSettings {
    companyName: string;
    phone: string;
    email: string;
    address: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    maintenanceMode: boolean;
    seoTitle: string;
    seoDescription: string;
    showCategoryNav?: boolean;
}

const defaultSettings: SiteSettings = {
    companyName: "Thuruliya Gardens",
    phone: "+94 76 345 5267",
    email: "thuruliyagardenslk@gmail.com",
    address: "1119/d Dhammodaya Mw., Battaramulla 10120 / Hokandara",
    facebook: "https://www.facebook.com/ThuruliyaGardens/",
    instagram: "https://www.instagram.com/thuruliya.lk/",
    tiktok: "https://www.tiktok.com/@thuruliya_gardens/",
    whatsapp: "94763455267",
    maintenanceMode: false,
    seoTitle: "Thuruliya Gardens | Premium Nursery & Landscaping",
    seoDescription: "Premium landscaping design and exotic plants crafted meticulously for Sri Lanka's tropical climate.",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch settings from Firestore
    useEffect(() => {
        async function fetchSettings() {
            try {
                const docRef = doc(db, "settings", "general");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSettings({ ...defaultSettings, ...docSnap.data() } as SiteSettings);
                } else {
                    // If no settings exist yet, create them with the defaults
                    await setDoc(docRef, defaultSettings);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettings();
    }, []);

    // Save settings to Firestore
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, "settings", "general"), settings, { merge: true });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                <p className="text-stone-500 font-medium">Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <Toaster position="top-right" richColors />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Settings</h1>
                    <p className="text-stone-500 text-sm">Manage your business information, social links, and website configuration.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            <Tabs.Root defaultValue="business" className="w-full">
                <Tabs.List className="flex gap-2 border-b border-stone-200 mb-8 overflow-x-auto hide-scrollbar">
                    {["business", "social", "website", "seo"].map((tab) => (
                        <Tabs.Trigger
                            key={tab}
                            value={tab}
                            className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 data-[state=active]:text-[#2C3E2B] data-[state=active]:border-b-2 data-[state=active]:border-[#2C3E2B] capitalize whitespace-nowrap"
                        >
                            {tab === "seo" ? "SEO" : tab} Settings
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Business Info */}
                <Tabs.Content value="business" className="outline-none">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm max-w-3xl">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-6 border-b border-stone-100 pb-4">Business Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={settings.companyName}
                                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Physical Address</label>
                                <input
                                    type="text"
                                    value={settings.address}
                                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Tabs.Content>

                {/* Social Media */}
                <Tabs.Content value="social" className="outline-none">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm max-w-3xl">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-6 border-b border-stone-100 pb-4">Social Media Links</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Instagram URL</label>
                                <input
                                    type="text"
                                    value={settings.instagram}
                                    onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Facebook URL</label>
                                <input
                                    type="text"
                                    value={settings.facebook}
                                    onChange={(e) => setSettings({...settings, facebook: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">TikTok URL</label>
                                <input
                                    type="text"
                                    value={settings.tiktok}
                                    onChange={(e) => setSettings({...settings, tiktok: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">WhatsApp Number (For Links)</label>
                                <input
                                    type="text"
                                    value={settings.whatsapp}
                                    onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                                    placeholder="e.g. 94763455267"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </Tabs.Content>

                {/* Website Settings */}
                <Tabs.Content value="website" className="outline-none">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm max-w-3xl">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-6 border-b border-stone-100 pb-4">Website Configuration</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-5 bg-amber-50 border border-amber-100 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-amber-900 mb-1">Maintenance Mode</p>
                                    <p className="text-xs text-amber-700 font-medium">Hide the public website from visitors while making updates.</p>
                                </div>
                                <Switch.Root
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(val) => setSettings({...settings, maintenanceMode: val})}
                                    className="w-11 h-6 bg-amber-200/50 rounded-full data-[state=checked]:bg-amber-600 transition-colors outline-none cursor-pointer"
                                >
                                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                                </Switch.Root>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-stone-50 border border-stone-200 rounded-xl mt-4">
                                <div>
                                    <p className="text-sm font-bold text-stone-800 mb-1">Show Category Navigation Bar</p>
                                    <p className="text-xs text-stone-500 font-medium">Toggle the green category menu bar under the main header on or off.</p>
                                </div>
                                <Switch.Root
                                    // Default to true if undefined so it shows up initially
                                    checked={settings.showCategoryNav !== false}
                                    onCheckedChange={(val) => setSettings({...settings, showCategoryNav: val})}
                                    className="w-11 h-6 bg-stone-200 rounded-full data-[state=checked]:bg-[#2C3E2B] transition-colors outline-none cursor-pointer"
                                >
                                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                                </Switch.Root>
                            </div>
                        </div>
                    </div>
                </Tabs.Content>

                {/* SEO Settings */}
                <Tabs.Content value="seo" className="outline-none">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm max-w-3xl">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-6 border-b border-stone-100 pb-4">Search Engine Optimization</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Global Site Title</label>
                                <input
                                    type="text"
                                    value={settings.seoTitle}
                                    onChange={(e) => setSettings({...settings, seoTitle: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                                <p className="text-xs text-stone-400 mt-2 font-medium">This appears in the browser tab and Google search results.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Meta Description</label>
                                <textarea
                                    rows={4}
                                    value={settings.seoDescription}
                                    onChange={(e) => setSettings({...settings, seoDescription: e.target.value})}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium resize-none"
                                />
                                <p className="text-xs text-stone-400 mt-2 font-medium">A brief summary of your business. Keep it under 160 characters for best SEO results.</p>
                            </div>
                        </div>
                    </div>
                </Tabs.Content>

            </Tabs.Root>
        </div>
    );
}