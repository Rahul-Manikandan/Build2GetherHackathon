'use client';
import { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CameraCapture from './CameraCapture';
import { Camera, Upload, X, Activity, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { openDB } from 'idb';
import { processFileForAnalysis, AnalysisResult } from '@/lib/analysisEngine';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ReportForm() {
    const { latitude, longitude, error: geoError } = useGeolocation();
    const isOffline = useOfflineStatus();
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl && !previewUrl.startsWith('http')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const clearImage = () => {
        setFile(null);
        setPreviewUrl(null);
        setAnalysis(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const runAnalysis = async (capturedFile: File) => {
        setIsAnalyzing(true);
        try {
            const result = await processFileForAnalysis(capturedFile);
            setAnalysis(result);
            setDescription(prev => prev || `Detected ${result.prediction} erosion. ${result.reasoning}. Soil type: ${result.soil.type}.`);
        } catch (err) {
            console.error("Analysis failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setIsCameraOpen(false);
            runAnalysis(selectedFile);
        }
    };

    const handleCameraCapture = (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setIsCameraOpen(false);
        runAnalysis(capturedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const reportData = {
                description,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
                status: 'pending',
                analysis: analysis,
            };

            if (isOffline) {
                const db1 = await openDB('erosion-reports', 1, {
                    upgrade(db) {
                        if (!db.objectStoreNames.contains('reports')) {
                            db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
                        }
                    },
                });
                await db1.add('reports', { ...reportData, file, synced: false });
                setMessage('You are offline. Report saved locally and will sync later.');
                setDescription('');
                clearImage();
            } else {
                let imageUrl = '';
                if (file) {
                    try {
                        const { uploadToCloudinary } = await import('@/lib/cloudinary');
                        imageUrl = await uploadToCloudinary(file);
                    } catch (uploadError: any) {
                        console.error('Cloudinary upload failed:', uploadError);
                        throw new Error(`Image upload failed: ${uploadError.message}`);
                    }
                }

                await addDoc(collection(db, 'reports'), {
                    ...reportData,
                    imageUrl,
                    synced: true
                });
                setMessage('Report submitted successfully!');
                setDescription('');
                clearImage();
            }

        } catch (err: any) {
            console.error('Submission error:', err);
            setMessage(`Failed to submit: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-2xl shadow-slate-200/50 border-white/40 bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Live Data Module</span>
                </div>
                <CardTitle className="text-2xl font-black text-[#1A1C3D] tracking-tight">Erosion Report</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                {isOffline && (
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 mb-6 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>OFFLINE MODE: Reports will sync when connection returns.</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Observations</label>
                        <textarea
                            className="flex min-h-[140px] w-full rounded-3xl border-transparent bg-slate-50 px-4 py-4 text-sm placeholder:text-slate-300 focus-visible:outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all leading-relaxed"
                            placeholder="Describe the soil condition, depth, and environmental factors..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="bg-[#1A1C3D] p-5 rounded-3xl text-white shadow-xl shadow-indigo-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/30 transition-colors" />
                        <div className="relative flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Geolocation</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter",
                                    latitude ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/20 text-primary animate-pulse"
                                )}>
                                    {latitude ? 'LOCKED' : 'SCANNING'}
                                </span>
                            </div>
                            <div className="text-lg font-bold font-mono tracking-tight text-white/90">
                                {latitude ? `${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : '0.00000, 0.00000'}
                            </div>
                            {geoError && <span className="text-[10px] text-red-400 font-bold mt-1">{geoError}</span>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Visual Evidence</label>

                        {!isCameraOpen && !previewUrl && (
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-28 flex flex-col gap-3 border-dashed border-2 bg-slate-50/50 border-slate-100 rounded-3xl hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group"
                                    onClick={() => setIsCameraOpen(true)}
                                >
                                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Camera</span>
                                </Button>
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-28 flex flex-col gap-3 border-dashed border-2 bg-slate-50/50 border-slate-100 rounded-3xl hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
                                    </Button>
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}

                        {isCameraOpen && (
                            <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl">
                                <CameraCapture
                                    onCapture={handleCameraCapture}
                                    onCancel={() => setIsCameraOpen(false)}
                                />
                            </div>
                        )}

                        {previewUrl && (
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50 group">
                                <img src={previewUrl} alt="Preview" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />

                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-[#1A1C3D]/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                                        <div className="relative w-16 h-16 mb-4">
                                            <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                                            <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                                            <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] mb-1">AI Scan Underway</p>
                                        <p className="text-[10px] text-white/60">Decoding soil patterns...</p>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-10 w-10 rounded-2xl shadow-xl flex items-center justify-center bg-red-500 hover:bg-red-600 border-none transition-all active:scale-95"
                                        onClick={clearImage}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {analysis && (
                            <div className="mt-4 p-5 bg-[#F8FAFF] rounded-3xl border border-indigo-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Activity className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-[#1A1C3D] uppercase tracking-widest">Intelligence Snapshot</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-2xl border border-white shadow-sm transition-all hover:border-primary/20">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Severity</p>
                                        <p className="text-xs font-black text-[#1A1C3D]">{analysis.prediction}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-white shadow-sm transition-all hover:border-primary/20">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Structure</p>
                                        <p className="text-xs font-black text-[#1A1C3D]">{analysis.soil.type}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/60 rounded-2xl border border-white text-[10px] font-medium text-slate-600 leading-relaxed italic">
                                    "{analysis.reasoning}"
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-16 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-2px] active:scale-[0.98] rounded-3xl bg-primary text-white overflow-hidden group relative"
                            disabled={loading || (!latitude && !isOffline)}
                        >
                            {loading ? 'Processing Protocol...' : 'Confirm Submission'}
                            {!loading && <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
                        </Button>
                    </div>

                    {message && (
                        <div className={cn(
                            "p-4 rounded-2xl text-xs font-bold text-center animate-in zoom-in-95 duration-300",
                            message.includes('Failed')
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        )}>
                            {message}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
