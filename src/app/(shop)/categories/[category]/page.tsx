'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link'; // <-- ADDED THIS IMPORT!
import { ProductCard } from '@/app/components/ProductCard';
import { Loader2 } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface PageProps {
    params: Promise<{
        category: string;
    }>;
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    createdAt?: string;
    featured?: boolean;
    status?: string;
}

const categoryBanners: Record<string, string> = {
    'indoor-plants': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1400&h=400&fit=crop&auto=format',
    'outdoor-plants': 'https://images.unsplash.com/photo-1590862891828-9e8888ee1d44?w=1400&h=400&fit=crop&auto=format',
    'garden-supplies': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=400&fit=crop&auto=format',
    'default': 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1400&h=400&fit=crop&auto=format',
};

// Helper to format URL slugs into readable titles
const formatTitle = (slug: string) => {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function CategoryPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const currentSlug = resolvedParams.category;
    const displayTitle = formatTitle(currentSlug);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('featured');

    const bannerUrl = categoryBanners[currentSlug] || categoryBanners.default;

    // --- FETCH LIVE PRODUCTS FOR THIS CATEGORY ---
    useEffect(() => {
        async function fetchCategoryProducts() {
            setIsLoading(true);
            try {
                const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);

                const allFetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

                // Filter products that belong to this category and are active
                const categoryProducts = allFetched.filter(p =>
                    p.status !== "draft" &&
                    (p.category.toLowerCase() === displayTitle.toLowerCase() ||
                        p.category.toLowerCase().replace(/ /g, '-') === currentSlug)
                );

                setProducts(categoryProducts);
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCategoryProducts();
    }, [currentSlug, displayTitle]);

    // --- SORTING LOGIC ---
    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.createdAt || "").localeCompare(a.createdAt || "") * -1;
        // Default to featured first
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            {/* Dynamic Banner */}
            <div className="relative h-48 sm:h-[300px] overflow-hidden bg-[#2C3E2B]">
                <img src={bannerUrl} alt={displayTitle} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end justify-center text-center pb-12">
                    <div>
                        <h1 className="text-white mb-2 font-serif text-3xl sm:text-5xl tracking-wide drop-shadow-lg">
                            {displayTitle}
                        </h1>
                        {!isLoading && (
                            <p className="text-white/80 text-xs sm:text-sm font-medium tracking-widest uppercase">
                                {products.length} Items Available
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/60 gap-4">
                    <p className="text-gray-500 text-sm font-medium">
                        Showing <span className="text-gray-900 font-bold">{sortedProducts.length}</span> results
                    </p>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="ml-auto px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 cursor-pointer hover:border-gray-300 transition-colors"
                    >
                        <option value="featured">Featured Picks</option>
                        <option value="newest">New Arrivals</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>

                {/* Product Grid (Full Width Now!) */}
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-10 h-10 animate-spin text-[#2C3E2B] mb-4" />
                            <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Loading Collection...</p>
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
                            <p className="text-stone-500 font-medium text-lg">No items available in this category right now.</p>
                            <Link href="/products" className="inline-block mt-4 text-[#D97706] font-semibold underline underline-offset-4 hover:text-[#b46205]">
                                Browse all products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}