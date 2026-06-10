'use client';

import { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, Upload, Loader2, X, Image as ImageIcon, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast, Toaster } from "sonner";

// FIREBASE & CLOUDINARY
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface Project {
    id: string;
    name: string;
    description: string;
    location: string;
    date: string;
    coverImage: string;
    gallery: string[];
    services: string[];
    featured: boolean;
}

// Unified type for handling both existing database URLs and new file uploads in the same list
type GalleryItem = {
    id: string;
    url?: string;
    file?: File;
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Track if we are editing an existing project
    const [editingId, setEditingId] = useState<string | null>(null);

    // FORM STATES
    const [formData, setFormData] = useState({ name: "", description: "", location: "", date: "" });
    const [services, setServices] = useState<string[]>([]);
    const [currentService, setCurrentService] = useState("");

    // NEW: Unified Gallery State (handles drag/drop/reorder of URLs and Files)
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

    // Fetch projects
    useEffect(() => {
        async function fetchProjects() {
            const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setProjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        }
        fetchProjects();
    }, []);

    // --- OPEN MODALS ---
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", location: "", date: "" });
        setServices([]);
        setGalleryItems([]);
        setShowModal(true);
    };

    const handleOpenEdit = (project: Project) => {
        setEditingId(project.id);
        setFormData({ name: project.name, description: project.description || "", location: project.location, date: project.date });
        setServices(project.services || []);

        // Convert existing gallery string URLs into our GalleryItem objects
        const existingGallery: GalleryItem[] = (project.gallery || [project.coverImage]).map((url, i) => ({
            id: `existing-${i}-${Math.random()}`,
            url: url
        }));
        setGalleryItems(existingGallery);

        setShowModal(true);
    };

    // --- GALLERY MANAGEMENT ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (galleryItems.length + filesArray.length > 6) {
                toast.error("You can only have up to 6 images maximum.");
                return;
            }

            const newItems: GalleryItem[] = filesArray.map(file => ({
                id: `new-${Math.random()}`,
                file: file
            }));

            setGalleryItems([...galleryItems, ...newItems]);
        }
    };

    const removeGalleryItem = (id: string) => {
        setGalleryItems(galleryItems.filter(item => item.id !== id));
    };

    const moveGalleryItem = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === galleryItems.length - 1) return;

        const newItems = [...galleryItems];
        const swapIndex = direction === 'left' ? index - 1 : index + 1;

        // Swap elements
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
        setGalleryItems(newItems);
    };

    // --- SERVICES MANAGEMENT ---
    const handleAddService = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();

        if (currentService.trim() && !services.includes(currentService.trim())) {
            setServices([...services, currentService.trim()]);
            setCurrentService("");
        }
    };

    const handleRemoveService = (serviceToRemove: string) => {
        setServices(services.filter(s => s !== serviceToRemove));
    };

    // --- SAVE LOGIC ---
    const handleSaveProject = async () => {
        if (galleryItems.length === 0 || !formData.name) {
            toast.error("Please provide a project name and at least 1 image.");
            return;
        }

        setIsUploading(true);
        try {
            // 1. Process Gallery Items in their exact sorted order
            const finalGalleryUrls: string[] = [];

            for (const item of galleryItems) {
                if (item.file) {
                    // Upload new files
                    const uploadedUrl = await uploadImageToCloudinary(item.file);
                    finalGalleryUrls.push(uploadedUrl);
                } else if (item.url) {
                    // Keep existing URLs
                    finalGalleryUrls.push(item.url);
                }
            }

            // 2. The first image in the sorted array is the cover
            const coverImageUrl = finalGalleryUrls[0];

            // 3. Prepare data payload
            const projectData = {
                ...formData,
                coverImage: coverImageUrl,
                gallery: finalGalleryUrls,
                services: services,
            };

            if (editingId) {
                // UPDATE EXISTING
                await updateDoc(doc(db, "projects", editingId), projectData);
                setProjects(projects.map(p => p.id === editingId ? { ...p, ...projectData } : p));
                toast.success("Project updated successfully!");
            } else {
                // ADD NEW
                const newPayload = {
                    ...projectData,
                    featured: false,
                    status: "Completed",
                    createdAt: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, "projects"), newPayload);
                setProjects([{ id: docRef.id, ...newPayload } as Project, ...projects]);
                toast.success("Project added successfully!");
            }

            setShowModal(false);
        } catch (error) {
            toast.error("Failed to save project.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deleteDoc(doc(db, "projects", id));
            setProjects(projects.filter(p => p.id !== id));
            toast.success("Project deleted.");
        } catch (error) {
            toast.error("Failed to delete project.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" richColors />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Landscaping Projects</h1>
                    <p className="text-stone-500 text-sm">Showcase your completed garden transformations.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E2B] hover:bg-opacity-90 text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-md transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative group">
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleOpenEdit(project)} className="p-2 bg-white/90 hover:bg-stone-100 text-[#2C3E2B] rounded-lg shadow-sm transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow-sm transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative aspect-video">
                            <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold tracking-wider flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> {project.gallery?.length || 1}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-serif text-lg text-[#2C3E2B] mb-3">{project.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                                <MapPin className="w-3.5 h-3.5" /> {project.location}
                            </div>
                            {project.services && project.services.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {project.services.slice(0, 3).map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] uppercase font-bold tracking-wider">{s}</span>
                                    ))}
                                    {project.services.length > 3 && (
                                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] uppercase font-bold tracking-wider">+{project.services.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Project Modal */}
            <Dialog.Root open={showModal} onOpenChange={setShowModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50 focus:outline-none">
                        <Dialog.Title className="text-2xl font-serif text-[#2C3E2B] mb-6">
                            {editingId ? "Edit Project" : "Add New Project"}
                        </Dialog.Title>

                        <div className="space-y-6 text-stone-800">
                            {/* Standard Info */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    placeholder="e.g., Courtyard Oasis"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    placeholder="Project summary..."
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        placeholder="e.g., Colombo"
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Date Completed</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Optional Services */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Services Provided (Optional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentService}
                                        placeholder="e.g., Custom Lighting"
                                        className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                        onChange={(e) => setCurrentService(e.target.value)}
                                        onKeyDown={handleAddService}
                                    />
                                    <button onClick={handleAddService} className="px-4 bg-stone-200 text-stone-700 font-bold text-xs uppercase rounded-xl hover:bg-stone-300 transition-colors">
                                        Add
                                    </button>
                                </div>
                                {services.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {services.map(service => (
                                            <span key={service} className="flex items-center gap-1 bg-[#2C3E2B] text-white px-3 py-1.5 rounded-full text-xs font-medium">
                                                {service}
                                                <button onClick={() => handleRemoveService(service)} className="hover:text-red-300 transition-colors"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Gallery Image Manager */}
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-3 flex justify-between items-center">
                                    <span>Gallery Images ({galleryItems.length}/6)</span>
                                    <span className="text-amber-600 normal-case text-[10px]">The first image is the Cover.</span>
                                </label>

                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {galleryItems.map((item, index) => (
                                        <div key={item.id} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 border-stone-200 group bg-white">
                                            <img
                                                src={item.url ? item.url : URL.createObjectURL(item.file!)}
                                                className="w-full h-full object-cover"
                                                alt={`Gallery item ${index}`}
                                            />

                                            {/* Reorder & Delete Controls Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                                <div className="flex justify-between">
                                                    <button
                                                        onClick={() => moveGalleryItem(index, 'left')}
                                                        disabled={index === 0}
                                                        className="text-white hover:text-amber-400 disabled:opacity-30"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveGalleryItem(index, 'right')}
                                                        disabled={index === galleryItems.length - 1}
                                                        className="text-white hover:text-amber-400 disabled:opacity-30"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeGalleryItem(item.id)}
                                                    className="self-center bg-red-500 text-white rounded p-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Cover indicator tag */}
                                            {index === 0 && (
                                                <div className="absolute top-0 left-0 bg-[#2C3E2B] text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-br">Cover</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Upload New Image Button */}
                                    {galleryItems.length < 6 && (
                                        <div className="w-24 h-24 shrink-0">
                                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="gallery-upload" />
                                            <label htmlFor="gallery-upload" className="w-full h-full border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:text-[#2C3E2B] hover:border-[#2C3E2B] cursor-pointer transition-colors bg-white">
                                                <Plus className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] font-bold uppercase text-center leading-tight">Add<br/>Image</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3.5 bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors rounded-full text-sm font-bold uppercase tracking-wider">Cancel</button>
                            <button
                                onClick={handleSaveProject}
                                disabled={isUploading}
                                className="flex-[2] flex justify-center items-center px-6 py-3.5 bg-[#2C3E2B] text-white rounded-full text-sm font-bold uppercase tracking-wider hover:bg-opacity-90 disabled:opacity-50 transition-all"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Save Changes" : "Save Portfolio Project")}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}