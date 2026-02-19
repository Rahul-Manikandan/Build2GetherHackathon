'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    // Hide BottomNav on the Camera page to prevent confusion
    if (pathname?.endsWith('/camera')) {
        return null;
    }

    return (
        <div className="fixed bottom-0 md:bottom-8 left-0 right-0 md:left-1/2 md:-translate-x-1/2 bg-[#1C1A4A]/80 backdrop-blur-xl border-t md:border border-white/10 px-8 py-4 flex justify-between items-center z-50 md:w-[460px] md:rounded-[2.5rem] shadow-2xl shadow-black/50">
            <Link
                href="/dashboard/reporter"
                className={cn(
                    "flex flex-col items-center gap-1 transition-all duration-300",
                    isActive('/dashboard/reporter') ? "text-primary scale-110" : "text-white/40 hover:text-white/70"
                )}
            >
                <div className={cn("p-2 rounded-2xl transition-colors", isActive('/dashboard/reporter') && "bg-primary/20 text-primary")}>
                    <Home className="w-6 h-6" />
                </div>
            </Link>

            <div className="relative -top-6">
                <Link href="/dashboard/reporter/camera">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-500 rounded-full shadow-[0_0_25px_rgba(76,73,237,0.4)] flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-[0_0_35px_rgba(76,73,237,0.6)] active:scale-95 border-4 border-[#110F33]">
                        <Camera className="w-8 h-8" />
                    </div>
                </Link>
            </div>

            <Link
                href="/dashboard/profile"
                className={cn(
                    "flex flex-col items-center gap-1 transition-all duration-300",
                    isActive('/dashboard/profile') ? "text-primary scale-110" : "text-white/40 hover:text-white/70"
                )}
            >
                <div className={cn("p-2 rounded-2xl transition-colors", isActive('/dashboard/profile') && "bg-primary/20 text-primary")}>
                    <User className="w-6 h-6" />
                </div>
            </Link>
        </div>
    );
}
