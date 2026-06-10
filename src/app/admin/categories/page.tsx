'use client';

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight, Upload, Loader2, Check, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import * as Collapsible from "@radix-ui/react-collapsible";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast, Toaster } from "sonner";

// --- FIREBASE & CLOUDINARY IMPORTS ---
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// --- STRICT TYPING ---
interface Subcategory {
    id: string;
    name: string;
    active: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    active: boolean;
    subcategories: Subcategory[];
    order?: number;
}

// --- DRAGGABLE CATEGORY COMPONENT ---
interface DraggableCategoryProps {
    category: Category;
    index: number;
    moveCategory: (from: number, to: number) => void;
    onDeleteCategory: (id: string) => void;
    onEditCategory: (category: Category) => void;
    onToggleCategory: (id: string, active: boolean) => void;
    onAddSubcategory: (catId: string, subName: string) => void;
    onDeleteSubcategory: (catId: string, subId: string) => void;
}

function DraggableCategory({
                               category, index, moveCategory, onDeleteCategory, onEditCategory, onToggleCategory, onAddSubcategory, onDeleteSubcategory
                           }: DraggableCategoryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");

    const [{ isDragging }, drag] = useDrag({
        type: "category",
        item: { index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: "category",
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveCategory(item.index, index);
                item.index = index;
            }
        },
    });

    const handleSaveSub = () => {
        if (!newSubName.trim()) return;
        onAddSubcategory(category.id, newSubName.trim());
        setNewSubName("");
        setIsAddingSub(false);
    };

    return (
        <div ref={(node) => { drag(node); drop(node); }} className={`${isDragging ? "opacity-50" : ""}`}>
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4 shadow-sm transition-all hover:shadow-md">
                <div className="p-4 flex items-center gap-4">
                    <button className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition-colors">
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <img src={category.image} alt={category.name} className="w-14 h-14 rounded-lg object-cover border border-stone-100" />

                    <div className="flex-1">
                        <h3 className="font-semibold text-stone-800 text-lg">{category.name}</h3>
                        <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mt-1">
                            {category.subcategories?.length || 0} subcategories
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch.Root
                            checked={category.active}
                            onCheckedChange={(val) => onToggleCategory(category.id, val)}
                            className="w-11 h-6 bg-stone-200 rounded-full data-[state=checked]:bg-[#2C3E2B] transition-colors shadow-inner outline-none cursor-pointer"
                        >
                            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                        </Switch.Root>

                        <button onClick={() => onEditCategory(category)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                            <Edit className="w-4 h-4" />
                        </button>

                        <button onClick={() => onDeleteCategory(category.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
                            <Collapsible.Trigger className="p-2 rounded-lg hover:bg-stone-100 text-[#2C3E2B] transition-colors ml-2 bg-stone-50">
                                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                <div className="mt-6 pl-12 pr-4 pb-4 space-y-2 border-t border-stone-100 pt-4">

                                    {/* List Subcategories */}
                                    {!category.subcategories || category.subcategories.length === 0 ? (
                                        <p className="text-sm text-stone-500 italic p-3">No subcategories added yet.</p>
                                    ) : (
                                        category.subcategories.map((sub: Subcategory) => (
                                            <div key={sub.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                <GripVertical className="w-4 h-4 text-stone-300" />
                                                <span className="flex-1 text-sm font-medium text-stone-700">{sub.name}</span>
                                                <button onClick={() => onDeleteSubcategory(category.id, sub.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 shadow-sm border border-transparent hover:border-red-100 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}

                                    {/* Inline Add Subcategory UI */}
                                    {isAddingSub ? (
                                        <div className="flex items-center gap-2 mt-3 p-2 bg-stone-100 rounded-lg">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newSubName}
                                                onChange={(e) => setNewSubName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveSub()}
                                                placeholder="Subcategory name..."
                                                className="flex-1 px-3 py-2 text-sm rounded-md border border-stone-200 outline-none focus:border-[#2C3E2B] text-stone-800"
                                            />
                                            <button onClick={handleSaveSub} className="p-2 bg-[#2C3E2B] text-white rounded-md hover:bg-opacity-90 transition-colors">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setIsAddingSub(false)} className="p-2 bg-stone-200 text-stone-600 rounded-md hover:bg-stone-300 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setIsAddingSub(true)} className="w-full flex items-center justify-center gap-2 p-3 mt-3 border-2 border-dashed border-stone-200 rounded-lg text-stone-500 hover:border-[#2C3E2B] hover:text-[#2C3E2B] hover:bg-[#2C3E2B]/5 transition-all">
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Add Subcategory</span>
                                        </button>
                                    )}

                                </div>
                            </Collapsible.Content>
                        </Collapsible.Root>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", active: true });

    // 1. FETCH CATEGORIES
    useEffect(() => {
        async function fetchCategories() {
            setIsLoadingData(true);
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const fetched = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Ensure subcategories is always an array of objects to fix ESLint 'any' errors and bugs
                    const safeSubcategories: Subcategory[] = (data.subcategories || []).map((sub: string | Subcategory) =>
                        typeof sub === 'string' ? { id: Math.random().toString(36).substr(2, 9), name: sub, active: true } : sub
                    );

                    return { id: doc.id, ...data, subcategories: safeSubcategories } as Category;
                });

                fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
                setCategories(fetched);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories.");
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchCategories();
    }, []);

    const moveCategory = (fromIndex: number, toIndex: number) => {
        const updated = [...categories];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setCategories(updated);
        // In the future, you can update 'order' in Firestore here.
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // --- OPEN MODAL FOR EDIT OR ADD ---
    const openModalForAdd = () => {
        setEditingCategory(null);
        setFormData({ name: "", slug: "", active: true });
        setSelectedFile(null);
        setShowAddModal(true);
    };

    const openModalForEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, slug: category.slug, active: category.active });
        setSelectedFile(null);
        setShowAddModal(true);
    };

    // --- CRUD OPERATIONS ---
    const handleSaveCategory = async () => {
        if (!formData.name) {
            toast.error("Category name is required!");
            return;
        }

        if (!editingCategory && !selectedFile) {
            toast.error("An image is required for new categories!");
            return;
        }

        setIsUploading(true);
        try {
            let imageUrl = editingCategory?.image || ""; // Keep old image if editing and no new file

            if (selectedFile) {
                imageUrl = await uploadImageToCloudinary(selectedFile);
            }

            const finalSlug = formData.slug.trim() === ""
                ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                : formData.slug;

            if (editingCategory) {
                // UPDATE EXISTING
                const docRef = doc(db, "categories", editingCategory.id);
                await updateDoc(docRef, { name: formData.name, slug: finalSlug, image: imageUrl, active: formData.active });

                setCategories(categories.map(cat => cat.id === editingCategory.id
                    ? { ...cat, name: formData.name, slug: finalSlug, image: imageUrl, active: formData.active }
                    : cat
                ));
                toast.success("Category updated!");
            } else {
                // ADD NEW
                const newCategoryData = {
                    name: formData.name, slug: finalSlug, image: imageUrl, active: formData.active,
                    subcategories: [], order: categories.length
                };
                const docRef = await addDoc(collection(db, "categories"), newCategoryData);
                setCategories([...categories, { id: docRef.id, ...newCategoryData }]);
                toast.success("Category added to Database!");
            }

            setShowAddModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Error saving category.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteDoc(doc(db, "categories", id));
            setCategories(categories.filter(cat => cat.id !== id));
            toast.success("Category deleted.");
        } catch (error) {
            toast.error("Failed to delete category.");
        }
    };

    const handleToggleCategory = async (id: string, active: boolean) => {
        try {
            await updateDoc(doc(db, "categories", id), { active });
            setCategories(categories.map(cat => cat.id === id ? { ...cat, active } : cat));
        } catch (error) {
            toast.error("Failed to toggle category status.");
        }
    };

    const handleAddSubcategory = async (catId: string, subName: string) => {
        try {
            const category = categories.find(c => c.id === catId);
            if (!category) return;

            const newSub: Subcategory = { id: Math.random().toString(36).substr(2, 9), name: subName, active: true };
            const updatedSubs = [...category.subcategories, newSub];

            await updateDoc(doc(db, "categories", catId), { subcategories: updatedSubs });
            setCategories(categories.map(cat => cat.id === catId ? { ...cat, subcategories: updatedSubs } : cat));
            toast.success("Subcategory added!");
        } catch (error) {
            toast.error("Failed to add subcategory.");
        }
    };

    const handleDeleteSubcategory = async (catId: string, subId: string) => {
        try {
            const category = categories.find(c => c.id === catId);
            if (!category) return;

            const updatedSubs = category.subcategories.filter(sub => sub.id !== subId);

            await updateDoc(doc(db, "categories", catId), { subcategories: updatedSubs });
            setCategories(categories.map(cat => cat.id === catId ? { ...cat, subcategories: updatedSubs } : cat));
            toast.success("Subcategory deleted.");
        } catch (error) {
            toast.error("Failed to delete subcategory.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <Toaster position="top-right" richColors />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Categories</h1>
                    <p className="text-stone-500 text-sm">Organize your store hierarchy and navigation menus.</p>
                </div>
                <button
                    onClick={openModalForAdd}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E2B] hover:bg-opacity-90 text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-md transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {isLoadingData ? (
                <div className="flex justify-center items-center py-20 text-[#2C3E2B]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-xl">
                    <p className="text-stone-500 mb-4">No categories found in your database.</p>
                    <button onClick={openModalForAdd} className="text-[#2C3E2B] font-bold hover:underline">Create your first Category</button>
                </div>
            ) : (
                <DndProvider backend={HTML5Backend}>
                    <div className="space-y-2">
                        {categories.map((category, index) => (
                            <DraggableCategory
                                key={category.id}
                                category={category}
                                index={index}
                                moveCategory={moveCategory}
                                onDeleteCategory={handleDeleteCategory}
                                onEditCategory={openModalForEdit}
                                onToggleCategory={handleToggleCategory}
                                onAddSubcategory={handleAddSubcategory}
                                onDeleteSubcategory={handleDeleteSubcategory}
                            />
                        ))}
                    </div>
                </DndProvider>
            )}

            {/* Add/Edit Category Modal */}
            <Dialog.Root open={showAddModal} onOpenChange={setShowAddModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg z-50 text-stone-800 focus:outline-none">
                        <Dialog.Title className="text-2xl font-serif text-[#2C3E2B] mb-6">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">Form to manage a category.</Dialog.Description>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Exotic Orchids"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">URL Slug (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    placeholder="exotic-orchids"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-[#2C3E2B]/20 outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Category Banner Image</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="cat-image" />
                                <label htmlFor="cat-image" className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center block cursor-pointer hover:border-[#2C3E2B] transition-colors relative overflow-hidden">
                                    {selectedFile ? (
                                        <span className="text-sm font-medium text-stone-700">{selectedFile.name}</span>
                                    ) : editingCategory?.image ? (
                                        <span className="text-sm font-medium text-stone-700 flex flex-col items-center">
                                            <img src={editingCategory.image} className="w-16 h-16 object-cover rounded-md mb-2 opacity-50" alt="Current" />
                                            Click to replace image
                                        </span>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-stone-400" />
                                            <span className="text-sm font-medium text-stone-700">Click to upload image</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                <div>
                                    <label className="text-sm font-bold text-stone-800">Publish Immediately</label>
                                    <p className="text-xs text-stone-500 mt-0.5">Category will be visible to customers</p>
                                </div>
                                <Switch.Root
                                    checked={formData.active}
                                    onCheckedChange={(val) => setFormData({...formData, active: val})}
                                    className="w-11 h-6 bg-stone-300 rounded-full data-[state=checked]:bg-[#2C3E2B] transition-colors outline-none cursor-pointer"
                                >
                                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                                </Switch.Root>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3.5 bg-stone-100 text-stone-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-all">Cancel</button>
                            <button onClick={handleSaveCategory} disabled={isUploading} className="flex-[2] flex items-center justify-center px-6 py-3.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 disabled:opacity-50 transition-all">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Category"}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}