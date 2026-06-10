'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone, MapPin, Loader2, Building, Package } from "lucide-react";
import { toast, Toaster } from "sonner";

// FIREBASE
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";

interface PageProps {
    params: Promise<{ id: string }>;
}

// --- STRICT TYPES FOR TYPESCRIPT/ESLINT COMPLIANCE ---
interface CustomerInfo {
    name: string;
    phone: string;
    whatsapp: string;
    company?: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode: string;
    notes?: string;
}

interface OrderItem {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
    };
    quantity: number;
}

interface OrderData {
    id: string;
    orderId: number;
    customer: CustomerInfo;
    items: OrderItem[];
    subtotal: number;
    delivery: number;
    total: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function CustomerDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    // The ID in the URL is the encoded phone number
    const decodedPhone = decodeURIComponent(id);

    const [customerOrders, setCustomerOrders] = useState<OrderData[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [notes, setNotes] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCustomerData() {
            try {
                // 1. Fetch all orders for this phone number
                const q = query(collection(db, "orders"), where("customer.phone", "==", decodedPhone));
                const snap = await getDocs(q);

                // Explicitly map documents into typed OrderData interfaces
                const orders = snap.docs.map(docSnap => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        orderId: data.orderId,
                        customer: data.customer,
                        items: data.items,
                        subtotal: data.subtotal,
                        delivery: data.delivery,
                        total: data.total,
                        paymentMethod: data.paymentMethod,
                        status: data.status,
                        createdAt: data.createdAt
                    } as OrderData;
                });

                // Sort orders by date descending (newest first)
                orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setCustomerOrders(orders);

                if (orders.length > 0) {
                    // Extract the most recent customer info from their latest order
                    const latestOrder = orders[0];
                    setCustomerInfo(latestOrder.customer);
                }

                // 2. Fetch internal notes for this customer
                const noteRef = doc(db, "customer_notes", decodedPhone);
                const noteSnap = await getDoc(noteRef);
                if (noteSnap.exists()) {
                    setNotes(noteSnap.data().text || "");
                }

            } catch (error) {
                console.error("Error fetching customer data:", error);
                toast.error("Failed to load customer details.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCustomerData();
    }, [decodedPhone]);

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            await setDoc(doc(db, "customer_notes", decodedPhone), {
                text: notes,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            toast.success("Internal note saved!");
        } catch (error) {
            console.error("Error saving note:", error);
            toast.error("Failed to save note.");
        } finally {
            setIsSavingNote(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                <p className="text-stone-500 font-medium">Loading customer profile...</p>
            </div>
        );
    }

    if (!customerInfo && customerOrders.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-stone-500 mb-4">No data found for this customer.</p>
                <button onClick={() => router.push("/admin/customers")} className="px-6 py-2.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider">
                    Back to Customers
                </button>
            </div>
        );
    }

    // Get unique addresses used by this customer (Now safe because o is typed as OrderData)
    const uniqueAddresses = Array.from(new Set(customerOrders.map(o =>
        `${o.customer.address}, ${o.customer.apartment ? o.customer.apartment + ', ' : ''}${o.customer.city} ${o.customer.postalCode}`
    )));

    // Extract initials for the avatar
    const initials = customerInfo?.name
        ? customerInfo.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
        : "??";

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <Toaster position="top-right" richColors />

            <button
                onClick={() => router.push("/admin/customers")}
                className="flex items-center gap-2 text-stone-500 hover:text-[#2C3E2B] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center">
                        <div className="w-24 h-24 rounded-full bg-[#E1EBE2] border border-[#D5E5D6] flex items-center justify-center text-[#2C3E2B] text-3xl font-bold mb-4 mx-auto">
                            {initials}
                        </div>
                        <h2 className="text-2xl font-serif text-[#2C3E2B] mb-1">{customerInfo?.name}</h2>
                        {customerInfo?.company && (
                            <p className="text-sm font-medium text-stone-500 mb-4 flex items-center justify-center gap-1.5">
                                <Building className="w-3.5 h-3.5" /> {customerInfo.company}
                            </p>
                        )}
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                            Total Orders: {customerOrders.length}
                        </p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                                <Phone className="w-5 h-5 text-stone-400" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-stone-400">Phone</p>
                                    <a href={`tel:${customerInfo?.phone}`} className="text-sm font-bold text-stone-800 hover:text-[#2C3E2B]">{customerInfo?.phone}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <MessageCircle className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-emerald-600/70">WhatsApp</p>
                                    <a href={`https://wa.me/${customerInfo?.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-800 hover:underline">
                                        {customerInfo?.whatsapp || 'Not provided'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h3 className="font-serif text-[#2C3E2B] mb-5 border-b border-stone-100 pb-3">Known Addresses</h3>
                        <div className="space-y-4">
                            {uniqueAddresses.map((address, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm p-3 bg-stone-50 rounded-xl border border-stone-100">
                                    <MapPin className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                                    <p className="text-stone-700 font-medium leading-relaxed">{address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order History & Notes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h3 className="font-serif text-[#2C3E2B] mb-6 text-xl border-b border-stone-100 pb-3">Order History</h3>
                        <div className="space-y-3">
                            {customerOrders.map((order) => {
                                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                });
                                const displayId = `ORD-${order.id.padStart(3, '0')}`;

                                return (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-[#2C3E2B]/30 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-stone-800 text-sm mb-0.5">{displayId}</p>
                                                <p className="text-xs font-medium text-stone-500">{formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <p className="font-bold text-[#2C3E2B] text-sm">Rs. {order.total?.toLocaleString()}</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : order.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h3 className="font-serif text-[#2C3E2B] mb-4 text-xl border-b border-stone-100 pb-3">Internal Notes</h3>
                        <p className="text-xs text-stone-500 mb-3 font-medium uppercase tracking-wider">Visible only to admins</p>
                        <textarea
                            rows={5}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add preferences, previous issues, or special requests about this customer..."
                            className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-xl text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white resize-none transition-all"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSaveNote}
                                disabled={isSavingNote}
                                className="px-8 py-3 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}