'use client';

import { useState, useEffect } from "react";
import { Search, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// FIREBASE
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Customer {
    id: string; // Using phone number as the unique ID
    name: string;
    phone: string;
    whatsapp: string;
    city: string;
    totalOrders: number;
    lastOrder: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // FETCH AND AGGREGATE CUSTOMERS FROM ORDERS
    useEffect(() => {
        async function fetchCustomers() {
            try {
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                // Use a Map to group orders by phone number
                const customerMap = new Map<string, Customer>();

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const custData = data.customer;

                    if (!custData || !custData.phone) return; // Skip if no customer data

                    const phone = custData.phone;
                    const orderDate = data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : "Unknown Date";

                    if (customerMap.has(phone)) {
                        // Customer exists, just increment their order count
                        const existing = customerMap.get(phone)!;
                        existing.totalOrders += 1;
                        // Since we query by createdAt desc, the first one we saw was already the most recent
                    } else {
                        // New customer found
                        customerMap.set(phone, {
                            id: phone, // Using phone as unique identifier
                            name: custData.name || "Unknown",
                            phone: custData.phone,
                            whatsapp: custData.whatsapp || "N/A",
                            city: custData.city || "N/A",
                            totalOrders: 1,
                            lastOrder: orderDate
                        });
                    }
                });

                // Convert Map to Array
                setCustomers(Array.from(customerMap.values()));
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Customers</h1>
                <p className="text-stone-500 text-sm">View and manage your customer database generated from orders.</p>
            </div>

            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search by name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all shadow-sm"
                />
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                        <p className="text-stone-500 text-sm font-medium">Aggregating customer data...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-stone-50 border-b border-stone-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">WhatsApp</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Total Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Last Order</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#E1EBE2] border border-[#D5E5D6] flex items-center justify-center text-[#2C3E2B] font-bold text-xs">
                                                    {customer.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-stone-800 text-sm">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600 font-medium">{customer.phone}</td>
                                        <td className="px-6 py-4 text-sm text-stone-600 font-medium">{customer.whatsapp}</td>
                                        <td className="px-6 py-4 text-sm text-stone-600">{customer.city}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-[#2C3E2B] text-center">{customer.totalOrders}</td>
                                        <td className="px-6 py-4 text-sm text-stone-500">{customer.lastOrder}</td>
                                        <td className="px-6 py-4 text-right">
                                            {/* We encode the phone number so we can pass it safely in the URL */}
                                            <button
                                                onClick={() => router.push(`/admin/customers/${encodeURIComponent(customer.phone)}`)}
                                                className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-[#2C3E2B] transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredCustomers.length === 0 && (
                            <div className="py-16 text-center border-t border-stone-100">
                                <p className="text-stone-500 font-medium">No customers found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}