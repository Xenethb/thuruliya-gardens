'use client';

import { useState, useEffect } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// FIREBASE
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Order {
    id: string;          // The document ID in Firestore (e.g., "1")
    displayId: string;   // Formatted for UI (e.g., "ORD-001")
    customer: string;
    date: string;
    paymentMethod: string;
    total: number;
    status: string;
}

const statusColors = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
    processing: "bg-purple-50 text-purple-700 border border-purple-200",
    shipped: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // FETCH LIVE ORDERS FROM FIRESTORE
    useEffect(() => {
        async function fetchOrders() {
            try {
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    // Format the payment method to be readable
                    const paymentDisplay = data.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : data.paymentMethod === 'bank'
                            ? 'Bank Transfer'
                            : data.paymentMethod;

                    // Format the date nicely (e.g., Jun 10, 2026)
                    const formattedDate = data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })
                        : "Unknown Date";

                    return {
                        id: doc.id,
                        displayId: `ORD-${doc.id.padStart(3, '0')}`, // Makes "1" into "ORD-001"
                        customer: data.customer?.name || "Unknown Customer",
                        date: formattedDate,
                        paymentMethod: paymentDisplay,
                        total: data.total || 0,
                        status: data.status || "pending"
                    } as Order;
                });

                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, []);

    // FILTER LOGIC
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Orders</h1>
                <p className="text-stone-500 text-sm">Manage customer orders, track shipments, and update payment statuses.</p>
            </div>

            {/* Filters Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all shadow-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all shadow-sm cursor-pointer"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                        <p className="text-stone-500 text-sm font-medium">Loading orders from database...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-stone-50 border-b border-stone-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Order Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Payment Method</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-[#2C3E2B]">{order.displayId}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-stone-800">{order.customer}</td>
                                        <td className="px-6 py-4 text-sm text-stone-500">{order.date}</td>
                                        <td className="px-6 py-4 text-sm text-stone-500">{order.paymentMethod}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-[#2C3E2B]">
                                            Rs. {order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status as keyof typeof statusColors] || statusColors.pending}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                    className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-[#2C3E2B] transition-colors"
                                                    title="View Full Order Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredOrders.length === 0 && (
                            <div className="py-16 text-center border-t border-stone-100">
                                <p className="text-stone-500 font-medium">{searchQuery || statusFilter !== "all" ? `No orders found matching your filters.` : `No orders have been placed yet.`}</p>
                                {(searchQuery || statusFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setStatusFilter("all");
                                        }}
                                        className="mt-2 text-sm text-[#D97706] hover:underline font-bold"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}