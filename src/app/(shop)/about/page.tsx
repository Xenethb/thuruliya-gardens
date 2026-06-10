import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

const team = [
    { name: 'Rajith Jayasuriya', role: 'Founder & Head Landscaper', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format' },
    { name: 'Nishani Bandara', role: 'Lead Horticulturist', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&auto=format' },
    { name: 'Chaminda Perera', role: 'Nursery Manager', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6]">

            {/* Hero Banner */}
            <div className="relative h-64 sm:h-[450px] overflow-hidden bg-[#2C3E2B]">
                <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=600&fit=crop&auto=format"
                    alt="About Thurulya Gardens"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center pt-12">
                    <div className="text-center">
                        <p className="text-white/80 mb-3 tracking-widest uppercase text-xs font-bold drop-shadow-md">Our Heritage</p>
                        <h1 className="text-white font-serif text-4xl sm:text-6xl tracking-wide drop-shadow-lg">
                            About Thurulya Gardens
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-20">

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
                    <div>
                        <p className="text-gray-400 mb-2 tracking-widest uppercase text-xs font-bold">Our Story</p>
                        <h2 className="mb-6 font-serif text-3xl sm:text-4xl text-[#2C3E2B] leading-tight">
                            Rooted in Sri Lanka <br/> Since 2009
                        </h2>
                        <div className="space-y-4 text-gray-600 font-light leading-relaxed text-sm sm:text-base">
                            <p>
                                Thurulya Gardens started as a humble nursery in Colombo 3, founded with a simple but powerful belief: everyone deserves access to premium tropical plants and beautifully crafted outdoor spaces.
                            </p>
                            <p>
                                Over the past 15 years, we&apos;ve grown into Sri Lanka&apos;s most trusted luxury landscaping and plant nursery destination. We have successfully designed and completed over 400 projects islandwide, from intimate villa courtyards to sprawling commercial estates.
                            </p>
                            <p>
                                We proudly cultivate the vast majority of our exotic inventory in our own private 2-acre nursery in Kelaniya. This allows our expert horticulturists to guarantee unparalleled health and quality from the moment a seed is planted to the day it arrives at your doorstep.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-gray-100">
                        <img
                            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&auto=format"
                            alt="Inside the Thurulya Gardens nursery"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-24">
                    {[
                        { value: '15+', label: 'Years Experience' },
                        { value: '400+', label: 'Projects Completed' },
                        { value: '2,000+', label: 'Plants Sold Monthly' },
                        { value: '25', label: 'Expert Team Members' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                            <p className="font-serif text-3xl sm:text-4xl text-[#D97706] mb-2">{stat.value}</p>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Team Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <p className="text-gray-400 mb-2 tracking-widest uppercase text-xs font-bold">Meet the Team</p>
                        <h2 className="font-serif text-3xl sm:text-4xl text-[#2C3E2B]">
                            The People Behind The Green
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                        {team.map((member) => (
                            <div key={member.name} className="text-center group">
                                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-5 border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-serif text-xl text-[#2C3E2B] mb-1">{member.name}</h3>
                                <p className="text-[#D97706] text-xs font-bold uppercase tracking-wider">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="bg-[#2C3E2B] text-white rounded-3xl p-10 sm:p-16 text-center shadow-xl relative overflow-hidden">
                    {/* Subtle background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-5 pointer-events-none">
                        <Leaf className="w-64 h-64" />
                    </div>

                    <div className="relative z-10">
                        <Leaf className="w-10 h-10 mx-auto mb-6 text-[#D97706]" />
                        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
                            Let&apos;s Create Something Beautiful
                        </h2>
                        <p className="mb-10 text-white/70 font-light text-sm sm:text-base max-w-lg mx-auto">
                            Whether it&apos;s bringing a single rare monstera into your living room or orchestrating a full luxury garden transformation.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/contact"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#D97706] text-white hover:bg-[#b46205] transition-colors text-sm font-bold uppercase tracking-wider shadow-md"
                            >
                                Get in Touch <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/products"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                Shop Plants
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}