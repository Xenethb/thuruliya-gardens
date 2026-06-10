'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ChevronLeft, ChevronRight, Phone, CheckCircle, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- STRICT TYPING ---
interface Project {
    id: string;
    name: string;
    type?: string;
    location: string;
    date: string;
    coverImage: string;
    gallery?: string[];
    description: string;
    services?: string[];
    status?: string;
}

// Next.js App Router props
interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;

    // State Management
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);

    // --- FETCH LIVE DATA ---
    useEffect(() => {
        async function fetchProjectData() {
            setIsLoading(true);
            try {
                const docRef = doc(db, "projects", projectId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as Project);
                } else {
                    console.log("No such project found!");
                }
            } catch (error) {
                console.error("Error fetching project:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjectData();
    }, [projectId]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-[#2C3E2B]">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-bold tracking-wider uppercase text-sm">Loading Project Details...</p>
            </div>
        );
    }

    // Not Found State
    if (!project) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-3xl font-serif text-[#2C3E2B] mb-4">Project Not Found</h1>
                <p className="text-stone-500 mb-8">We couldn't find the project you were looking for.</p>
                <Link href="/projects" className="px-8 py-3 bg-[#2C3E2B] text-white rounded-full text-sm font-bold uppercase tracking-wider">
                    Back to Portfolio
                </Link>
            </div>
        );
    }

    // Prepare gallery array: Ensure it exists and defaults to cover image if empty
    const images = project.gallery && project.gallery.length > 0
        ? project.gallery
        : [project.coverImage];

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-stone-400 mb-8 text-xs font-bold uppercase tracking-wider">
                    <Link href="/" className="hover:text-[#2C3E2B] transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/projects" className="hover:text-[#2C3E2B] transition-colors">Projects</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#2C3E2B] truncate">{project.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

                    {/* Left Column: Interactive Gallery */}
                    <div className="lg:col-span-3">
                        <div className="relative rounded-2xl overflow-hidden mb-4 bg-stone-100 shadow-sm aspect-video sm:aspect-[4/3]">
                            <img
                                src={images[activeImg]}
                                alt={`${project.name} - image ${activeImg + 1}`}
                                className="w-full h-full object-cover transition-opacity duration-500"
                            />

                            {/* Gallery Counter */}
                            {images.length > 1 && (
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white rounded-full px-3 py-1.5 text-xs font-bold tracking-wider">
                                    <ImageIcon className="w-3.5 h-3.5" /> {activeImg + 1} / {images.length}
                                </div>
                            )}

                            {/* Image Navigation Arrows (Only show if multiple images exist) */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors text-stone-700"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors text-stone-700"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`w-20 h-14 sm:w-24 sm:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all opacity-80 hover:opacity-100 ${
                                            i === activeImg ? 'border-[#2C3E2B] opacity-100' : 'border-transparent'
                                        }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Project Information */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D97706] text-white shadow-sm">
                                {project.status || "Completed"}
                            </span>
                        </div>

                        <h1 className="mb-5 font-serif text-3xl sm:text-4xl text-[#2C3E2B] leading-tight">
                            {project.name}
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-stone-500 mb-8 text-xs font-bold uppercase tracking-wider border-b border-stone-200/60 pb-6">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" />{project.location}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" />{project.date}</span>
                        </div>

                        <p className="text-stone-600 mb-8 leading-relaxed font-light text-sm sm:text-base whitespace-pre-wrap">
                            {project.description}
                        </p>

                        {/* CONDITIONAL: Services Provided Card */}
                        {project.services && project.services.length > 0 && (
                            <div className="bg-white border border-stone-100 rounded-2xl p-6 mb-8 shadow-sm">
                                <h3 className="mb-4 font-serif text-lg text-[#2C3E2B]">Services Provided</h3>
                                <ul className="space-y-3">
                                    {project.services.map((s) => (
                                        <li key={s} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="text-stone-700 text-sm font-medium">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA */}
                        <a
                            href={`https://wa.me/94112345678?text=Hi, I am interested in landscaping services similar to your ${encodeURIComponent(project.name)} project.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-4 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-all hover:gap-3 text-sm font-bold uppercase tracking-wider shadow-md"
                        >
                            <Phone className="w-4 h-4" /> Enquire About This Project <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}