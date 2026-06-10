'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Define the exact shape of your live Projects
export interface Project {
    id: string;
    name: string;
    type: string;
    location: string;
    date: string;
    coverImage: string;
}

// We dynamically added 'Landscaping' to cover projects without a specific type
const typeFilters = ['All', 'Residential', 'Commercial', 'Garden Design', 'Maintenance', 'Landscaping'];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    // --- FETCH LIVE PROJECTS ---
    useEffect(() => {
        async function fetchProjects() {
            try {
                const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const fetchedProjects = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        location: data.location,
                        date: data.date,
                        coverImage: data.coverImage,
                        // Fallback type if you didn't set one in the admin panel
                        type: data.type || 'Landscaping'
                    } as Project;
                });

                setProjects(fetchedProjects);
            } catch (error) {
                console.error("Failed to fetch portfolio projects:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const filtered = activeFilter === 'All'
        ? projects
        : projects.filter((p) => p.type === activeFilter);

    return (
        <div className="min-h-screen bg-[#FAF9F6]">

            {/* Hero Banner */}
            <div className="relative h-56 sm:h-[400px] overflow-hidden bg-[#2C3E2B]">
                <img
                    src="https://images.unsplash.com/photo-1558618047-3c6dfa4c62b4?w=1600&h=800&fit=crop&auto=format"
                    alt="Thurulya Gardens Landscaping projects portfolio"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center pt-12">
                    <div className="text-center">
                        <p className="text-white/80 mb-3 tracking-widest uppercase text-xs font-bold drop-shadow-md">Our Portfolio</p>
                        <h1 className="text-white font-serif text-4xl sm:text-6xl tracking-wide drop-shadow-lg">
                            Landscaping Masterpieces
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-12">
                    {typeFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-6 py-2.5 rounded-full border transition-all text-sm font-semibold tracking-wide ${
                                activeFilter === f
                                    ? 'bg-[#2C3E2B] text-white border-[#2C3E2B] shadow-md'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#2C3E2B]/40 hover:text-[#2C3E2B]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#2C3E2B]">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-sm font-bold uppercase tracking-wider">Loading Portfolio...</p>
                    </div>
                ) : (
                    <>
                        {/* Portfolio Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {filtered.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 block text-left flex flex-col h-full"
                                >
                                    {/* Cover Image Container */}
                                    <div className="relative overflow-hidden aspect-[4/3] bg-stone-100 shrink-0">
                                        <img
                                            src={project.coverImage}
                                            alt={project.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

                                        {/* Category Badge */}
                                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-[#D97706] text-white">
                                            {project.type}
                                        </span>
                                    </div>

                                    {/* Project Details */}
                                    <div className="p-6 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="mb-3 font-serif text-xl text-[#2C3E2B] group-hover:text-[#D97706] transition-colors line-clamp-2">
                                                {project.name}
                                            </h3>
                                            <div className="flex flex-col gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider mb-6">
                                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" />{project.location}</span>
                                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" />{project.date}</span>
                                            </div>
                                        </div>

                                        {/* Call to Action */}
                                        <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[#2C3E2B] text-sm font-bold tracking-wider uppercase group-hover:gap-3 transition-all">
                                                View Gallery <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Empty State (If a filter has no results) */}
                        {filtered.length === 0 && (
                            <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-stone-200 mt-8">
                                <p className="text-stone-500 font-medium text-lg">No projects found in this category yet.</p>
                                <button
                                    onClick={() => setActiveFilter('All')}
                                    className="mt-4 text-[#D97706] font-semibold underline underline-offset-4 hover:text-[#b46205]"
                                >
                                    View all projects
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer CTA Section */}
            <section className="py-24 bg-stone-100 border-t border-stone-200">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="mb-4 font-serif text-3xl sm:text-4xl text-[#2C3E2B] tracking-wide">
                        Ready to Transform Your Space?
                    </h2>
                    <p className="text-stone-600 mb-10 text-sm sm:text-base font-medium leading-relaxed">
                        From intimate residential courtyards to sweeping commercial estate designs, our team of expert Sri Lankan landscapers is ready to bring your tropical vision to life.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-all hover:gap-4 text-sm font-bold tracking-wider uppercase shadow-lg"
                    >
                        Get a Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}