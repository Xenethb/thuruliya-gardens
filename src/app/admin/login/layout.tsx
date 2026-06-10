'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Home,
    Sprout,
    ShoppingCart,
    Users,
    Image as ImageIcon,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Leaf
} from "lucide-react";

const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/categories", label: "Categories", icon: FolderTree },
    { path: "/admin/homepage", label: "Homepage Content", icon: Home },
    { path: "/admin/projects", label: "Landscaping Projects", icon: Sprout },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/customers", label: "Customers", icon: Users },
    { path: "/admin/media", label: "Media Library", icon: ImageIcon },
    { path: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // FIREBASE SECURITY GUARD
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser && pathname !== '/admin/login') {
                router.push('/admin/login');
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [pathname, router]);

    const handleLogout = async () => {
        await signOut(auth);
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.push('/admin/login');
    };

    // 1. Show loading state
    if (loading) {
        return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-[#2C3E2B] font-medium">Authenticating Secure Workspace...</div>;
    }

    // 2. If on login page, render ONLY the login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // 3. Render the secure Dashboard UI
    return (
        <div className="flex h-screen bg-stone-50">

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-stone-200 z-10">
                <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2C3E2B] flex items-center justify-center shadow-inner">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-serif text-lg text-[#2C3E2B] font-bold">Thurulya</h1>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Workspace</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all text-sm font-medium ${
                                    isActive
                                        ? "bg-[#2C3E2B] text-white shadow-sm"
                                        : "text-stone-600 hover:bg-stone-100 hover:text-[#2C3E2B]"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stone-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Secure Logout</span>
                    </button>
                </div>
            </aside>

            {/* Sidebar - Mobile */}
            <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-[#2C3E2B] flex items-center justify-center">
                                    <Leaf className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-serif text-[#2C3E2B] font-bold">Thurulya</h1>
                                </div>
                            </div>
                            <Dialog.Close className="p-2 rounded-lg hover:bg-stone-100 text-stone-500">
                                <X className="w-5 h-5" />
                            </Dialog.Close>
                        </div>

                        <nav className="flex-1 p-4 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all text-sm font-medium ${
                                            isActive
                                                ? "bg-[#2C3E2B] text-white"
                                                : "text-stone-600 hover:bg-stone-100"
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-stone-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="bg-white border-b border-stone-200 px-4 lg:px-8 py-4 z-10">
                    <div className="flex items-center justify-between gap-4">

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Global Search */}
                        <div className="flex-1 max-w-xl hidden sm:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Search products, orders, customers..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                            {/* Notifications */}
                            <button className="p-2 rounded-full hover:bg-stone-100 text-stone-500 relative transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D97706] rounded-full border border-white"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all outline-none">
                                    <div className="w-8 h-8 rounded-full bg-[#2C3E2B] flex items-center justify-center text-white font-medium text-xs tracking-wider">
                                        AD
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-stone-700 mr-1">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </span>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content className="bg-white rounded-xl shadow-lg border border-stone-100 p-2 min-w-[220px] z-50 mt-2 animate-in fade-in slide-in-from-top-2">
                                        <DropdownMenu.Item className="px-3 py-3 rounded-lg outline-none">
                                            <div className="text-sm font-bold text-stone-800">Admin User</div>
                                            <div className="text-xs text-stone-500 truncate">{user?.email}</div>
                                        </DropdownMenu.Item>

                                        <DropdownMenu.Separator className="h-px bg-stone-100 my-1" />

                                        <DropdownMenu.Item className="outline-none">
                                            <Link href="/admin/settings" className="w-full px-3 py-2 rounded-md hover:bg-stone-50 flex items-center text-sm text-stone-700 transition-colors">
                                                Account Settings
                                            </Link>
                                        </DropdownMenu.Item>

                                        <DropdownMenu.Item
                                            className="px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600 transition-colors cursor-pointer outline-none mt-1"
                                            onClick={handleLogout}
                                        >
                                            Secure Logout
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#FAF9F6] p-4 sm:p-8">
                    {children}
                </main>

            </div>
        </div>
    );
}