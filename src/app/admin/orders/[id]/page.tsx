'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Banknote, Truck, MessageCircle, Phone, Loader2, StickyNote } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { toast, Toaster } from "sonner";

// FIREBASE
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface PageProps {
    params: Promise<{ id: string }>;
}

const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch order data
    useEffect(() => {
        async function fetchOrder() {
            try {
                const docRef = doc(db, "orders", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Order not found!");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to load order details.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchOrder();
    }, [id]);

    // Handle status update
    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateDoc(doc(db, "orders", id), { status: newStatus });
            setOrder((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                <p className="text-stone-500 font-medium">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-stone-500 mb-4">We couldn't find this order.</p>
                <button onClick={() => router.push("/admin/orders")} className="px-6 py-2.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Back to Orders
                </button>
            </div>
        );
    }

    const displayId = `ORD-${order.id.padStart(3, '0')}`;
    const formattedDate = new Date(order.createdAt).toLocaleString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    const paymentDisplay = order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'bank' ? 'Bank Transfer' : order.paymentMethod;
    const PaymentIcon = order.paymentMethod === 'cod' ? Banknote : order.paymentMethod === 'bank' ? Truck : CreditCard;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <Toaster position="top-right" richColors />

            <button
                onClick={() => router.push("/admin/orders")}
                className="flex items-center gap-2 text-stone-500 hover:text-[#2C3E2B] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
            </button>

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                    <h1 className="text-2xl lg:text-4xl font-serif text-[#2C3E2B] mb-2">{displayId}</h1>
                    <p className="text-stone-500 text-sm">Placed on {formattedDate}</p>
                </div>
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[order.status as keyof typeof statusColors] || statusColors.pending}`}>
                    {order.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Left Column: Items & Totals */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-6">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover border border-stone-100" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-stone-800 text-sm">{item.product.name}</h3>
                                        <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-[#2C3E2B]">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
                            <div className="flex justify-between text-sm text-stone-600"><span>Subtotal</span><span className="font-medium text-stone-800">Rs. {order.subtotal?.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm text-stone-600"><span>Delivery</span><span className="font-medium text-stone-800">{order.delivery === 0 ? 'Free' : `Rs. ${order.delivery?.toLocaleString()}`}</span></div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-stone-100 mt-2 items-end">
                                <span className="text-[#2C3E2B] text-sm uppercase tracking-wider">Total</span>
                                <span className="text-emerald-700 text-2xl">Rs. {order.total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Notes (If Any) */}
                    {order.customer?.notes && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-amber-800 mb-2">
                                <StickyNote className="w-4 h-4" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">Customer Delivery Notes</h2>
                            </div>
                            <p className="text-amber-900 text-sm italic">"{order.customer.notes}"</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Customer Details & Status Update */}
                <div className="space-y-6">

                    {/* Status Updater */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-5">Update Status</h2>
                        <Select.Root value={order.status} onValueChange={handleStatusUpdate}>
                            <Select.Trigger className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all font-semibold outline-none">
                                <Select.Value />
                                <Select.Icon><ChevronDown className="w-4 h-4 text-stone-400" /></Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content className="bg-white rounded-xl shadow-xl border border-stone-100 p-2 z-50 min-w-[200px]">
                                    <Select.Viewport>
                                        {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                                            <Select.Item key={status} value={status} className="px-4 py-2 hover:bg-stone-50 rounded-lg cursor-pointer capitalize text-sm font-medium outline-none text-stone-800">
                                                <Select.ItemText>{status}</Select.ItemText>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] mb-5 border-b border-stone-100 pb-3">Customer Details</h2>

                        <div className="space-y-4 text-sm mb-6">
                            <div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Name</p>
                                <p className="font-bold text-stone-800 text-base">{order.customer?.name}</p>
                                {order.customer?.company && <p className="text-stone-500 mt-0.5">{order.customer.company}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100"><Phone className="w-3.5 h-3.5 text-stone-500" /></div>
                                <a href={`tel:${order.customer?.phone}`} className="text-stone-700 font-medium hover:text-[#2C3E2B]">{order.customer?.phone}</a>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100"><MessageCircle className="w-3.5 h-3.5 text-emerald-600" /></div>
                                <a href={`https://wa.me/${order.customer?.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-medium hover:underline">
                                    {order.customer?.whatsapp}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 pt-5 border-t border-stone-100">
                            <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0"><MapPin className="w-3.5 h-3.5 text-stone-500" /></div>
                            <div className="text-sm text-stone-700 leading-relaxed">
                                <p className="font-bold text-stone-800 mb-1">Delivery Address</p>
                                <p>{order.customer?.address}</p>
                                {order.customer?.apartment && <p>{order.customer?.apartment}</p>}
                                <p>{order.customer?.city}, {order.customer?.postalCode}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-stone-100">
                            <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0"><PaymentIcon className="w-4 h-4 text-stone-500" /></div>
                            <div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Payment Method</p>
                                <p className="text-sm font-bold text-stone-800">{paymentDisplay}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}