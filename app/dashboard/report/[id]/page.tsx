'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, Shield, AlertCircle, Activity, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'reports', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReport({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h1>
                <p className="text-slate-500 mb-6 text-center">The report you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => router.back()} variant="default" className="rounded-xl px-8">
                    Go Back
                </Button>
            </div>
        );
    }

    const { analysis } = report;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 font-sans pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm border border-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Report Details</h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">ID: {report.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Image and Location */}
                <div className="space-y-6">
                    <div className="relative aspect-square md:aspect-auto md:h-[400px] w-full bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 group">
                        {report.imageUrl ? (
                            <img src={report.imageUrl} alt="Erosion Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <AlertCircle className="w-12 h-12 opacity-20" />
                                <span className="font-bold uppercase tracking-widest text-xs">No image provided</span>
                            </div>
                        )}
                        <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                                {report.status}
                            </span>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location Coordinates</p>
                                    <p className="text-sm font-bold text-slate-700 font-mono">
                                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                </a>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reported On</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(report.timestamp).toLocaleString(undefined, {
                                            dateStyle: 'full',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Description and Analysis */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Problem Description</h2>
                        <p className="text-slate-800 text-lg leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                            {report.description}
                        </p>
                    </div>

                    {/* AI Analysis Card */}
                    {analysis ? (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-20 -mt-20" />

                            <div className="flex items-center gap-3 mb-8 relative">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">AI Soil Scan Results</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 relative">
                                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Erosion Class</p>
                                    <p className={`text-lg font-bold ${analysis.prediction.includes('Severe') ? 'text-red-400' : analysis.prediction.includes('Moderate') ? 'text-orange-400' : 'text-green-400'}`}>
                                        {analysis.prediction}
                                    </p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Soil Category</p>
                                    <p className="text-lg font-bold text-slate-100">{analysis.soil.type}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/5 flex gap-4 relative">
                                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Automated Reasoning</p>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
                                        "{analysis.reasoning}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Shield className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No AI Analysis available</p>
                            <p className="text-slate-300 text-sm mt-1">This report was submitted without soil pattern recognition.</p>
                        </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                    {report.userEmail?.[0].toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{report.userEmail || 'Anonymous Reporter'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium lowercase">reporter account</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
