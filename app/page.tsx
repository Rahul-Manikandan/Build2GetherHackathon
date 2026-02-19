'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });

    tl.from(".hero-art", {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      ease: "expo.out"
    })
      .from(".hero-title > *", {
        y: 60,
        opacity: 0,
        stagger: 0.2,
      }, "-=0.8")
      .from(".hero-actions > *", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
      }, "-=0.6")
      .from(".decorative-rings", {
        rotation: -10,
        opacity: 0,
        duration: 2,
      }, 0);

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-white text-foreground flex flex-col relative overflow-hidden font-sans">

      {/* Geometric Decoration (Matches Image 1) */}
      <div className="decorative-rings absolute top-[-10%] right-[-10%] w-[60%] aspect-square opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
        </svg>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-center container mx-auto px-6 md:px-12 lg:px-24 py-12 lg:py-24 z-10 gap-16 lg:gap-24">

        {/* Left/Top Content: Abstract Geometric Art (Image 1 Style) */}
        <div className="hero-art flex-1 w-full max-w-sm md:max-w-md lg:max-w-lg aspect-square relative">
          <div className="absolute inset-0 bg-slate-50 border border-slate-100 rounded-[3rem] md:rounded-[4rem] overflow-hidden">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M40 0h120c22 0 40 18 40 40v120c0 22-18 40-40 40H40c-22 0-40-18-40-40V40C0 18 18 0 40 0z" fill="#f8faff" />
              <circle cx="40" cy="40" r="30" fill="#4C49ED" opacity="0.9" />
              <path d="M0 100a100 100 0 0 1 100-100v200A100 100 0 0 1 0 100z" fill="#110F33" opacity="0.8" />
              <rect x="120" y="100" width="80" height="100" fill="#4C49ED" opacity="0.7" />
              <circle cx="150" cy="50" r="25" stroke="#4C49ED" strokeWidth="8" fill="none" />
              <g stroke="#1A1C3D" strokeWidth="1.5" opacity="0.2">
                <line x1="120" y1="0" x2="120" y2="200" />
                <line x1="130" y1="0" x2="130" y2="200" />
                <line x1="140" y1="0" x2="140" y2="200" />
              </g>
            </svg>
          </div>
        </div>

        {/* Right Content: Copy & Actions */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <div className="hero-title space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1A1C3D] leading-[1.1]">
              Protect your <br />
              <span className="text-primary">environment</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Empowering communities with AI soil health monitoring and real-time geolocation alerts.
            </p>
          </div>

          <div className="hero-actions pt-4 w-full flex justify-center lg:justify-start">
            <Link href="/signin">
              <Button size="lg" className="h-14 md:h-16 px-10 md:px-12 text-lg rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all transform hover:translate-y-[-2px] active:scale-95 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="hero-actions flex items-center justify-center lg:justify-start gap-6 pt-12">
            <Link href="/about" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">About</Link>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <Link href="/dashboard/supervisor" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Admin</Link>
          </div>
        </div>

      </main>

      {/* Decorative Circles (Matches Image 1) */}
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-slate-50 rounded-full -z-10" />
    </div>
  );
}
