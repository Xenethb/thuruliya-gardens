'use client';

import { useState, useEffect } from "react";
import { Plus, GripVertical, Edit, Trash2, Loader2, Upload } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast, Toaster } from "sonner";

// FIREBASE & CLOUDINARY
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, setDoc, query, orderBy } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// --- TYPES ---
interface Slide {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
    active: boolean;
    order: number;
}

interface Section {
    id: string;
    label: string;
    active: boolean;
    order: number;
}

// Default layout if database is empty
const defaultSections: Section[] = [
    { id: "categories", label: "Browse By Category", active: true, order: 0 },
    { id: "featured_products", label: "Featured Products", active: true, order: 1 },
    { id: "portfolio", label: "Landscaping Portfolio", active: true, order: 2 },
    { id: "promise", label: "The Thurulya Promise (Why Us)", active: true, order: 3 },
    { id: "testimonials", label: "Client Testimonials", active: true, order: 4 },
];

// --- DRAGGABLE SLIDE COMPONENT ---
function DraggableSlide({ slide, index, moveSlide, onDelete, onToggle }: {
    slide: Slide; index: number; moveSlide: (from: number, to: number) => void;
    onDelete: (id: string) => void; onToggle: (id: string, active: boolean) => void
}) {
    const [{ isDragging }, drag] = useDrag({
        type: "slide",
        item: { index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: "slide",
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveSlide(item.index, index);
                item.index = index;
            }
        },
    });

    return (
        <div ref={(node) => { drag(node); drop(node); }} className={`${isDragging ? "opacity-50" : ""} mb-4`}>
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <button className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 mt-2">
                    <GripVertical className="w-5 h-5" />
                </button>
                <img src={slide.image} alt={slide.title} className="w-24 h-16 rounded-lg object-cover border border-stone-100" />
                <div className="flex-1">
                    <h3 className="font-bold text-stone-800">{slide.title}</h3>
                    <p className="text-sm text-stone-500 mb-2">{slide.subtitle}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-1 rounded">
                        Link: {slide.buttonLink} ({slide.buttonText})
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Switch.Root
                        checked={slide.active}
                        onCheckedChange={(val) => onToggle(slide.id, val)}
                        className="w-11 h-6 bg-stone-200 rounded-full data-[state=checked]:bg-[#2C3E2B] transition-colors outline-none cursor-pointer"
                    >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                    </Switch.Root>
                    <button onClick={() => onDelete(slide.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}

// --- DRAGGABLE SECTION COMPONENT ---
function DraggableSection({ section, index, moveSection, onToggle }: {
    section: Section; index: number; moveSection: (from: number, to: number) => void;
    onToggle: (id: string, active: boolean) => void
}) {
    const [{ isDragging }, drag] = useDrag({
        type: "section",
        item: { index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    const [, drop] = useDrop({
        accept: "section",
        hover: (item: { index: number }) => {
            if (item.index !== index) {
                moveSection(item.index, index);
                item.index = index;
            }
        },
    });

    return (
        <div ref={(node) => { drag(node); drop(node); }} className={`${isDragging ? "opacity-50" : ""} mb-3`}>
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <button className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500">
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-stone-800 text-sm tracking-wide">{section.label}</span>
                </div>
                <Switch.Root
                    checked={section.active}
                    onCheckedChange={(val) => onToggle(section.id, val)}
                    className="w-11 h-6 bg-stone-200 rounded-full data-[state=checked]:bg-[#2C3E2B] transition-colors outline-none cursor-pointer"
                >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5 shadow-sm" />
                </Switch.Root>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function HomepageContentPage() {
    // States
    const [slides, setSlides] = useState<Slide[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Modal States
    const [showAddSlide, setShowAddSlide] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({ title: "", subtitle: "", buttonText: "", buttonLink: "" });

    // 1. FETCH DATA ON LOAD
    useEffect(() => {
        async function fetchHomepageData() {
            try {
                // Fetch Slides
                const q = query(collection(db, "homepage_slides"), orderBy("order", "asc"));
                const slideSnap = await getDocs(q);
                setSlides(slideSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide)));

                // Fetch Sections Configuration
                const docSnap = await getDocs(collection(db, "settings"));
                const settingsDoc = docSnap.docs.find(d => d.id === "homepage_layout");

                if (settingsDoc && settingsDoc.data().sections) {
                    setSections(settingsDoc.data().sections);
                } else {
                    setSections(defaultSections); // Use default if no config exists yet
                }
            } catch (error) {
                console.error("Error fetching homepage settings:", error);
            } finally {
                setIsLoadingData(false);
            }
        }
        fetchHomepageData();
    }, []);

    // --- SLIDE LOGIC ---
    const handleSaveSlide = async () => {
        if (!selectedFile || !formData.title) {
            toast.error("An image and a title are required.");
            return;
        }

        setIsUploading(true);
        try {
            const imageUrl = await uploadImageToCloudinary(selectedFile);

            const newSlide = {
                ...formData,
                image: imageUrl,
                active: true,
                order: slides.length // Add to bottom
            };

            const docRef = await addDoc(collection(db, "homepage_slides"), newSlide);
            setSlides([...slides, { id: docRef.id, ...newSlide }]);

            toast.success("Slide added successfully");
            setShowAddSlide(false);
            setFormData({ title: "", subtitle: "", buttonText: "", buttonLink: "" });
            setSelectedFile(null);
        } catch (error) {
            toast.error("Failed to add slide");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteSlide = async (id: string) => {
        if (!confirm("Delete this slide?")) return;
        await deleteDoc(doc(db, "homepage_slides", id));
        setSlides(slides.filter(s => s.id !== id));
        toast.success("Slide deleted");
    };

    const handleToggleSlide = async (id: string, active: boolean) => {
        await updateDoc(doc(db, "homepage_slides", id), { active });
        setSlides(slides.map(s => s.id === id ? { ...s, active } : s));
    };

    const saveSlideOrderToDB = async (reorderedSlides: Slide[]) => {
        // Update DB in background
        reorderedSlides.forEach((slide, index) => {
            updateDoc(doc(db, "homepage_slides", slide.id), { order: index });
        });
        toast.success("Slide order saved");
    };

    const moveSlide = (from: number, to: number) => {
        const updated = [...slides];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setSlides(updated);
        saveSlideOrderToDB(updated);
    };

    // --- SECTION LOGIC ---
    const saveSectionLayoutToDB = async (updatedSections: Section[]) => {
        try {
            await setDoc(doc(db, "settings", "homepage_layout"), { sections: updatedSections });
            toast.success("Homepage layout updated live!");
        } catch (error) {
            toast.error("Failed to save layout.");
        }
    };

    const moveSection = (from: number, to: number) => {
        const updated = [...sections];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        // Reassign order numbers
        const finalUpdated = updated.map((s, idx) => ({ ...s, order: idx }));
        setSections(finalUpdated);
        saveSectionLayoutToDB(finalUpdated);
    };

    const toggleSection = (id: string, active: boolean) => {
        const updated = sections.map(s => s.id === id ? { ...s, active } : s);
        setSections(updated);
        saveSectionLayoutToDB(updated);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Toaster position="top-right" richColors />

            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-serif text-[#2C3E2B] mb-2">Homepage Content</h1>
                <p className="text-stone-500 text-sm">Update your hero sliders and manage section visibility.</p>
            </div>

            {isLoadingData ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2C3E2B]" /></div>
            ) : (
                <Tabs.Root defaultValue="slider" className="w-full">
                    <Tabs.List className="flex gap-2 border-b border-stone-200 mb-6">
                        <Tabs.Trigger value="slider" className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 data-[state=active]:text-[#2C3E2B] data-[state=active]:border-b-2 data-[state=active]:border-[#2C3E2B]">
                            Hero Slider
                        </Tabs.Trigger>
                        <Tabs.Trigger value="sections" className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-stone-500 data-[state=active]:text-[#2C3E2B] data-[state=active]:border-b-2 data-[state=active]:border-[#2C3E2B]">
                            Homepage Sections
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* SLIDES TAB */}
                    <Tabs.Content value="slider">
                        <div className="mb-6 flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <p className="text-sm text-amber-800">
                                <strong className="font-bold uppercase tracking-wider text-xs mr-2">Tip:</strong>
                                Drag and drop to reorder. The top slide appears first!
                            </p>
                            <button onClick={() => setShowAddSlide(true)} className="px-6 py-2.5 bg-[#2C3E2B] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all flex items-center gap-2">
                                <Plus className="w-4 h-4"/> Add Slide
                            </button>
                        </div>

                        {slides.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl text-stone-500">No slides added yet.</div>
                        ) : (
                            <DndProvider backend={HTML5Backend}>
                                {slides.map((slide, index) => (
                                    <DraggableSlide key={slide.id} slide={slide} index={index} moveSlide={moveSlide} onDelete={handleDeleteSlide} onToggle={handleToggleSlide} />
                                ))}
                            </DndProvider>
                        )}
                    </Tabs.Content>

                    {/* SECTIONS TAB */}
                    <Tabs.Content value="sections">
                        <div className="mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
                            <p className="text-sm text-stone-600 mb-2">
                                <strong className="font-bold uppercase tracking-wider text-xs text-stone-800 block mb-1">Layout Manager</strong>
                                Drag these sections up or down to change exactly how they appear on your website homepage. Turn off the toggle to hide a section completely.
                            </p>
                            <p className="text-xs text-stone-400 italic">Note: The Hero Slider is always pinned to the top, and Contact Info is pinned to the bottom.</p>
                        </div>

                        <DndProvider backend={HTML5Backend}>
                            {sections.map((section, index) => (
                                <DraggableSection key={section.id} section={section} index={index} moveSection={moveSection} onToggle={toggleSection} />
                            ))}
                        </DndProvider>
                    </Tabs.Content>
                </Tabs.Root>
            )}

            {/* Add Slide Modal */}
            <Dialog.Root open={showAddSlide} onOpenChange={setShowAddSlide}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg z-50 focus:outline-none">
                        <Dialog.Title className="text-xl font-serif text-[#2C3E2B] mb-6">Add Hero Slide</Dialog.Title>
                        <Dialog.Description className="sr-only">Add a new image to the hero carousel.</Dialog.Description>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Headline (e.g. Discover Rare Plants)"
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="Subtitle description..."
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Button Text (e.g. Shop Now)"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Button Link (e.g. /products)"
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-[#2C3E2B]/20"
                                    onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                                />
                            </div>

                            <input type="file" accept="image/*" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden" id="slide-upload" />
                            <label htmlFor="slide-upload" className="h-32 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-500 text-sm cursor-pointer hover:border-[#2C3E2B]">
                                {selectedFile ? (
                                    <span className="font-bold text-stone-800">{selectedFile.name}</span>
                                ) : (
                                    <span className="flex flex-col items-center gap-2"><Upload className="w-5 h-5"/> Upload Banner Image</span>
                                )}
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowAddSlide(false)} className="flex-1 py-3 bg-stone-100 rounded-full font-bold uppercase text-xs text-stone-600">Cancel</button>
                                <button onClick={handleSaveSlide} disabled={isUploading} className="flex-[2] flex justify-center py-3 bg-[#2C3E2B] text-white rounded-full font-bold uppercase text-xs tracking-wider hover:bg-opacity-90 disabled:opacity-50">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Slide to Live Site"}
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}