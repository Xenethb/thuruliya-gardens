'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Leaf, Lock } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Set a session cookie that expires in 1 day
            document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Strict";
            // If successful, send them to the secret dashboard!
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">

                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#2C3E2B] rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-serif text-2xl text-[#2C3E2B]">Thurulya Workspace</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Authorized Personnel Only</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-gray-800"
                            placeholder="admin@thurulyagardens.com"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 transition-all text-sm text-gray-800"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-4 bg-[#2C3E2B] text-white rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider shadow-md disabled:opacity-70"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                <Lock className="w-4 h-4" /> Secure Login
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}