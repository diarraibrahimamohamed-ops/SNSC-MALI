'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfilPage() {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    
    return (
        <div className="space-y-8 animate-fade-in p-6 relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight"> Profil </h1>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">

                <label className="block text-sm font-bold text-slate-700 mb-2"></label>
            </div>
        </div>
    );
}
