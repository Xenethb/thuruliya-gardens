'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

// Define the shape of a Product directly here to keep the component self-contained
export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    image: string;
    badge?: 'New' | 'Sale' | 'Bestseller' | string;
}

interface ProductCardProps {
    product: Product;
    // We keep onAddToCart as a prop so the parent page can handle cart logic
    onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [hovered, setHovered] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    return (
        <div
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-[4/5] bg-stone-50 shrink-0">
                <Link href={`/products/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-105' : 'scale-100'}`}
                    />
                </Link>

                {/* Dynamic Badge */}
                {product.badge && (
                    <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm"
                        style={{
                            backgroundColor: product.badge === 'Sale' ? '#EF4444' : product.badge === 'New' ? '#2C3E2B' : '#D97706',
                            color: '#FFFFFF',
                        }}
                    >
            {product.badge}
          </span>
                )}

                {/* Hover Action Overlay */}
                <div className={`absolute inset-0 bg-black/5 flex items-end justify-center pb-4 gap-2 transition-opacity duration-300 pointer-events-none ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="pointer-events-auto flex gap-2">
                        <Link
                            href={`/products/${product.id}`}
                            className="p-2.5 bg-white rounded-full shadow hover:bg-stone-100 transition-colors"
                            aria-label="Quick view"
                        >
                            <Eye className="w-4 h-4 text-gray-700" />
                        </Link>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (onAddToCart) onAddToCart(product);
                            }}
                            className="px-4 py-2.5 bg-[#2C3E2B] text-white rounded-full shadow flex items-center gap-2 hover:bg-opacity-90 transition-colors text-xs font-semibold uppercase tracking-wider"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add
                        </button>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setWishlisted(!wishlisted);
                            }}
                            className="p-2.5 bg-white rounded-full shadow hover:bg-stone-100 transition-colors"
                            aria-label="Wishlist"
                        >
                            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <Link href={`/products/${product.id}`} className="p-4 flex flex-col flex-1 justify-between group-hover:bg-stone-50/50 transition-colors">
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{product.name}</h3>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <span className="font-semibold text-[#2C3E2B] text-sm">
            Rs. {product.price.toLocaleString()}
          </span>
                    {product.originalPrice && (
                        <span className="line-through text-gray-400 text-xs">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
