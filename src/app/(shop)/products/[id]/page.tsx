'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ChevronRight, Sun, Droplets, Ruler, Package, MapPin, Phone, Loader2 } from 'lucide-react';
import { ProductCard, Product } from '@/app/components/ProductCard';

// --- FIREBASE IMPORTS ---
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

interface DetailedProduct extends Product {
    description?: string;
    height?: string;
    potSize?: string;
    sunlight?: string;
    water?: string;
    location?: string;
    originalPrice?: number;
    badge?: string;
    stock: number;
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProductDetailPage({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    // --- LIVE DATA STATES ---
    const [product, setProduct] = useState<DetailedProduct | null>(null);
    const [related, setRelated] = useState<DetailedProduct[]>([]);
    const [whatsappNumber, setWhatsappNumber] = useState<string>('94763455267'); // Fallback number
    const [isLoading, setIsLoading] = useState(true);

    // --- INTERACTIVE STATES ---
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0); // Kept for future gallery expansion

    // --- FETCH DATA FROM FIRESTORE ---
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                // 1. Fetch the Global Settings for the WhatsApp number
                const settingsRef = doc(db, "settings", "general");
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists() && settingsSnap.data().whatsapp) {
                    // Strip out any non-numeric characters (like + or spaces) just to be safe for the wa.me link
                    const cleanNumber = settingsSnap.data().whatsapp.replace(/[^0-9]/g, '');
                    setWhatsappNumber(cleanNumber);
                }

                // 2. Fetch the main product
                const docRef = doc(db, "products", productId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() } as DetailedProduct;
                    setProduct(productData);

                    // If out of stock, set initial quantity to 0
                    if (productData.stock === 0) {
                        setQuantity(0);
                    }

                    // 3. Fetch Related Products (Same category, excluding current product)
                    const relatedQuery = query(
                        collection(db, "products"),
                        where("category", "==", productData.category),
                        limit(5)
                    );
                    const relatedSnap = await getDocs(relatedQuery);
                    const relatedData: DetailedProduct[] = [];

                    relatedSnap.forEach((doc) => {
                        if (doc.id !== productId && relatedData.length < 4) {
                            relatedData.push({ id: doc.id, ...doc.data() } as DetailedProduct);
                        }
                    });

