'use client';

import { useState, useEffect } from "react";
import { Package, FolderTree, ShoppingCart, Clock, Image as ImageIcon, TrendingUp, Plus, Upload, Loader2, Map } from "lucide-react";
import { useRouter } from "next/navigation";

// FIREBASE
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, getCountFromServer } from "firebase/firestore";

interface DashboardStats {
    products: number;
    categories: number;
    orders: number;
    pendingOrders: number;
    projects: number;
    slides: number;
}

interface Activity {
    id: string;
    type: string;
    name: string;
    action: string;
    time: string;
    user: string;
}

const quickActions = [
    { label: "Add Product", icon: Package, path: "/admin/products", color: "bg-[#2C3E2B] hover:bg-opacity-90" },
    { label: "Add Category", icon: FolderTree, path: "/admin/categories", color: "bg-[#D97706] hover:bg-[#b46205]" },
    { label: "Upload Project", icon: Upload, path: "/admin/projects", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Create Slide", icon: Plus, path: "/admin/homepage", color: "bg-stone-600 hover:bg-stone-700" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        products: 0,
        categories: 0,
        orders: 0,
        pendingOrders: 0,
        projects: 0,
        slides: 0
    });
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // 1. FAST COUNTS (Does not download documents, just gets the number!)
                const pCount = await getCountFromServer(collection(db, "products"));
                const cCount = await getCountFromServer(collection(db, "categories"));
                const oCount = await getCountFromServer(collection(db, "orders"));
                const projCount = await getCountFromServer(collection(db, "projects"));
                const sCount = await getCountFromServer(collection(db, "homepage_slides"));

                const pendingQ = query(collection(db, "orders"), where("status", "==", "pending"));
                const pendingCount = await getCountFromServer(pendingQ);

                setStats({
                    products: pCount.data().count,
                    categories: cCount.data().count,
                    orders: oCount.data().count,
                    pendingOrders: pendingCount.data().count,
                    projects: projCount.data().count,
                    slides: sCount.data().count
                });

                // 2. RECENT ACTIVITY (Fetch the 5 newest orders)
                const recentOrdersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
                const recentSnap = await getDocs(recentOrdersQ);

                const activities = recentSnap.docs.map(docSnap => {
                    const data = docSnap.data();
                    const date = data.createdAt ? new Date(data.createdAt) : new Date();

                    // Format time simply (e.g., "Today at 2:30 PM" or "Jun 10")
                    const isToday = date.toDateString() === new Date().toDateString();
                    const timeString = isToday
                        ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return {
                        id: docSnap.id,
                        type: "order",
                        name: `Order ORD-${docSnap.id.padStart(3, '0')}`,
                        action: `Placed by ${data.customer?.name || 'Guest'}`,
                        time: timeString,
                        user: "Customer"
                    };
                });

                setRecentActivity(activities);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const summaryCards = [
        { label: "Total Products", value: stats.products, icon: Package, color: "from-[#2C3E2B] to-[#40583f]", change: "Live in store" },
        { label: "Total Categories", value: stats.categories, icon: FolderTree, color: "from-emerald-600 to-emerald-700", change: "Active categories" },
        { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "from-[#D97706] to-[#b46205]", change: "All time" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "from-red-500 to-red-600", change: stats.pendingOrders > 0 ? "Needs attention!" : "All caught up" },
        { label: "Total Projects", value: stats.projects, icon: Map, color: "from-amber-400 to-amber-500", change: "Landscaping portfolio" },
        { label: "Homepage Slides", value: stats.slides, icon: ImageIcon, color: "from-stone-500 to-stone-600", change: "Hero images" },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B] mb-4" />
                <p className="text-stone-500 font-medium tracking-wider uppercase text-sm">Crunching the numbers...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Dashboard</h1>
                <p className="text-stone-500 text-sm">Welcome back! Here is a live overview of your store today.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-inner`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                            {card.label === "Pending Orders" && card.value > 0 && (
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
                            <p className="text-3xl font-serif text-[#2C3E2B] mb-2">{card.value}</p>
                            <p className={`text-xs font-medium ${card.label === "Pending Orders" && card.value > 0 ? "text-red-500 font-bold" : "text-stone-400"}`}>
                                {card.change}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                        <h2 className="text-lg font-serif text-[#2C3E2B]">Recent Orders</h2>
                        <button onClick={() => router.push('/admin/orders')} className="text-xs font-bold text-[#2C3E2B] hover:text-[#D97706] uppercase tracking-wider transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="p-6">
                        {recentActivity.length === 0 ? (
                            <p className="text-stone-500 text-sm text-center py-6">No recent orders yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <ShoppingCart className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-stone-800">{activity.name}</p>
                                            <p className="text-xs text-stone-500 mt-0.5">{activity.action}</p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex-shrink-0 pt-1 text-right">
                                            {activity.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm h-fit">
                    <div className="p-6 border-b border-stone-100">
                        <h2 className="text-lg font-serif text-[#2C3E2B]">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => router.push(action.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-white transition-all shadow-sm ${action.color}`}
                                >
                                    <action.icon className="w-5 h-5" />
                                    <span className="text-sm font-bold tracking-wider uppercase">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}