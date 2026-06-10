'use client';

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X, GripVertical } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { toast, Toaster } from "sonner";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProductEditPage({ params }: PageProps) {
    // Unwrap the dynamic URL parameter (e.g., the "p1" from /admin/products/p1)
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    const router = useRouter();

    const handleSave = () => {
        toast.success("Product updated successfully", {
            description: "Changes are now live on the storefront."
        });
        // In a real app, you would wait for the database to save before routing away
        setTimeout(() => {
            router.push("/admin/products");
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" richColors />

            <button
                onClick={() => router.push("/admin/products")}
                className="flex items-center gap-2 text-stone-500 hover:text-[#2C3E2B] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Inventory
            </button>

            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Edit Product</h1>
                <p className="text-stone-500 text-sm font-mono">ID: {productId}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Left Column: Main Editor */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Core Info */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] border-b border-stone-100 pb-4 mb-6">
                            Product Information
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    defaultValue="Monstera Deliciosa"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Description</label>
                                <textarea
                                    rows={5}
                                    defaultValue="The Monstera Deliciosa, also known as the Swiss Cheese Plant, is a stunning tropical plant with large, glossy leaves. Perfect for adding a touch of the jungle to your indoor space."
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Price (Rs.)</label>
                                    <input
                                        type="number"
                                        defaultValue="4500"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        defaultValue="45"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Category</label>
                                    <select
                                        defaultValue="Indoor Plants"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm cursor-pointer"
                                    >
                                        <option>Indoor Plants</option>
                                        <option>Landscape Plants</option>
                                        <option>Pots & Planters</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Subcategory</label>
                                    <select
                                        defaultValue="Air Purifying Plants"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm cursor-pointer"
                                    >
                                        <option>Tabletop Plants</option>
                                        <option>Air Purifying Plants</option>
                                        <option>Shade Loving Plants</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Search Tags</label>
                                <input
                                    type="text"
                                    defaultValue="indoor, easy-care, large-leaves"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] border-b border-stone-100 pb-4 mb-6">
                            Image Gallery
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="relative group aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
                                    <img
                                        src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=300"
                                        alt={`Product angle ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button className="p-2 bg-white rounded-lg hover:bg-stone-100 text-stone-600 transition-colors shadow-sm cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {i === 1 && (
                                        <span className="absolute top-2 left-2 bg-[#D97706] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                      Primary
                    </span>
                                    )}
                                </div>
                            ))}
                            <button className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center hover:border-[#2C3E2B] hover:bg-stone-50 transition-all cursor-pointer group">
                                <Upload className="w-6 h-6 text-stone-400 mb-2 group-hover:text-[#2C3E2B] transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-[#2C3E2B] transition-colors">Add Image</span>
                            </button>
                        </div>
                        <p className="text-xs text-stone-400 font-medium">Drag images to reorder. The first image will be the primary thumbnail shown on the storefront.</p>
                    </div>
                </div>

                {/* Right Column: Settings & Preview */}
                <div className="space-y-6">

                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] border-b border-stone-100 pb-4 mb-6">
                            Visibility Settings
                        </h2>
                        <div className="space-y-5">

                            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Featured Product</p>
                                    <p className="text-xs text-amber-700 mt-0.5">Show in homepage carousel</p>
                                </div>
                                <Switch.Root
                                    defaultChecked
                                    className="w-11 h-6 bg-stone-300 rounded-full data-[state=checked]:bg-[#D97706] transition-colors shadow-inner outline-none cursor-pointer"
                                >
                                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                                </Switch.Root>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Publish Status</label>
                                <select
                                    defaultValue="active"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:bg-white transition-all text-sm cursor-pointer font-medium"
                                >
                                    <option value="active">Active (Visible)</option>
                                    <option value="hidden">Hidden (Link only)</option>
                                    <option value="draft">Draft (Admin only)</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h2 className="text-lg font-serif text-[#2C3E2B] border-b border-stone-100 pb-4 mb-6">
                            Storefront Preview
                        </h2>
                        <div className="aspect-[4/5] bg-stone-50 rounded-xl overflow-hidden mb-4 border border-stone-100 relative">
                            <img
                                src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&fit=crop"
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 left-3 px-3 py-1 bg-[#D97706] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                Featured
              </span>
                        </div>
                        <h3 className="font-serif text-lg text-stone-800 mb-1">Monstera Deliciosa</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">Indoor Plants</p>
                        <p className="text-xl font-bold text-[#2C3E2B]">Rs. 4,500</p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#2C3E2B] hover:bg-opacity-90 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>

                </div>
            </div>
        </div>
    );
}