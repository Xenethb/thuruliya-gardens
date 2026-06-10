'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Star,
    Phone,
    Mail,
    MapPin,
    Clock,
    ArrowRight,
    Loader2,
    Leaf,
    LayoutGrid,
    Home,
    Wrench,
    Map,
    Sprout
} from 'lucide-react';
import { ProductCard } from '@/app/components/ProductCard';

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, limit } from "firebase/firestore";

// --- ICONS ---
const InstagramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TiktokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);

// --- STRICT TYPING ---
interface FirestoreCategory { id: string; name: string; slug?: string; image: string; active: boolean; order?: number; }
interface LiveSlide { id: string; title: string; subtitle: string; image: string; buttonText: string; buttonLink: string; active: boolean; order: number; }
interface LayoutSection { id: string; label: string; active: boolean; order: number; }

// Replaced 'any' with strict interfaces
interface SiteSettings {
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
}

interface Project {
    id: string;
    name: string;
    type?: string;
    location?: string;
    date?: string;
    coverImage?: string;
    img?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
}

// --- FALLBACK DATA ---
const fallbackSlides: LiveSlide[] = [
    { id: '1', title: 'Transform Your Outdoor Space', subtitle: "Premium landscaping design crafted meticulously for Sri Lanka's tropical climate.", image: 'https://images.unsplash.com/photo-1558618047-3c6dfa4c62b4?w=1600&h=900&fit=crop&auto=format', buttonText: 'Explore Projects', buttonLink: '/projects', active: true, order: 0 },
    { id: '2', title: 'Discover Rare Exotic Plants', subtitle: 'Curated collections of magnificent tropical foliage to elevate your interior living spaces.', image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1600&h=900&fit=crop&auto=format', buttonText: 'Shop Plants', buttonLink: '/products', active: true, order: 1 }
];

const defaultSections: LayoutSection[] = [
    { id: "services", label: "Our Services", active: true, order: 0 },
    { id: "categories", label: "Browse By Category", active: true, order: 1 },
    { id: "featured_products", label: "Featured Products", active: true, order: 2 },
    { id: "portfolio", label: "Landscaping Portfolio", active: true, order: 3 },
    { id: "promise", label: "The Thurulya Promise", active: true, order: 4 },
    { id: "testimonials", label: "Client Testimonials", active: true, order: 5 },
];

const testimonials = [
    { name: 'Sandun Rathnayake', review: 'They helped me to have these beauties in my rooftop - easy to handle ( response speed, stick to commited date) -I even didn’t went to their physical place - proprietor came himself for work - Price I think reasonable - price included all plants, pots, transport, labor,I didn’t worry on anything - their labors also well mannered', rating: 5, avatar: '' },
    { name: 'Methma Ediriweera', review: 'Highly recommend them for their top-notch services and expertise in creating stunning landscapes. 🫶🏽', rating: 5, avatar: '' },
];

const landscapingServices = [
    { title: "Landscaping Design", desc: "Creative and sustainable garden designs that beautify spaces with native plants.", icon: <Leaf className="w-6 h-6" /> },
    { title: "Hardscaping", desc: "Durable and aesthetic installations for patios, pathways, and retaining walls.", icon: <LayoutGrid className="w-6 h-6" /> },
    { title: "Interior Scaping", desc: "Transforming indoor spaces with vibrant plant arrangements for healthier environments.", icon: <Home className="w-6 h-6" /> },
    { title: "Maintenance", desc: "Comprehensive garden care, including pruning, fertilizing, and seasonal clean-ups.", icon: <Wrench className="w-6 h-6" /> },
    { title: "Paving Works", desc: "Installation of durable and aesthetic pathways and driveways using premium materials.", icon: <Map className="w-6 h-6" /> },
    { title: "Root Ball Prep", desc: "Expert preparation of root balls and precise planting techniques for plant health.", icon: <Sprout className="w-6 h-6" /> },
];

export default function HomePage() {
    const [heroIndex, setHeroIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [heroSlides, setHeroSlides] = useState<LiveSlide[]>([]);
    const [layoutConfig, setLayoutConfig] = useState<LayoutSection[]>(defaultSections);
    const [categories, setCategories] = useState<FirestoreCategory[]>([]);
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

    const servicesScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchHomepageData() {
            try {
                // 1. Fetch Global Settings for Contact Info & Socials
                const settingsDoc = await getDoc(doc(db, "settings", "general"));
                if (settingsDoc.exists()) {
                    setSiteSettings(settingsDoc.data() as SiteSettings);
                }

                // 2. Fetch Hero Slides
                const slideSnap = await getDocs(query(collection(db, "homepage_slides"), orderBy("order", "asc")));
                const activeSlides = slideSnap.docs.map(d => ({ id: d.id, ...d.data() } as LiveSlide)).filter(s => s.active);
                setHeroSlides(activeSlides.length > 0 ? activeSlides : fallbackSlides);

                // 3. Fetch Layout
                const layoutDoc = await getDoc(doc(db, "settings", "homepage_layout"));
                if (layoutDoc.exists() && layoutDoc.data().sections) {
                    const savedSections = layoutDoc.data().sections as LayoutSection[];
                    const merged = [...savedSections];
                    defaultSections.forEach(ds => {
                        if (!merged.find(s => s.id === ds.id)) merged.push(ds);
                    });
                    setLayoutConfig(merged);
                }

                // 4. Fetch Categories
                const catSnap = await getDocs(collection(db, "categories"));
                const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreCategory[];
                setCategories(fetchedCats.filter(cat => cat.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));

                // 5. Fetch Projects & Products
                const projSnap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(4)));
                setFeaturedProjects(projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));

                const prodSnap = await getDocs(query(collection(db, "products"), limit(4)));
                setFeaturedProducts(prodSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        price: data.price || 0,
                        category: data.category || 'Uncategorized',
                        image: data.images?.[0] || data.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&fit=crop',
                    } as Product;
                }));
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                setHeroSlides(fallbackSlides);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHomepageData();
    }, []);

    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 6000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const scrollServices = (direction: 'left' | 'right') => {
        if (servicesScrollRef.current) {
            const scrollAmount = 350;
            servicesScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F0F5F1]"><Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B]" /></div>;
    }

    const slide = heroSlides[heroIndex] || fallbackSlides[0];

    const renderSection = (section: LayoutSection) => {
        if (!section.active) return null;

        switch (section.id) {
            case "services":
                return (
                    <section key={section.id} className="py-24 bg-[#E1EBE2] overflow-hidden">
                        <div className="max-w-7xl mx-auto px-6 mb-12">
                            <p className="text-[#3A5A38] mb-2 tracking-widest uppercase text-xs font-bold">What We Do</p>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h2 className="font-serif text-3xl sm:text-4xl text-[#2C3E2B] tracking-wide mb-4">Our Landscaping Services</h2>
                                    <p className="text-[#4A6A48] text-sm sm:text-base max-w-2xl font-medium">We provide a full range of landscaping services tailored to your vision and needs.</p>
                                </div>
                                <div className="hidden md:flex gap-3">
                                    <button onClick={() => scrollServices('left')} className="p-4 bg-[#F0F5F1] rounded-full text-[#2C3E2B] hover:bg-[#D5E5D6] transition-colors shadow-sm border border-[#D5E5D6]">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => scrollServices('right')} className="p-4 bg-[#F0F5F1] rounded-full text-[#2C3E2B] hover:bg-[#D5E5D6] transition-colors shadow-sm border border-[#D5E5D6]">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full">
                            <div
                                ref={servicesScrollRef}
                                className="flex flex-nowrap overflow-x-auto gap-8 pb-12 pt-2 px-6 md:px-[calc((100vw-80rem)/2+1.5rem)] snap-x hide-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {landscapingServices.map((srv, idx) => (
                                    <div key={idx} className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] shrink-0 bg-[#F4F7F4] p-6 rounded-full shadow-sm border border-[#D5E5D6] snap-start flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-default">
                                        <div className="w-16 h-16 rounded-full bg-[#E1EBE2] text-[#2C3E2B] flex items-center justify-center mb-4 shrink-0 border border-[#D5E5D6]">
                                            {srv.icon}
                                        </div>
                                        <h3 className="font-serif text-xl sm:text-2xl text-[#2C3E2B] mb-2">{srv.title}</h3>
                                        <p className="text-[#4A6A48] text-sm leading-relaxed font-medium line-clamp-3 px-6">{srv.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="md:hidden flex justify-center gap-4 -mt-4 pb-6">
                                <button onClick={() => scrollServices('left')} className="p-3 bg-[#F0F5F1] rounded-full text-[#2C3E2B] shadow-sm border border-[#D5E5D6]">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => scrollServices('right')} className="p-3 bg-[#F0F5F1] rounded-full text-[#2C3E2B] shadow-sm border border-[#D5E5D6]">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </section>
                );

            case "categories":
                return (
                    <section key={section.id} className="py-20 bg-[#F0F5F1] border-b border-[#D5E5D6]/50">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-12">
                                <p className="text-[#4A6A48] mb-2 tracking-widest uppercase text-xs font-bold">Browse By Category</p>
                                <h2 className="font-serif text-2xl sm:text-4xl text-[#2C3E2B] tracking-wide">Find What You&apos;re Looking For</h2>
                            </div>
                            {categories.length === 0 ? (
                                <div className="text-center py-10 text-[#4A6A48] bg-[#E8EFE9] border border-dashed border-[#D5E5D6] rounded-2xl">New categories arriving soon!</div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {categories.map((cat) => {
                                        const safeSlug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                        return (
                                            <Link key={cat.id} href={`/categories/${safeSlug}`} className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer block shadow-sm border border-[#D5E5D6]">
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E19]/90 via-[#1A2E19]/30 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                                                    <h3 className="text-white mb-1 font-serif text-lg sm:text-xl">{cat.name}</h3>
                                                    <span className="inline-flex items-center gap-1.5 bg-[#F4F7F4] text-[#2C3E2B] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase mt-2 group-hover:bg-[#2C3E2B] group-hover:text-white transition-all shadow-sm">
                                                        Explore <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                );

            case "featured_products":
                return (
                    <section key={section.id} className="py-20 bg-[#E8EFE9] border-b border-[#D5E5D6]/50">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <p className="text-[#3A5A38] mb-2 tracking-widest uppercase text-xs font-bold">Hand-Picked For You</p>
                                    <h2 className="font-serif text-2xl sm:text-4xl text-[#2C3E2B] tracking-wide">Featured Plants & Products</h2>
                                </div>
                                <Link href="/products" className="hidden sm:flex items-center gap-2 text-[#2C3E2B] text-xs font-bold tracking-wider uppercase hover:gap-3 transition-all">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {featuredProducts.length === 0 ? (
                                <div className="text-center py-10 text-[#4A6A48] bg-[#F0F5F1] border border-dashed border-[#D5E5D6] rounded-2xl">New products arriving soon!</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                                </div>
                            )}
                        </div>
                    </section>
                );

            case "portfolio":
                return (
                    <section key={section.id} className="py-20 bg-[#F0F5F1]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <p className="text-[#4A6A48] mb-2 tracking-widest uppercase text-xs font-bold">Our Portfolio</p>
                                    <h2 className="font-serif text-2xl sm:text-4xl text-[#2C3E2B] tracking-wide">Landscaping Masterpieces</h2>
                                </div>
                                <Link href="/projects" className="hidden sm:flex items-center gap-2 text-[#2C3E2B] text-xs font-bold tracking-wider uppercase hover:gap-3 transition-all">
                                    All Projects <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {featuredProjects.length === 0 ? (
                                <div className="text-center py-10 text-[#4A6A48] bg-[#E8EFE9] border border-dashed border-[#D5E5D6] rounded-2xl">Portfolio updating soon!</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                    {featuredProjects.map((project) => (
                                        <Link key={project.id} href={`/projects/${project.id}`} className="group relative overflow-hidden rounded-3xl aspect-[4/3] block w-full text-left shadow-lg border border-[#D5E5D6]">
                                            <img src={project.coverImage || project.img} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E19]/90 via-[#1A2E19]/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                                                <span className="inline-block px-4 py-1.5 bg-[#D97706] text-white rounded-full text-xs uppercase tracking-wider font-bold mb-3 shadow-sm">{project.type || "Landscaping"}</span>
                                                <h3 className="text-white mb-2 font-serif text-2xl sm:text-3xl drop-shadow-md truncate">{project.name}</h3>
                                                <p className="text-[#EAF1EB] text-xs font-bold tracking-wider uppercase truncate drop-shadow-sm">
                                                    <MapPin className="w-4 h-4 inline mr-1 -mt-1" />{project.location} · {project.date}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                );

            case "promise":
                return (
                    <section key={section.id} className="py-24 bg-[#2C3E2B] text-[#F0F5F1]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <p className="text-[#D5E5D6] mb-2 tracking-widest uppercase text-xs font-bold">The Thurulya Promise</p>
                                <h2 className="font-serif text-3xl sm:text-4xl tracking-wide text-white">The Difference Is In the Details</h2>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                                {[
                                    { icon: '🌿', title: 'Expert Landscaping', desc: '15 years of premium tropical garden architecture across Sri Lanka.' },
                                    { icon: '🏆', title: 'Premium Plants', desc: 'Nursery-nurtured, carefully inspected, and guaranteed healthy.' },
                                    { icon: '✅', title: 'Quality Guarantee', desc: '30-day comprehensive plant health backing on every single purchase.' },
                                    { icon: '🚚', title: 'Islandwide Logistics', desc: 'Secure direct climate delivery and styling anywhere in the island.' },
                                ].map((item) => (
                                    <div key={item.title} className="text-center">
                                        <div className="text-5xl mb-6 drop-shadow-sm">{item.icon}</div>
                                        <h3 className="font-serif text-lg sm:text-xl mb-3 text-white">{item.title}</h3>
                                        <p className="text-[#D5E5D6] text-sm font-medium leading-relaxed px-2">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            case "testimonials":
                return (
                    <section key={section.id} className="py-20 bg-[#E1EBE2] border-t border-[#D5E5D6]/50">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-12">
                                <p className="text-[#3A5A38] mb-2 tracking-widest uppercase text-xs font-bold">What Clients Say</p>
                                <h2 className="font-serif text-2xl sm:text-4xl text-[#2C3E2B] tracking-wide">Stories From Our Garden Community</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                                {testimonials.map((t, i) => (
                                    <div key={i} className="bg-[#F4F7F4] rounded-3xl p-8 sm:p-10 border border-[#D5E5D6] shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex gap-1 mb-6">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-amber-500 text-amber-500" />)}</div>
                                            <p className="text-[#3A5A38] mb-8 italic text-base sm:text-lg font-medium leading-relaxed">&quot;{t.review}&quot;</p>
                                        </div>
                                        <div className="flex items-center gap-4 border-t border-[#D5E5D6]/60 pt-6">
                                            <div className="w-12 h-12 rounded-full bg-[#EAF1EB] text-[#2C3E2B] flex items-center justify-center font-bold text-lg border border-[#D5E5D6] shadow-sm">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-[#2C3E2B]">{t.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <main className="bg-[#F0F5F1]">
            {/* 1. HERO SLIDER */}
            <section className="relative overflow-hidden h-[600px] sm:h-[700px] bg-black">
                {heroSlides.map((s, i) => (
                    <div key={s.id || i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}>
                        <img src={s.image} alt={s.title} className="w-full h-full object-cover object-center opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </div>
                ))}

                <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full flex items-center justify-start">
                        <div className="max-w-2xl">
                            <p className="text-[#EAF1EB] mb-4 tracking-widest uppercase text-xs sm:text-sm font-bold drop-shadow-md">Premium Nursery & Landscaping</p>
                            <h1 className="text-white mb-6 leading-tight font-serif text-4xl sm:text-5xl lg:text-7xl tracking-wide drop-shadow-lg">{slide.title}</h1>
                            <p className="text-[#F0F5F1] mb-10 text-base sm:text-lg max-w-xl font-medium leading-relaxed drop-shadow-md">{slide.subtitle}</p>
                            <Link href={slide.buttonLink || '/'} className="inline-flex items-center gap-2 bg-[#F0F5F1] text-[#2C3E2B] px-8 py-4 rounded-full text-sm font-bold tracking-wider uppercase shadow-xl hover:bg-[#D5E5D6] hover:gap-4 transition-all">
                                {slide.buttonText || 'Explore'} <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {heroSlides.length > 1 && (
                    <>
                        <button onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/20">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/20">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </section>

            {/* 2. DYNAMIC SECTIONS */}
            {layoutConfig.sort((a, b) => a.order - b.order).map(section => renderSection(section))}

            {/* 3. CONTACT INFO */}
            <section className="py-24 bg-[#F0F5F1] border-b border-[#D5E5D6]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <p className="text-[#3A5A38] mb-2 tracking-widest uppercase text-xs font-bold">Visit Us</p>
                            <h2 className="font-serif text-3xl sm:text-5xl text-[#2C3E2B] tracking-wide mb-10">We&apos;re Here For You</h2>
                            <ul className="space-y-8">
                                {[
                                    { icon: <MapPin className="w-6 h-6" />, label: 'Address', value: siteSettings?.address || '1119/d Dhammodaya Mw., Battaramulla 10120 / Hokandara' },
                                    { icon: <Phone className="w-6 h-6" />, label: 'Phone', value: siteSettings?.phone || '+94 76 345 5267' },
                                    { icon: <Mail className="w-6 h-6" />, label: 'Email', value: siteSettings?.email || 'thuruliyagardenslk@gmail.com' },
                                    { icon: <Clock className="w-6 h-6" />, label: 'Opening Hours', value: 'Mon–Sat 8am–6pm · Sun 9am–3pm' },
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-full bg-[#E1EBE2] flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#D5E5D6] shadow-sm">{item.icon}</div>
                                        <div className="pt-1.5">
                                            <p className="text-[#4A6A48] text-[12px] uppercase font-bold tracking-widest mb-1.5">{item.label}</p>
                                            <p className="text-lg font-semibold text-stone-800 leading-snug">{item.value}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-4 mt-12">
                                <a href={`tel:${siteSettings?.phone || '+94763455267'}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C3E2B] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-opacity-95 transition-colors shadow-md">
                                    <Phone className="w-5 h-5" /> Call Us
                                </a>
                                <a href={`https://wa.me/${siteSettings?.whatsapp || '94763455267'}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-[#3A5A38] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#2C3E2B] transition-colors shadow-md">
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        <div className="rounded-3xl overflow-hidden border-2 border-[#D5E5D6] h-[550px] shadow-lg bg-[#EAF1EB] w-full">
                            <iframe
                                src="https://maps.google.com/maps?q=Dhammodaya%20Mw,%20Hokandara,%20Sri%20Lanka&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full border-0"
                                title="Thuruliya Gardens Location Map"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SOCIAL MEDIA LINKS */}
            <section className="py-24 bg-[#E8EFE9] text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-[#4A6A48] mb-2 tracking-widest uppercase text-xs font-bold">Follow Along</p>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#2C3E2B] tracking-wide mb-10">Join Our Community</h2>

                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-4 text-sm font-bold text-[#2C3E2B] uppercase tracking-wider">
                        <a href={siteSettings?.instagram || "https://www.instagram.com/thuruliya.lk/"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-pink-600 transition-colors bg-[#F4F7F4] px-8 py-4 rounded-full border border-[#D5E5D6] shadow-sm hover:shadow-md">
                            <InstagramIcon className="w-6 h-6 text-pink-600" /> Instagram
                        </a>
                        <a href={siteSettings?.facebook || "https://www.facebook.com/ThuruliyaGardens/"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-blue-600 transition-colors bg-[#F4F7F4] px-8 py-4 rounded-full border border-[#D5E5D6] shadow-sm hover:shadow-md">
                            <FacebookIcon className="w-6 h-6 text-blue-600" /> Facebook
                        </a>
                        <a href={siteSettings?.tiktok || "https://www.tiktok.com/@thuruliya_gardens/"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-stone-900 transition-colors bg-[#F4F7F4] px-8 py-4 rounded-full border border-[#D5E5D6] shadow-sm hover:shadow-md">
                            <TiktokIcon className="w-6 h-6 text-stone-900" /> TikTok
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}