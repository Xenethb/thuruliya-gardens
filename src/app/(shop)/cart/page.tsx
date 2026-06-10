'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { Product } from '@/app/components/ProductCard';

// Define what a Cart Item looks like
interface CartItem {
    product: Product;
    quantity: number;
}

// Temporary Initial Data so you can see the UI working immediately
const initialCart: CartItem[] = [
    {
        product: {
            id: '1',
            name: 'Premium Monstera Deliciosa',
            price: 4500,
            category: 'Indoor Plants',
            image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&fit=crop'
        },
        quantity: 1
    },
    {
        product: {
            id: '4',
            name: 'Terracotta Minimalist Planter',
            price: 2200,
            category: 'Pots & Planters',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop'
        },
        quantity: 2
    }
];

export default function CartPage() {
    const router = useRouter();

    // Local state to manage the cart interactions for this demo
    const [cart, setCart] = useState<CartItem[]>(initialCart);

    // Cart Math
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const delivery = subtotal > 10000 ? 0 : 500;
    const total = subtotal + delivery;

    // Handlers for cart interactions
    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart(cart.map(item =>
            item.product.id === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemove = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    // EMPTY CART STATE
    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] bg-[#FAF9F6] flex items-center justify-center">
                <div className="text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-sm max-w-md w-full mx-4">
                    <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="mb-3 font-serif text-2xl sm:text-3xl text-[#2C3E2B]">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 font-light">Add some beautiful tropical plants to get started.</p>
                    <Link
                        href="/products"
                        className="inline-block px-8 py-3.5 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-colors text-sm font-bold tracking-wider uppercase shadow-md"
                    >
                        Shop Plants
                    </Link>
                </div>
            </div>
        );
    }

    // ACTIVE CART STATE
    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <h1 className="mb-8 font-serif text-3xl sm:text-4xl text-[#2C3E2B]">
                    Your Cart <span className="text-gray-400 text-xl font-sans">({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(({ product, quantity }) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4 sm:gap-6 items-start shadow-sm transition-all hover:shadow-md">

                                {/* Product Image */}
                                <Link href={`/products/${product.id}`} className="shrink-0">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover hover:opacity-80 transition-opacity"
                                    />
                                </Link>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0 py-1">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                                        {product.category}
                                    </p>
                                    <Link href={`/products/${product.id}`}>
                                        <h3 className="mb-1 text-sm sm:text-base font-medium text-gray-800 line-clamp-2 hover:text-[#2C3E2B] transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-[#2C3E2B] font-semibold text-sm mt-2">
                                        Rs. {product.price.toLocaleString()}
                                    </p>
                                </div>

                                {/* Actions & Price */}
                                <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0 py-1">
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Quantity Pill */}
                                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-stone-50 h-8 sm:h-9">
                                        <button
                                            onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-stone-200 transition-colors text-gray-600"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-xs font-semibold text-[#2C3E2B]">
                      {quantity}
                    </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-stone-200 transition-colors text-gray-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <p className="text-gray-500 text-xs font-medium">
                                        Rs. {(product.price * quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4">
                            <Link
                                href="/products"
                                className="text-[#D97706] hover:text-[#b46205] transition-colors flex items-center gap-2 text-sm font-bold tracking-wider uppercase"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-28">
                            <h2 className="mb-6 pb-4 border-b border-gray-100 font-serif text-xl text-[#2C3E2B]">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-light">Subtotal</span>
                                    <span className="text-gray-800 text-sm font-medium">Rs. {subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-light">Delivery</span>
                                    <span className={`text-sm font-medium ${delivery === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                    {delivery === 0 ? 'Free' : `Rs. ${delivery}`}
                  </span>
                                </div>

                                {delivery === 0 && (
                                    <div className="bg-emerald-50 text-emerald-700 text-xs p-2 rounded border border-emerald-100 flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Free delivery applied to this order!
                                    </div>
                                )}
                                {delivery > 0 && (
                                    <p className="text-xs text-gray-400 font-light mt-1">
                                        Add Rs. {(10000 - subtotal).toLocaleString()} more for free delivery.
                                    </p>
                                )}

                                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-end">
                                    <span className="text-gray-800 font-bold">Total</span>
                                    <span className="font-serif text-2xl text-[#2C3E2B]">
                    Rs. {total.toLocaleString()}
                  </span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-colors text-sm font-bold tracking-wider uppercase shadow-md"
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}