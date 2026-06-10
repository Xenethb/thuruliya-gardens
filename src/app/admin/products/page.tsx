'use client';

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast, Toaster } from "sonner";
import * as Switch from "@radix-ui/react-switch";

// FIREBASE & CLOUDINARY
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// --- TYPES ---
interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    price: number;
    stock: number;
    status: "active" | "draft";
    featured: boolean;
    image: string;
}

// Fixed Preset Categories and Subcategories as you requested
const PRESET_CATEGORIES = [
    { name: "Indoor Plants", subcategories: ["Tabletop Plants", "Air Purifying Plants"] },
    { name: "Outdoor Plants", subcategories: ["Flowering Plants", "Architectural Plants", "Shrubs"] },
    { name: "Garden Supplies", subcategories: ["Pots & Planters", "Soil & Fertilizers", "Tools"] }
];

export default function AdminProductsPage() {
    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Form States
    const [showAddModal, setShowAddModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "Indoor Plants", // Default selected category
        subcategory: "",
        status: "active" as "active" | "draft",
        featured: false
    });

    // 1. FETCH PRODUCTS FROM DATABASE
    useEffect(() => {
        async function loadProducts() {
            try {
                const prodQ = query(collection(db, "products"), orderBy("createdAt", "desc"));
                const prodSnap = await getDocs(prodQ);
                setProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
            } catch (error) {
                console.error("Failed to load products", error);
                toast.error("Failed to load inventory.");
            } finally {
                setIsLoading(false);
            }
        }
        loadProducts();
    }, []);

    // 2. HELPERS FOR FORM
    const availableSubcategories = PRESET_CATEGORIES.find(c => c.name === formData.category)?.subcategories || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size exceeds 10MB limit.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", price: "", stock: "", category: "Indoor Plants", subcategory: "", status: "active", featured: false });
        setSelectedFile(null);
        setShowAddModal(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            subcategory: product.subcategory || "",
            status: product.status,
            featured: product.featured || false
        });
        setSelectedFile(null);
        setShowAddModal(true);
    };

    // 3. DATABASE SAVE OPERATIONS
    const handleSaveProduct = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Product name, price, and category are required fields.");
            return;
        }

        if (!editingId && !selectedFile) {
            toast.error("Please select a product image before saving.");
            return;
        }

        setIsUploading(true);
        try {
            let imageUrl = "";

            if (selectedFile) {
                imageUrl = await uploadImageToCloudinary(selectedFile);
            } else if (editingId) {
                const existingProduct = products.find(p => p.id === editingId);
                imageUrl = existingProduct?.image || "";
            }

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10) || 0,
                image: imageUrl,
            };

            if (editingId) {
                // EDIT EXISTING PRODUCT
                await updateDoc(doc(db, "products", editingId), payload);
                setProducts(products.map(p => p.id === editingId ? { ...p, ...payload } : p));
                toast.success("Product updated successfully!");
            } else {
                // ADD NEW PRODUCT
                const newPayload = { ...payload, createdAt: new Date().toISOString() };
                const docRef = await addDoc(collection(db, "products"), newPayload);
                setProducts([{ id: docRef.id, ...newPayload } as Product, ...products]);
                toast.success("New product saved to live catalog!");
            }

            setShowAddModal(false);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Error saving product to collection.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete product.");
        }
    };

    const handleToggleFeatured = async (id: string, featured: boolean) => {
        try {
            await updateDoc(doc(db, "products", id), { featured });
            setProducts(products.map(p => p.id === id ? { ...p, featured } : p));
            toast.success("Featured status updated.");
        } catch (error) {
            toast.error("Failed to update product visibility.");
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" richColors />

            {/* Top Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Products Inventory</h1>
                    <p className="text-stone-500 text-sm">Manage your nursery catalog listings and stock counts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search active listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm outline-none focus:border-[#2C3E2B] text-stone-900 w-full sm:w-64"
                        />
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all shadow-sm shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
            </div>

            {/* List Table */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B]" /></div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    <p className="text-stone-500 font-medium">No inventory items matched your criteria.</p>
                </div>
            ) : (
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-500">
                                <th className="p-4">Product Details</th>
                                <th className="p-4">Category Path</th>
                                <th className="p-4">Retail Price</th>
                                <th className="p-4">Stock Availability</th>
                                <th className="p-4 text-center">Featured</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-stone-100 shrink-0" />
                                            <div>
                                                <p className="font-bold text-stone-900 text-sm">{product.name}</p>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                                                        {product.status}
                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-stone-600">
                                        <div className="font-bold text-stone-800">{product.category}</div>
                                        {product.subcategory && <div className="text-xs text-stone-400 mt-0.5">{product.subcategory}</div>}
                                    </td>
                                    <td className="p-4 font-mono font-bold text-stone-900 text-sm">Rs. {product.price}</td>
                                    <td className="p-4 text-sm">
                                            <span className={`font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-stone-700'}`}>
                                                {product.stock} units
                                            </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Switch.Root
                                            checked={product.featured}
                                            onCheckedChange={(val) => handleToggleFeatured(product.id, val)}
                                            className="w-9 h-5 bg-stone-200 rounded-full data-[state=checked]:bg-[#D97706] transition-colors outline-none cursor-pointer mx-auto"
                                        >
                                            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4 shadow-sm" />
                                        </Switch.Root>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenEdit(product)} className="p-2 text-stone-400 hover:text-[#2C3E2B] bg-white border border-stone-200 hover:border-[#2C3E2B] rounded-lg transition-all shadow-sm">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:text-white bg-white border border-red-200 hover:bg-red-500 hover:border-red-500 rounded-lg transition-all shadow-sm">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add & Edit Modal Overlay */}
            <Dialog.Root open={showAddModal} onOpenChange={setShowAddModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 text-stone-800 focus:outline-none">
                        <Dialog.Title className="text-2xl font-serif text-[#2C3E2B] mb-6">
                            {editingId ? "Edit Product Listing" : "Add New Product"}
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">Form input fields to capture detailed product specifications.</Dialog.Description>

                        <div className="space-y-5">
                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter plant name..."
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-medium"
                                />
                            </div>

                            {/* Product Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed description regarding sizing, soil requirements, care habits..."
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none resize-none font-medium"
                                />
                            </div>

                            {/* Category & Subcategory Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none cursor-pointer font-semibold"
                                    >
                                        {PRESET_CATEGORIES.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Subcategory</label>
                                    <select
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        disabled={availableSubcategories.length === 0}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none cursor-pointer disabled:opacity-50 font-semibold"
                                    >
                                        <option value="">None / Select Subcategory</option>
                                        {availableSubcategories.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pricing & Stocking metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Price (Rs.)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        placeholder="0.00"
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none placeholder:text-stone-400 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Stock Level</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        placeholder="0"
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none placeholder:text-stone-400 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Visibility status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "draft" })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none cursor-pointer font-semibold"
                                    >
                                        <option value="active">Active (Visible to Visitors)</option>
                                        <option value="draft">Draft (Hidden in Catalog)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Product Images dropzone container */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Product Images</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center block cursor-pointer hover:border-[#2C3E2B] transition-all bg-stone-50 relative overflow-hidden">
                                    {selectedFile ? (
                                        <span className="text-sm text-[#2C3E2B] font-bold block truncate">{selectedFile.name}</span>
                                    ) : editingId && products.find(p => p.id === editingId)?.image ? (
                                        <div className="flex flex-col items-center">
                                            <img src={products.find(p => p.id === editingId)?.image} alt="Current Thumbnail" className="h-16 object-contain mb-2 rounded border border-stone-200" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Click to replace image</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <Upload className="w-6 h-6 mb-1 text-stone-400" />
                                            <span className="text-sm text-stone-700 font-bold">Click to upload or drag and drop</span>
                                            <span className="text-xs text-stone-400 font-medium">PNG, JPG up to 10MB</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Footer Control Actions */}
                        <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3.5 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors">Cancel</button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={isUploading}
                                className="flex-[2] px-6 py-3.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 disabled:opacity-50 flex items-center justify-center transition-all"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? "Save Changes" : "Save Product")}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}