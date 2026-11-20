import React from 'react';

interface BotanicalAccentProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export default function BotanicalAccent({
  position = 'bottom-left',
  className = '',
}: BotanicalAccentProps) {
  // Flip transform based on corner placement
  const isRight = position.includes('right');
  const isTop = position.includes('top');

  const transformStyle = {
    transform: `${isRight ? 'scaleX(-1)' : 'scaleX(1)'} ${isTop ? 'scaleY(-1)' : 'scaleY(1)'}`,
  };

  return (
    <div
      className={`pointer-events-none select-none drop-shadow-[0_2px_6px_rgba(44,40,37,0.18)] ${className}`}
      style={transformStyle}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Metallic Gold to Champagne Gradient */}
          <linearGradient id="goldStemGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F0DC9E" />
          </linearGradient>

          <linearGradient id="goldLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FAF1D2" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Main Arch Curving Stem */}
        <path
          d="M 12 94 C 20 78 35 60 55 38 C 66 26 77 15 88 10"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Secondary Delicate Twig */}
        <path
          d="M 36 62 C 48 64 62 60 70 54"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.0"
          strokeLinecap="round"
          strokeDasharray="0.5 0"
        />

        {/* Leaf 1 (Bottom Left - Outer) */}
        <path
          d="M 23 76 C 10 72 6 60 12 53 C 21 54 26 66 23 76 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M 12 53 Q 18 64 23 76" stroke="url(#goldStemGrad)" strokeWidth="0.75" />

        {/* Leaf 2 (Bottom Right - Inner) */}
        <path
          d="M 37 66 C 48 59 55 49 50 41 C 41 42 36 53 37 66 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M 50 41 Q 43 53 37 66" stroke="url(#goldStemGrad)" strokeWidth="0.75" />

        {/* Leaf 3 (Mid Left - Graceful curve) */}
        <path
          d="M 44 51 C 33 43 31 31 39 25 C 47 27 48 39 44 51 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M 39 25 Q 43 38 44 51" stroke="url(#goldStemGrad)" strokeWidth="0.75" />

        {/* Leaf 4 (Mid Right Branch) */}
        <path
          d="M 58 39 C 70 34 77 24 72 17 C 63 18 57 28 58 39 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M 72 17 Q 64 27 58 39" stroke="url(#goldStemGrad)" strokeWidth="0.75" />

        {/* Leaf 5 (Small Accent on secondary twig) */}
        <path
          d="M 55 61 C 65 64 72 59 74 53 C 67 52 60 56 55 61 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.0"
          strokeLinejoin="round"
        />

        {/* Tip Leaf (Top Right) */}
        <path
          d="M 77 18 C 86 11 93 8 94 13 C 92 20 84 22 77 18 Z"
          fill="url(#goldLeafGrad)"
          stroke="url(#goldStemGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Delicate Golden Blossom Buds / Berries */}
        <circle cx="28" cy="46" r="2.2" fill="#D4AF37" />
        <circle cx="28" cy="46" r="1.2" fill="#FFFDF5" />

        <circle cx="54" cy="23" r="2.2" fill="#D4AF37" />
        <circle cx="54" cy="23" r="1.2" fill="#FFFDF5" />

        <circle cx="68" cy="44" r="1.8" fill="#E6C687" />
        <circle cx="86" cy="24" r="1.8" fill="#E6C687" />
      </svg>
    </div>
  );
}
