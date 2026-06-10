'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Home,
    Sprout,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Leaf
} from 'lucide-react';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
    { path: '/admin/homepage', label: 'Homepage Content', icon: Home },
    { path: '/admin/projects', label: 'Landscaping Projects', icon: Sprout },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();
    const router = useRouter();

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
        router.push('/admin/login');
    };

    if (loading) {
        return <div className="min-h-screen w-full bg-[#FAF9F6] text-[#2C3E2B] flex items-center justify-center font-medium">Authenticating Secure Workspace...</div>;
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen w-full bg-[#FAF9F6] text-stone-800 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-stone-200 z-20 shrink-0 h-screen">
                <div className="p-6 border-b border-stone-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2C3E2B] flex items-center justify-center shadow-inner">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-serif text-lg text-[#2C3E2B] font-bold">Thuruliya</h1>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Workspace</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all text-sm font-medium ${
                                    isActive ? "bg-[#2C3E2B] text-white shadow-sm" : "text-stone-600 hover:bg-stone-100 hover:text-[#2C3E2B]"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stone-100 shrink-0">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        <span>Secure Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                            <h1 className="font-serif text-[#2C3E2B] font-bold">Thuruliya</h1>
                            <Dialog.Close className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"><X className="w-5 h-5" /></Dialog.Close>
                        </div>
                        <nav className="flex-1 p-4 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100">
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center h-16 shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600 mr-4">
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Spacer to push profile to the right */}
                    <div className="flex-1"></div>

                    <div className="flex items-center gap-3">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all outline-none">
                                <div className="w-8 h-8 rounded-full bg-[#2C3E2B] flex items-center justify-center text-white font-medium text-xs">
                                    {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                                </div>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content className="bg-white rounded-xl shadow-lg border border-stone-100 p-2 min-w-[200px] z-50 mt-2">
                                    <DropdownMenu.Item className="px-3 py-2 text-xs text-stone-500 truncate">{user?.email}</DropdownMenu.Item>
                                    <DropdownMenu.Item className="px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600 cursor-pointer" onClick={handleLogout}>Logout</DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#FAF9F6] p-4 sm:p-8 text-stone-800">
                    {children}
                </main>
            </div>
        </div>
    );
}