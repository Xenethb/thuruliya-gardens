'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Truck, Banknote, Loader2 } from 'lucide-react';

// FIREBASE
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';

interface CartItem {
    product: {
        id: string;
        name: string;
        price: number;

        image: string;
    };
    quantity: number;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('product');
    const qtyParam = searchParams.get('qty');

    const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
    const [orderNumber, setOrderNumber] = useState<number | null>(null);

    // Real Data States
    const [cartItem, setCartItem] = useState<CartItem | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Form State (Exact requested fields)
    const [form, setForm] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        postalCode: '',
        notes: '',
    });

    // 1. Fetch Real Product Data
    useEffect(() => {
        async function fetchCheckoutProduct() {
            if (!productId) {
                setIsLoadingData(false);
                return;
            }
            try {
                const docSnap = await getDoc(doc(db, "products", productId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCartItem({
                        product: {
                            id: docSnap.id,
                            name: data.name,
                            price: data.price,
                            image: data.image
                        },
                        quantity: parseInt(qtyParam || '1', 10)
                    });
                }
            } catch (error) {
                console.error("Error fetching product for checkout", error);
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchCheckoutProduct();
    }, [productId, qtyParam]);

    // Calculate Totals
    const subtotal = cartItem ? cartItem.product.price * cartItem.quantity : 0;
    const delivery = subtotal > 10000 ? 0 : 500;
    const total = subtotal + delivery;

    // 2. Handle Order Submission
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!cartItem) return;
        setStep('loading');

        try {
            // A. Safely get sequential Order Number using a Transaction
            const counterRef = doc(db, "settings", "orderCounter");
            let newOrderId = 1;

            await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                if (!counterDoc.exists()) {
                    transaction.set(counterRef, { lastOrder: 1 });
                    newOrderId = 1;
                } else {
                    newOrderId = counterDoc.data().lastOrder + 1;
                    transaction.update(counterRef, { lastOrder: newOrderId });
                }
            });

            // B. Save Order to Firestore
            const orderData = {
                orderId: newOrderId,
                customer: form,
                items: [cartItem],
                subtotal,
                delivery,
                total,
                paymentMethod,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "orders", newOrderId.toString()), orderData);
            setOrderNumber(newOrderId);

            // C. Trigger Automated Email
            await fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            // Move to success screen
            setStep('success');

        } catch (error) {
            console.error("Failed to place order:", error);
            alert("There was an issue placing your order. Please try again.");
            setStep('form');
        }
    }

    if (isLoadingData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B]" />
            </div>
        );
    }

    if (!cartItem) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-serif text-[#2C3E2B] mb-4">Your cart is empty</h1>
                <Link href="/products" className="px-6 py-3 bg-[#2C3E2B] text-white rounded-full text-sm font-bold uppercase tracking-wider">
                    Browse Shop
                </Link>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="text-center bg-white p-12 rounded-3xl border border-stone-200 shadow-sm max-w-md w-full">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="mb-3 font-serif text-3xl text-[#2C3E2B]">Order Placed!</h1>
                    <p className="text-stone-600 mb-2 font-light">Thank you for your order. We have received your request and will contact you via WhatsApp shortly.</p>
                    <div className="bg-stone-50 p-4 rounded-xl mb-8 mt-6 border border-stone-100">
                        <p className="text-stone-500 text-xs font-semibold tracking-widest uppercase mb-1">Order Number</p>
                        <p className="text-[#2C3E2B] font-mono text-2xl font-bold">#{orderNumber}</p>
                    </div>
                    <Link href="/" className="inline-block px-8 py-3.5 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-colors text-sm font-bold uppercase tracking-wider shadow-md w-full">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="mb-8 font-serif text-3xl sm:text-4xl text-[#2C3E2B]">Checkout</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: FORMS */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info Form */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                            <h2 className="mb-6 font-serif text-xl text-[#2C3E2B] border-b border-stone-100 pb-3">Contact Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Email Address</label>
                                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div>
                                    {/* Added pattern to restrict to numbers/plus sign */}
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Normal Phone Number</label>
                                    <input required type="tel" pattern="[0-9+ ]*" title="Please enter numbers only" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9+ ]/g, '')})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">WhatsApp Number</label>
                                    <input required type="tel" pattern="[0-9+ ]*" title="Please enter numbers only" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value.replace(/[^0-9+ ]/g, '')})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info Form (Address already accepts text and numbers by default) */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                            <h2 className="mb-6 font-serif text-xl text-[#2C3E2B] border-b border-stone-100 pb-3">Delivery Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Address</label>
                                    <input required type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Address</label>
                                    <input required type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Apartment, suite, etc. (Optional)</label>
                                    <input type="text" value={form.apartment} onChange={e => setForm({...form, apartment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">City</label>
                                    <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Postal Code</label>
                                    <input required type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Notes (Optional)</label>
                                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-stone-800 resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                            <h2 className="mb-6 font-serif text-xl text-[#2C3E2B] border-b border-stone-100 pb-3">Payment Method</h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'cod', icon: <Banknote className="w-5 h-5" />, label: 'Cash on Delivery', desc: 'Pay safely when your order arrives' },
                                    { id: 'bank', icon: <Truck className="w-5 h-5" />, label: 'Bank Transfer', desc: 'Transfer to our account before delivery is dispatched' },
                                ].map((method) => (
                                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-[#2C3E2B] bg-stone-50 shadow-sm' : 'border-stone-100 hover:border-stone-300'}`}>
                                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id as typeof paymentMethod)} className="w-4 h-4 text-[#2C3E2B] focus:ring-[#2C3E2B] border-stone-300" />
                                        <div className={paymentMethod === method.id ? "text-[#2C3E2B]" : "text-stone-400"}>{method.icon}</div>
                                        <div>
                                            <p className={`text-sm font-bold tracking-wide ${paymentMethod === method.id ? "text-[#2C3E2B]" : "text-stone-700"}`}>{method.label}</p>
                                            <p className="text-stone-500 text-xs font-medium mt-0.5">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ORDER SUMMARY */}
                    <div>
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-28">
                            <h2 className="mb-6 pb-4 border-b border-stone-100 font-serif text-xl text-[#2C3E2B]">Order Summary</h2>

                            <div className="flex gap-4 items-center mb-6">
                                <img src={cartItem.product.image} alt={cartItem.product.name} className="w-16 h-16 rounded-lg object-cover border border-stone-100" />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-bold text-stone-800 mb-1">{cartItem.product.name}</p>
                                    <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">Qty: {cartItem.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-[#2C3E2B] whitespace-nowrap">Rs. {(cartItem.product.price * cartItem.quantity).toLocaleString()}</p>
                            </div>

                            <div className="border-t border-stone-100 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500 font-medium">Subtotal</span>
                                    <span className="text-stone-800 font-bold">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500 font-medium">Delivery</span>
                                    <span className={`font-bold ${delivery === 0 ? 'text-emerald-600' : 'text-stone-800'}`}>
                                        {delivery === 0 ? 'Free' : `Rs. ${delivery.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-stone-200 pt-4 mt-2 items-end">
                                    <span className="text-stone-800 font-bold uppercase tracking-wider text-sm">Total</span>
                                    <span className="font-serif text-2xl text-[#2C3E2B]">Rs. {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button type="submit" disabled={step === 'loading'} className="w-full mt-8 flex items-center justify-center py-4 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-colors shadow-md text-sm font-bold tracking-wider uppercase disabled:opacity-70">
                                {step === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Place Order'}
                            </button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B]" /></div>}>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}