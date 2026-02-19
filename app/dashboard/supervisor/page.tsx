'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Report } from '@/lib/types';
import ReportCard from '@/components/dashboard/ReportCard';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, List as ListIcon, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function SupervisorDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'resolved'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [prevReportCount, setPrevReportCount] = useState(0);
    const router = useRouter();
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!loading) {
            const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1 } });

            tl.from(".stat-card", {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                ease: "back.out(1.7)"
            })
                .from(".filter-bar", {
                    y: 20,
                    opacity: 0,
                    duration: 0.8
                }, "-=0.5")
                .from(".feed-item", {
                    scale: 0.95,
                    opacity: 0,
                    stagger: 0.05,
                    duration: 0.8
                }, "-=0.4");
        }
    }, { scope: container, dependencies: [loading, filterStatus] });

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.play().catch(e => console.log("Audio play blocked by browser:", e));
    };

    useEffect(() => {
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const reportsData = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            })) as Report[];

            // Notification for new report
            if (reportsData.length > prevReportCount && prevReportCount !== 0) {
                playNotificationSound();
            }

            setReports(reportsData);
            setPrevReportCount(reportsData.length);
            setLoading(false);
        }, (error: any) => {
            console.error("Error fetching reports:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [prevReportCount]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/signin');
    };

    const filteredReports = reports.filter(report => {
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        const matchesSearch = report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div ref={container} className="min-h-screen bg-[#F8FAFF] flex flex-col font-sans relative overflow-hidden">
            {/* Background Architectural Elements */}
            <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-white/40 -skew-x-12 translate-x-1/2 -z-10" />
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-white to-transparent -z-10" />

            {/* Top Navigation Bar */}
            <header className="px-6 md:px-16 py-6 md:py-8 flex flex-col sm:flex-row justify-between items-center z-30 gap-6 sm:gap-0">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="group relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-[1.2rem] md:rounded-[1.5rem] blur-xl group-hover:bg-primary/30 transition-all" />
                        <div className="relative w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 transform group-hover:rotate-[10deg] transition-all">
                            <LayoutGrid className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1A1C3D]">Command Center</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Supervisor Status: Online</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 md:gap-6">
                    <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Filter className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500">Live Environmental Feed</p>
                    </div>

                    <div className="flex items-center gap-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-200 ml-auto sm:ml-0">
                        <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105 active:scale-95 group">
                            <LogOut className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 md:px-16 pb-24 z-20 max-w-[1600px]">
                {/* Stats & Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="stat-card bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Ongoing Reports</p>
                            <div className="text-4xl md:text-5xl font-black text-[#1A1C3D]">{reports.filter(r => r.status === 'pending').length}</div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+2 Today</span>
                            </div>
                        </div>
                        <div className="stat-card bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Total Verified</p>
                            <div className="text-4xl md:text-5xl font-black text-[#1A1C3D]">{reports.filter(r => r.status === 'approved').length}</div>
                            <div className="flex items-center gap-2 mt-4 text-slate-400">
                                <span className="text-[10px] font-bold">Updated Just Now</span>
                            </div>
                        </div>
                        <div className="stat-card bg-[#1A1C3D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Action Accuracy</p>
                            <div className="text-4xl md:text-5xl font-black text-white">98.4%</div>
                            <p className="text-[10px] font-bold text-primary mt-4 uppercase tracking-widest">Efficiency Goal Reached</p>
                        </div>
                    </div>

                    <div className="stat-card bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] md:rounded-[2.5rem] border border-white/60 shadow-xl flex flex-col justify-between group hover:bg-white/60 transition-all">
                        <div>
                            <p className="text-[10px] font-bold text-[#1A1C3D]/40 uppercase tracking-[0.2em] mb-4">Environment Trend</p>
                            <div className="h-20 flex items-end gap-1.5 px-2">
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all" />
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-primary uppercase text-center mt-4">Growth +12.4%</p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="filter-bar sticky top-8 z-40 mb-12 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search report database or enter document ID..."
                            className="pl-14 h-16 bg-white border-transparent shadow-2xl shadow-slate-200/50 rounded-3xl focus-visible:ring-primary text-base placeholder:text-slate-300 transition-all focus:scale-[1.01]"
                        />
                    </div>

                    <div className="flex gap-2 bg-white p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-x-auto max-w-full">
                        {(['all', 'pending', 'reviewed', 'approved', 'resolved'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black transition-all capitalize whitespace-nowrap tracking-[0.1em]",
                                    filterStatus === status
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                        : "text-slate-400 hover:text-primary hover:bg-slate-50"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:flex bg-white p-2 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-50 gap-1">
                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-indigo-50 text-primary" : "text-slate-300 hover:text-slate-500")}>
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-indigo-50 text-primary" : "text-slate-300 hover:text-slate-500")}>
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-8 relative">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-[#1A1C3D] flex items-center gap-4">
                            Operational Feed
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black">LIVE</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96 gap-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Database...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-xl shadow-slate-100/50 group">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1C3D] mb-2 font-sans tracking-tight">Zero Matches Found</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">Adjust your filter parameters or search query to explore the report logs.</p>
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-8",
                            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredReports.map(report => (
                                <div key={report.id} className="feed-item transition-all hover:-translate-y-2">
                                    <ReportCard report={report} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
