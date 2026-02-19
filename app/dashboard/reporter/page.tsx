'use client';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Search, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReporterDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [prevNotificationCount, setPrevNotificationCount] = useState(0);
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!loading) {
            const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1 } });

            tl.from(".header-section", {
                y: -20,
                opacity: 0,
            })
                .from(".hero-card", {
                    y: 30,
                    opacity: 0,
                    scale: 0.98,
                }, "-=0.6")
                .from(".stats-tile", {
                    y: 20,
                    opacity: 0,
                    stagger: 0.1,
                }, "-=0.5")
                .from(".report-row", {
                    x: -10,
                    opacity: 0,
                    stagger: 0.05,
                }, "-=0.4");
        }
    }, { scope: container, dependencies: [loading] });

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.play().catch(e => console.log("Audio play blocked by browser:", e));
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(20));

                    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                        setRecentReports(reports);

                        // Calc stats
                        setStats({
                            total: reports.length,
                            pending: reports.filter((r: any) => r.status === 'pending').length,
                            approved: reports.filter((r: any) => r.status === 'approved').length
                        });

                        // Filter for resolved/approved notifications
                        const resolved = reports.filter((r: any) => r.status === 'resolved' || r.status === 'approved');

                        // Sound notification if count increases
                        if (resolved.length > prevNotificationCount && prevNotificationCount !== 0) {
                            playNotificationSound();
                        }

                        setNotifications(resolved);
                        setPrevNotificationCount(resolved.length);

                        setLoading(false);
                    }, (error) => {
                        console.error("Snapshot error:", error);
                        setLoading(false);
                    });
                    return () => unsubscribeSnapshot();
                } catch (e) {
                    console.error("Query setup error:", e);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [prevNotificationCount]);

    const filteredReports = recentReports.filter(report =>
        report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div ref={container} className="min-h-screen bg-[#110F33] text-white p-6 md:p-10 font-sans relative overflow-hidden">
            {/* Background Decorative Rings (Matches Image 2) */}
            <div className="absolute top-[-20%] right-[-10%] w-[80%] aspect-square opacity-20 pointer-events-none">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary">
                    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                {/* Header Section */}
                <div className="header-section flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <span className="w-6 h-0.5 bg-primary rounded-full" />
                            <span className="w-3 h-0.5 bg-primary rounded-full" />
                            <span className="w-1 h-0.5 bg-primary rounded-full" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hi {user?.displayName ? user.displayName.split(' ')[0] : 'Reporter'}</h1>
                        <p className="text-white/50 text-sm mt-1">{stats.pending} reports are pending review</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
                                    <Bell className="w-6 h-6 text-white/70" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[calc(100vw-3rem)] sm:w-80 bg-[#1C1A4A] border-white/10 text-white rounded-2xl shadow-2xl">
                                <DropdownMenuLabel className="p-4 border-b border-white/5 opacity-50 text-xs uppercase tracking-widest">Notifications</DropdownMenuLabel>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {notifications.length > 0 ? (
                                        notifications.map((note) => (
                                            <DropdownMenuItem key={note.id} className="p-3 rounded-xl flex items-start gap-4 focus:bg-white/5">
                                                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white/90">Status Updated</p>
                                                    <p className="text-xs text-white/50 line-clamp-1">{note.description}</p>
                                                    <p className="text-[10px] text-white/30 mt-1">{new Date(note.timestamp).toLocaleDateString()}</p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-white/30 text-xs">No updates yet</div>
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold border border-white/20">
                            {user?.email?.[0].toUpperCase() || 'R'}
                        </div>
                    </div>
                </div>

                {/* Main Prominent Card */}
                <div className="hero-card bg-[#1C1A4A] border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-colors" />

                    <div className="relative space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Latest Highlight</span>
                            <span className="px-3 py-1 bg-primary text-[10px] font-bold rounded-full group-hover:px-4 transition-all">NEW</span>
                        </div>

                        <div>
                            <h2 className="text-xl md:text-2xl font-bold mb-2">Environmental Scan</h2>
                            <p className="text-white/50 leading-relaxed max-w-sm text-sm md:text-base">
                                Track soil erosion patterns and submit real-time reports with AI analysis.
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-[#110F33] border-2 border-[#1C1A4A] flex items-center justify-center text-[10px] font-bold">AI</div>
                                ))}
                            </div>
                            <Link href="/">
                                <Button variant="ghost" className="text-white hover:text-primary p-0 h-auto font-bold flex items-center gap-2 group/btn text-sm md:text-base">
                                    View Analytics
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Activity Overview */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold">Activity Overview</h3>
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Search className="w-4 h-4 text-white/40" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="stats-tile bg-[#2D2A6E] p-6 md:p-8 rounded-[2rem] flex flex-col justify-between h-40 md:h-48 border border-white/5 group hover:bg-primary transition-all duration-500 shadow-xl">
                            <div className="text-4xl md:text-5xl font-bold group-hover:scale-110 transition-transform origin-left">{stats.total}</div>
                            <div className="space-y-1">
                                <p className="text-xs md:text-sm font-bold opacity-100 uppercase tracking-widest">Total</p>
                                <p className="text-[9px] md:text-[10px] opacity-40 group-hover:opacity-80 transition-opacity">Submissions</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                            <div className="stats-tile bg-[#1C1A4A] p-5 md:p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between hover:border-primary/30 transition-colors">
                                <div className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white transition-colors">{stats.pending}</div>
                                <p className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Ongoing</p>
                            </div>
                            <div className="stats-tile bg-[#1C1A4A] p-5 md:p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
                                <div className="text-2xl md:text-3xl font-bold text-emerald-500">{stats.approved}</div>
                                <p className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Reports List */}
                <div className="space-y-6 pt-6">
                    <h3 className="text-lg font-bold px-2">Recent Reports</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <Link href={`/dashboard/report/${report.id}`} key={report.id} className="report-row block group">
                                    <Card className="bg-[#1C1A4A] border-none shadow-none hover:bg-[#23215C] transition-all rounded-[1.5rem] overflow-hidden">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-[#110F33] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:scale-110 transition-transform">
                                                {report.imageUrl ? (
                                                    <img src={report.imageUrl} alt="Scan" className="w-full h-full object-cover opacity-80" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                                        <Search className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white text-base truncate">{report.description}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                                        {new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${report.status === 'approved' ? 'text-emerald-500' :
                                                        report.status === 'pending' ? 'text-primary' :
                                                            'text-white/30'
                                                        }`}>{report.status}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                                <ArrowRight className="w-4 h-4 text-white/20" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                <p className="text-sm text-white/30">No reports found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
