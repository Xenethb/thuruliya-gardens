'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { sendTelegramNotification } from '@/lib/telegram'; // IMPORT ADDED

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    // Added 'whatsapp' to the state
    const [form, setForm] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        type: 'landscaping',
        message: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // 1. Format the Telegram Message
        const contactMessage = `
🌱 <b>NEW ENQUIRY: ${form.type.toUpperCase()}</b> 🌱

<b>Name:</b> ${form.name}
<b>Phone:</b> ${form.phone}
<b>WhatsApp:</b> ${form.whatsapp}
<b>Email:</b> ${form.email}

<b>Message:</b> 
${form.message}
        `;

        // 2. Send to Telegram (Pass the WhatsApp number to create the button)
        await sendTelegramNotification(contactMessage, form.whatsapp);

        // 3. Show Success Screen
        setSubmitted(true);
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6]">

            {/* Hero Banner */}
            <div className="relative h-56 sm:h-[400px] overflow-hidden bg-[#2C3E2B]">
                <img
                    src="https://images.unsplash.com/photo-1567891898952-a7e22827a48b?w=1600&h=800&fit=crop&auto=format"
                    alt="Contact Thuruliya Gardens"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center pt-12">
                    <div className="text-center">
                        <p className="text-white/80 mb-3 tracking-widest uppercase text-xs font-bold drop-shadow-md">Get in Touch</p>
                        <h1 className="text-white font-serif text-4xl sm:text-6xl tracking-wide drop-shadow-lg">
                            Contact Us
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Left Column: Contact Information */}
                    <div>
                        <p className="text-gray-500 mb-2 tracking-widest uppercase text-xs font-bold">Reach Out</p>
                        <h2 className="mb-6 font-serif text-3xl sm:text-4xl text-[#2C3E2B] tracking-wide">
                            We&apos;d Love to Hear From You
                        </h2>
                        <p className="text-gray-600 mb-10 text-sm sm:text-base font-light leading-relaxed">
                            Whether you&apos;re looking for a specific rare plant, planning a massive landscaping project, or just want some simple gardening advice — our team of experts is here to help.
                        </p>

                        <ul className="space-y-6 mb-12">
                            {[
                                { icon: <MapPin className="w-5 h-5" />, label: 'Address', value: '1119/d Dhammodaya Mw., Battaramulla 10120 / Hokandara' },
                                { icon: <Phone className="w-5 h-5" />, label: 'Phone & WhatsApp', value: '+94 76 345 5267' },
                                { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'thuruliyagardenslk@gmail.com' },
                                { icon: <Clock className="w-5 h-5" />, label: 'Opening Hours', value: 'Mon–Sat 8am–6pm · Sun 9am–3pm' },
                            ].map((item) => (
                                <li key={item.label} className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-[#2C3E2B] shrink-0 shadow-sm border border-gray-100">
                                        {item.icon}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">{item.label}</p>
                                        <p className="text-gray-800 text-sm font-medium mt-0.5">{item.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Clean Google Maps Embed (No Donate Button, Correct Location) */}
                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 300 }}>
                            <iframe
                                src="https://maps.google.com/maps?q=1119/d%20Dhammodaya%20Mw.,%20Battaramulla%2010120%20/%20Hokandara&t=&z=14&ie=UTF8&iwloc=&output=embed"
                                className="w-full h-full border-0"
                                title="Thuruliya Gardens Location"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div>
                        {submitted ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center h-full flex flex-col items-center justify-center shadow-sm">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="mb-3 font-serif text-3xl text-[#2C3E2B]">Message Sent!</h2>
                                <p className="text-gray-600 font-light">Thank you for reaching out. One of our experts will get back to you shortly.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-8 text-sm text-[#D97706] hover:text-[#b46205] font-semibold underline underline-offset-4"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-sm">
                                <h3 className="mb-8 font-serif text-2xl text-[#2C3E2B] border-b border-gray-100 pb-4">
                                    Send a Message
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Amara Perera"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                placeholder="077 123 4567"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">WhatsApp</label>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                placeholder="077 123 4567"
                                                value={form.whatsapp}
                                                onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="amara@example.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Enquiry Type</label>
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800 cursor-pointer"
                                        >
                                            <option value="landscaping">Landscaping Project</option>
                                            <option value="plants">Plant Order / Query</option>
                                            <option value="maintenance">Garden Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Tell us about your project or question…"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 focus:border-[#2C3E2B]/50 transition-all text-sm text-gray-800 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-[#2C3E2B] text-white rounded-full hover:bg-opacity-90 transition-colors text-sm font-bold uppercase tracking-wider shadow-md mt-4"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}



