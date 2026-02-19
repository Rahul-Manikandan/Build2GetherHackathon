'use client';
import { useState } from 'react';
import { signUp, signInWithGoogle } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export default function SignUp() {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

        tl.from(".auth-header > *", {
            y: 40,
            opacity: 0,
            stagger: 0.1,
        })
            .from(".auth-card", {
                scale: 0.95,
                opacity: 0,
                duration: 1,
            }, "-=0.8")
            .from(".auth-footer", {
                y: 10,
                opacity: 0,
            }, "-=0.4");
    }, { scope: container });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'reporter' | 'supervisor'>('reporter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signUp(email, password, name, role);
            // Success! Ask user to sign in
            alert('Account created successfully! Please sign in.');
            router.push('/signin');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            router.push('/dashboard/reporter');
        } catch (err: any) {
            setError('Google Sign-In failed. Please try again.');
            console.error(err);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div ref={container} className="flex flex-col min-h-screen bg-[#F8FAFF] relative overflow-hidden font-sans">
            {/* Geometric Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square opacity-[0.03] pointer-events-none">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary">
                    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            </div>

            <div className="p-8 z-10">
                <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
            </div>

            <main className="flex-1 flex items-center justify-center p-6 z-10">
                <div className="w-full max-w-md space-y-10">
                    <div className="auth-header text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-indigo-50 text-primary mb-2 shadow-inner">
                            <span className="text-2xl">🌱</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-[#1A1C3D]">TerraLog</h1>
                        <p className="text-slate-400 font-medium">Join the community mission today</p>
                    </div>

                    <div className="auth-card bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50 relative">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity</label>
                                <Input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-primary/10 rounded-2xl transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-primary/10 rounded-2xl transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Secure Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-primary/10 rounded-2xl transition-all"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Identify As...</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('reporter')}
                                        className={cn(
                                            "h-14 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                                            role === 'reporter'
                                                ? "border-primary bg-indigo-50 text-primary shadow-lg shadow-primary/5"
                                                : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-100"
                                        )}
                                    >
                                        Reporter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('supervisor')}
                                        className={cn(
                                            "h-14 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                                            role === 'supervisor'
                                                ? "border-primary bg-indigo-50 text-primary shadow-lg shadow-primary/5"
                                                : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-100"
                                        )}
                                    >
                                        Supervisor
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 italic">
                                    {error}
                                </p>
                            )}

                            <div className="space-y-4">
                                <Button size="lg" type="submit" className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 group overflow-hidden relative" disabled={loading || googleLoading}>
                                    {loading ? 'Creating Profile...' : 'Begin Journey'}
                                    {!loading && <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                        <span className="bg-[#F8FAFF] px-4 text-slate-300">Fast sign up</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleSignIn}
                                    disabled={loading || googleLoading}
                                    className="w-full h-14 rounded-2xl border-slate-100 flex items-center justify-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                    </svg>
                                    {googleLoading ? 'Connecting...' : 'Google Account'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <p className="auth-footer text-center text-sm font-bold text-slate-400">
                        Member already? <Link href="/signin" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest text-xs ml-2">Sign In Back</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
