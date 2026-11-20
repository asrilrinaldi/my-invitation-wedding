import React from 'react';

interface SectionDividerProps {
  className?: string;
  variant?: 'gold' | 'champagne';
}

export default function SectionDivider({ className = 'mt-3.5', variant = 'champagne' }: SectionDividerProps) {
  const isGold = variant === 'gold';
  const color = isGold ? '#D4AF37' : '#A8988A';
  const ruleGradFrom = isGold ? 'via-[#E6C687] to-[#D4AF37]' : 'via-[#C4BBB0] to-[#A8988A]';

  return (
    <div className={`flex items-center justify-center gap-3 ${className} pointer-events-none select-none`}>
      {/* Left Hairline Rule */}
      <div className={`w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent ${ruleGradFrom}`} />

      {/* Stylized Botanical Lily Flower Emblem */}
      <svg
        viewBox="0 0 32 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-4.5 sm:w-7 sm:h-5 text-[#A8988A] overflow-visible drop-shadow-[0_1px_2px_rgba(44,40,37,0.12)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lilyPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A8988A" />
          </linearGradient>
        </defs>

        {/* Stem Base */}
        <path
          d="M 16 23 C 16 20 16 18 16 16"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Outer Left Curved Lily Petal */}
        <path
          d="M 16 18 C 12 16 7 13 5 8 C 8 8 13 11 16 15"
          fill="#FAF8F5"
          fillOpacity="0.4"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />

        {/* Outer Right Curved Lily Petal */}
        <path
          d="M 16 18 C 20 16 25 13 27 8 C 24 8 19 11 16 15"
          fill="#FAF8F5"
          fillOpacity="0.4"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />

        {/* Center Main Lily Petal (Tall & Graceful) */}
        <path
          d="M 16 18 C 14 12 14.5 6 16 2 C 17.5 6 18 12 16 18 Z"
          fill="#FAF8F5"
          fillOpacity="0.6"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Left Stamen & Anther */}
        <path
          d="M 16 16 Q 13 11 11 9"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <circle cx="10.5" cy="8.5" r="0.9" fill="#D4AF37" />

        {/* Right Stamen & Anther */}
        <path
          d="M 16 16 Q 19 11 21 9"
          stroke="url(#lilyPetalGrad)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <circle cx="21.5" cy="8.5" r="0.9" fill="#D4AF37" />

        {/* Tiny Golden Pollen Pistil Tip */}
        <circle cx="16" cy="4" r="0.8" fill="#D4AF37" />
      </svg>

      {/* Right Hairline Rule */}
      <div className={`w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent ${ruleGradFrom}`} />
    </div>
  );
}
