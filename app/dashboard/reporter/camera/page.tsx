'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, MapPin, Loader2 } from 'lucide-react';
import CameraCapture from '@/components/forms/CameraCapture';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { db, auth } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { openDB } from 'idb';
import Link from 'next/link';
import { processFileForAnalysis, AnalysisResult } from '@/lib/analysisEngine';
import { AlertCircle, Activity, Droplets } from 'lucide-react';

export default function CameraPage() {
    const router = useRouter();
    const { latitude, longitude } = useGeolocation();
    const isOffline = useOfflineStatus();

    const [step, setStep] = useState<'camera' | 'details'>('camera');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCapture = async (capturedFile: File) => {
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setStep('details');

        // Run analysis
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

    const handleSubmit = async () => {
        if (!file) return;

        if (!auth.currentUser && !isOffline) {
            alert("You seem to be logged out. Please sign in again.");
            router.push('/signin');
            return;
        }

        setLoading(true);
        setStatusMsg('Initializing...');

        try {
            let imageUrl = null;
            const reportData = {
                description,
                latitude: latitude || 0,
                longitude: longitude || 0,
                timestamp: new Date().toISOString(),
                status: 'pending',
                userId: auth.currentUser?.uid || 'anonymous',
                userEmail: auth.currentUser?.email || 'anonymous',
                analysis: analysis // Save AI analysis result
            };

            if (isOffline) {
                setStatusMsg('Saving locally...');
                const db1 = await openDB('erosion-reports', 1);
                await db1.add('reports', { ...reportData, file, synced: false });
                alert('Saved offline!');
            } else {
                // Upload to Cloudinary
                setStatusMsg('Uploading image to Cloudinary...');
                try {
                    // Import dynamically to avoid SSR issues if any, though this is client-side
                    const { uploadToCloudinary } = await import('@/lib/cloudinary');
                    imageUrl = await uploadToCloudinary(file);
                    console.log("Cloudinary Upload success, URL:", imageUrl);
                } catch (uploadError: any) {
                    console.error("Cloudinary Upload failed:", uploadError);
                    alert(`Cloudinary upload failed: ${uploadError.message}. Saving report text only.`);
                }

                setStatusMsg('Saving details...');
                await addDoc(collection(db, 'reports'), {
                    ...reportData,
                    imageUrl,
                    synced: true
                });
            }

            setStatusMsg('Success! Redirecting...');
            alert('Report Submitted!');
            window.location.href = '/dashboard/reporter';

        } catch (error: any) {
            console.error("Submit error:", error);
            alert(`Critical Error: ${error.message}`);
            setLoading(false);
            setStatusMsg('Error. Tap submit to retry.');
        }
    };

    if (step === 'camera') {
        return (
            <div className="h-[100dvh] bg-black relative flex flex-col">
                <div className="absolute top-4 left-4 z-50">
                    <Link href="/dashboard/reporter">
                        <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 relative">
                    <CameraCapture
                        onCapture={handleCapture}
                        onCancel={() => router.push('/dashboard/reporter')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => setStep('camera')} disabled={loading}>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
                <h1 className="ml-2 text-lg font-bold text-slate-800">Add Details</h1>
            </div>

            <div className="p-4 space-y-6 flex-1">
                <div className="h-64 w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md relative">
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center backdrop-blur-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {latitude ? `${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Locating...'}
                    </div>

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-sm font-medium">Analyzing Soil Patterns...</p>
                        </div>
                    )}
                </div>

                {/* AI Analysis Result */}
                {analysis && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-slate-900">AI Analysis Result</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prediction</p>
                                <p className={`font-bold text-sm ${analysis.prediction.includes('Severe') ? 'text-red-600' : analysis.prediction.includes('Moderate') ? 'text-orange-600' : 'text-green-600'}`}>
                                    {analysis.prediction}
                                </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Soil Type</p>
                                <p className="font-bold text-sm text-slate-700">{analysis.soil.type}</p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                {analysis.reasoning}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What kind of erosion is this?"
                            className="w-full p-4 rounded-xl border border-slate-200 shadow-sm bg-white text-slate-900 placeholder:text-slate-400 min-h-[120px] focus:ring-2 focus:ring-primary focus:outline-none"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <Button
                    size="lg"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 text-lg font-medium"
                    onClick={handleSubmit}
                    disabled={loading || !description}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {statusMsg || 'Submitting...'}
                        </>
                    ) : (
                        <>
                            Submit Report <Check className="ml-2 w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
