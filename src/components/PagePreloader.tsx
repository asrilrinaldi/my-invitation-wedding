'use client';

import React, { useState, useEffect } from 'react';

export default function PagePreloader() {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Prevent scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    const duration = 5000; // 5 detik durasi loading pengisian logo

    let frameId: number;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, elapsed / duration);

      // Smooth ease-out cubic curve for natural, luxurious fill motion
      const eased = 1 - Math.pow(1 - rawProgress, 2.5);
      const currentVal = Math.min(100, Math.round(eased * 100));

      setProgress(currentVal);

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(updateProgress);
      } else {
        // Logo is now 100% full black. Hold for a moment to appreciate the completed logo
        setTimeout(() => {
          setIsFadingOut(true);
          document.body.style.overflow = '';

          // Completely unmount after fade transition completes
          setTimeout(() => {
            setIsDone(true);
          }, 700);
        }, 350);
      }
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = '';
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#EDE8E1] select-none transition-all duration-700 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: "url('/images/paper-grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }}
      aria-hidden={isFadingOut}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-xs sm:max-w-sm">
        {/* Monogram Logo Container with Color-Fill Animation */}
        <div className="relative w-28 sm:w-36 h-28 sm:h-36 flex items-center justify-center">
          {/* Base Layer: Logo faint silhouette / outline */}
          <img
            src="/logo/logo.PNG"
            alt="Logo Monogram AS"
            className="w-full h-full object-contain brightness-0 opacity-15 select-none pointer-events-none"
          />

          {/* Fill Layer: Animasi mengisi warna logo hingga full hitam (bottom-to-top) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-75 ease-out"
            style={{
              clipPath: `inset(${100 - progress}% 0 0 0)`,
            }}
          >
            <img
              src="/logo/logo.PNG"
              alt="Logo Monogram AS Solid"
              className="w-full h-full object-contain brightness-0 opacity-100 select-none pointer-events-none drop-shadow-sm"
            />
          </div>
        </div>

        {/* The Wedding of - Typography */}
        <div className="mt-6 space-y-1">
          <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            The Wedding of
          </p>
          <h1 className="font-serif text-lg sm:text-xl font-bold tracking-[0.15em] text-[#2C2825] uppercase">
            Asril &amp; Sisi
          </h1>
        </div>

        {/* Minimalist Progress Track */}
        <div className="w-32 sm:w-36 h-[2px] bg-[#DDD6CC] rounded-full overflow-hidden mt-5 relative">
          <div
            className="h-full bg-[#38332E] rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage Counter */}
        <p className="text-[10px] text-[#8C7B6B] font-mono tracking-wider mt-2">
          {progress}%
        </p>
      </div>
    </div>
  );
}
