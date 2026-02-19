'use client';

import { useState } from 'react';
import { Report } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
    report: Report;
    onStatusChange?: (id: string, newStatus: Report['status']) => void;
}

export default function ReportCard({ report, onStatusChange }: ReportCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (e: React.MouseEvent, newStatus: Report['status']) => {
        e.preventDefault();
        e.stopPropagation();

        if (report.status === newStatus) return;

        setIsUpdating(true);
        try {
            const reportRef = doc(db, 'reports', report.id);
            await updateDoc(reportRef, {
                status: newStatus,
                synced: true
            });
            if (onStatusChange) {
                onStatusChange(report.id, newStatus);
            }
        } catch (error: any) {
            console.error("Error updating status:", error);
            alert(`Failed to update status: ${error.message || 'Unknown error'}. Please check your permissions.`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="overflow-hidden border border-white/40 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[2.5rem] group flex flex-col h-full bg-white/80 backdrop-blur-xl relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[4px] z-50 flex items-center justify-center rounded-[2.5rem] animate-in fade-in">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                </div>
            )}

            <Link href={`/dashboard/report/${report.id}`} className="flex-1 flex flex-col p-2">
                <div className="relative h-64 w-full rounded-[2rem] overflow-hidden shadow-inner">
                    {report.imageUrl ? (
                        <Image
                            src={report.imageUrl}
                            alt="Erosion evidence"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50 gap-3">
                            <span className="text-5xl opacity-40">🏜️</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">No Image Data</span>
                        </div>
                    )}

                    {/* Floating Status Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-md border shadow-lg transition-colors",
                            report.status === 'resolved' ? 'bg-emerald-500 text-white border-emerald-400' :
                                report.status === 'approved' ? 'bg-[#4C49ED] text-white border-primary/50' :
                                    report.status === 'reviewed' ? 'bg-blue-500 text-white border-blue-400' :
                                        'bg-amber-500 text-white border-amber-400'
                        )}>
                            {report.status}
                        </span>
                    </div>

                    {/* View Icon Overlay */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            <Eye className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>

                <CardContent className="px-5 py-6 flex-1 flex flex-col space-y-4">
                    <div className="flex justify-between items-start gap-3 flex-1">
                        <h4 className="font-bold text-[#1A1C3D] text-lg line-clamp-2 leading-tight flex-1">
                            {report.description}
                        </h4>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100/50">
                        <div className="flex items-center gap-2 group/meta">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center group-hover/meta:bg-orange-100 transition-colors">
                                <MapPin className="w-4 h-4 text-orange-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 tracking-tight">
                                {report.latitude?.toFixed(2)}, {report.longitude?.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 group/meta">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover/meta:bg-blue-100 transition-colors">
                                <Clock className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Link>

            <CardFooter className="px-5 pb-6 pt-0 grid grid-cols-3 gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUpdating}
                    onClick={(e) => handleStatusUpdate(e, 'reviewed')}
                    className={cn(
                        "h-11 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all px-0",
                        report.status === 'reviewed' ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" : "hover:bg-blue-50 hover:text-blue-600 border border-transparent"
                    )}
                >
                    {report.status === 'reviewed' ? 'Reviewed' : 'Review'}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={(e) => handleStatusUpdate(e, 'approved')}
                    className={cn(
                        "h-11 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all px-0",
                        report.status === 'approved' ? "bg-primary text-white border-none shadow-lg shadow-primary/20" : "hover:bg-primary/5 hover:text-primary border-slate-100"
                    )}
                >
                    {report.status === 'approved' ? 'Approved' : 'Approve'}
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    disabled={isUpdating || report.status === 'resolved'}
                    onClick={(e) => handleStatusUpdate(e, 'resolved')}
                    className={cn(
                        "h-11 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 px-0",
                        report.status === 'resolved' ? "bg-emerald-500 text-white opacity-100 shadow-none pointer-events-none" : "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white"
                    )}
                >
                    {report.status === 'resolved' ? 'Resolved' : 'Resolve'}
                </Button>
            </CardFooter>
        </Card>
    );
}