                    setRelated(relatedData);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [productId]);

    function handleBuyNow() {
        router.push(`/checkout?product=${product?.id}&qty=${quantity}`);
    }

    // --- LOADING STATE ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-[#2C3E2B]">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-medium tracking-wider uppercase text-sm">Loading Plant Details...</p>
            </div>
        );
    }

    // --- NOT FOUND STATE ---
    if (!product) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-3xl font-serif text-[#2C3E2B] mb-4">Plant Not Found</h1>
                <p className="text-stone-500 mb-8">We couldn&apos;t find the plant you were looking for.</p>
                <Link href="/products" className="px-8 py-3 bg-[#2C3E2B] text-white rounded-full text-sm font-bold uppercase tracking-wider">
                    Back to Shop
                </Link>
            </div>
        );
    }

    const images = [product.image]; // Using single image as array for gallery logic

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            {/* Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                <nav className="flex items-center gap-2 text-stone-400 text-xs font-bold tracking-wider uppercase">
                    <Link href="/" className="hover:text-[#2C3E2B] transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link
                        href={`/categories/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                        className="hover:text-[#2C3E2B] transition-colors"
                    >
                        {product.category}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#2C3E2B] truncate">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">

                    {/* Left Column: Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] shadow-sm">
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />

                            {product.badge && (
                                <span
                                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                    style={{
                                        backgroundColor: product.badge === 'Sale' ? '#EF4444' : product.badge === 'New' ? '#2C3E2B' : '#D97706',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    {product.badge}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Product Information */}
                    <div className="flex flex-col justify-center">
                        <p className="text-stone-400 mb-2 text-xs font-bold uppercase tracking-widest">{product.category}</p>
                        <h1 className="mb-4 font-serif text-3xl sm:text-4xl text-[#2C3E2B] leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-2xl font-bold text-[#2C3E2B]">
                                Rs. {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="line-through text-stone-400 text-lg">
                                    Rs. {product.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* LIVE STOCK INDICATOR */}
                        <div className={`flex items-center gap-2 mb-8 w-fit px-3 py-1.5 rounded-full border ${product.stock > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={`text-[10px] font-bold tracking-wide uppercase ${product.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                            </span>
                        </div>

                        <p className="text-stone-600 mb-10 leading-relaxed font-light">
                            {product.description || "A beautiful addition to your home or garden."}
                        </p>

                        {(product.height || product.sunlight || product.water || product.potSize) && (
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {product.height && (
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-stone-100 shadow-sm">
                                        <div className="p-2 bg-stone-50 rounded-lg"><Ruler className="w-5 h-5 text-[#2C3E2B]" /></div>
                                        <div>
                                            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Height</p>
                                            <p className="text-sm font-medium text-stone-800">{product.height}</p>
                                        </div>
                                    </div>
                                )}
                                {product.potSize && (
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-stone-100 shadow-sm">
                                        <div className="p-2 bg-stone-50 rounded-lg"><Package className="w-5 h-5 text-[#2C3E2B]" /></div>
                                        <div>
                                            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Pot Size</p>
                                            <p className="text-sm font-medium text-stone-800">{product.potSize}</p>
                                        </div>
                                    </div>
                                )}
                                {product.sunlight && (
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-stone-100 shadow-sm">
                                        <div className="p-2 bg-amber-50 rounded-lg"><Sun className="w-5 h-5 text-amber-500" /></div>
                                        <div>
                                            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Sunlight</p>
                                            <p className="text-sm font-medium text-stone-800">{product.sunlight}</p>
                                        </div>
                                    </div>
                                )}
                                {product.water && (
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-stone-100 shadow-sm">
                                        <div className="p-2 bg-blue-50 rounded-lg"><Droplets className="w-5 h-5 text-blue-500" /></div>
                                        <div>
                                            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Watering</p>
                                            <p className="text-sm font-medium text-stone-800">{product.water}</p>
                                        </div>
                                    </div>
                                )}
                                {product.location && (
                                    <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-stone-100 shadow-sm col-span-2 sm:col-span-1">
                                        <div className="p-2 bg-stone-50 rounded-lg"><MapPin className="w-5 h-5 text-[#2C3E2B]" /></div>
                                        <div>
                                            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Ideal Location</p>
                                            <p className="text-sm font-medium text-stone-800">{product.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ACTIONS: Quantity, WhatsApp, Buy Now */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">

                            {/* Quantity Selector with limits */}
                            <div className="flex items-center border border-stone-200 rounded-full overflow-hidden bg-white h-12 w-full sm:w-32 shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={product.stock === 0}
                                    className="w-10 h-full flex items-center justify-center hover:bg-stone-50 text-stone-600 disabled:opacity-50"
                                >−</button>
                                <span className="flex-1 text-center text-sm font-bold text-[#2C3E2B]">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock || product.stock === 0}
                                    className="w-10 h-full flex items-center justify-center hover:bg-stone-50 text-stone-600 disabled:opacity-50"
                                >+</button>
                            </div>

                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Hi, I am interested in purchasing ${quantity}x ${encodeURIComponent(product.name)} (Rs. ${product.price}). Is it available?`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 w-full flex items-center justify-center gap-2 h-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md text-xs font-bold uppercase tracking-wider"
                            >
                                <Phone className="w-4 h-4" /> Inquire on WhatsApp
                            </a>

                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="flex-1 w-full flex items-center justify-center gap-2 h-12 rounded-full bg-[#2C3E2B] text-white hover:bg-opacity-90 transition-colors shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Zap className="w-4 h-4" /> Buy It Now
                            </button>
                        </div>

                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section className="pt-16 border-t border-stone-200">
                        <h2 className="mb-8 font-serif text-2xl sm:text-3xl text-[#2C3E2B]">You May Also Like</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}