'use client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/signin');
    };

    return (
        <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 font-sans p-4 md:p-8 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/reporter">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            </header>

            <div className="space-y-6">
                <div className="flex flex-col items-center py-8 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <User className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Reporter</h2>
                    <p className="text-slate-500">reporter@example.com</p>
                </div>

                <div className="space-y-3">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <Button
                                variant="ghost"
                                className="w-full h-14 justify-start px-6 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
