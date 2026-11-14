'use client';

import React, { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  size: number;
  fallDuration: number;
  fallDelay: number;
  swayDuration: number;
  swayDistance: number;
  color: string;
  opacity: number;
  shape: number;
}

export default function FallingPetals() {
  // Pre-generate a rich, organic collection of 22 falling flower petals
  const petals = useMemo<Petal[]>(() => {
    const colors = [
      '#F8D7DA', // Soft blush pink
      '#F4CCD1', // Delicate rose
      '#F7E5DE', // Warm peach
      '#FAF2EA', // Champagne ivory
      '#ECC5CB', // Romantic cherry blossom
      '#F9EBEA', // Pale petal
    ];

    const items: Petal[] = [];
    const count = 22;

    for (let i = 0; i < count; i++) {
      // Evenly distribute horizontal positions with slight jitter
      const baseLeft = (i / count) * 96 + 2;
      const jitter = (Math.sin(i * 99) * 4);
      const left = Math.max(2, Math.min(96, baseLeft + jitter));

      items.push({
        id: i,
        left,
        size: 14 + (i % 5) * 3, // sizes: 14px to 26px
        fallDuration: 8 + (i % 6) * 1.2, // 8s to 14s (gentle, relaxing descent)
        fallDelay: -((i * 1.7) % 12), // negative delay ensures immediate presence on screen
        swayDuration: 2.8 + (i % 4) * 0.5, // 2.8s to 4.3s horizontal sway cycle
        swayDistance: 16 + (i % 4) * 6, // 16px to 34px horizontal drift
        color: colors[i % colors.length],
        opacity: 0.65 + (i % 4) * 0.08, // 0.65 to 0.89 translucent softness
        shape: i % 3,
      });
    }

    return items;
  }, []);

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 lg:left-auto lg:right-0 lg:w-[42%] xl:w-[38%] pointer-events-none z-20 overflow-hidden select-none"
    >
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(-12vh) rotateZ(0deg) rotateX(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.9;
          }
          88% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(112vh) rotateZ(360deg) rotateX(360deg);
            opacity: 0;
          }
        }

        @keyframes petalSway {
          0% {
            transform: translateX(0px) rotateY(0deg) rotateZ(-12deg);
          }
          50% {
            transform: translateX(var(--sway-dist)) rotateY(180deg) rotateZ(12deg);
          }
          100% {
            transform: translateX(0px) rotateY(360deg) rotateZ(-12deg);
          }
        }

        .petal-fall {
          position: absolute;
          top: 0;
          animation: petalFall linear infinite;
          will-change: transform, opacity;
        }

        .petal-sway {
          animation: petalSway ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {petals.map((p) => (
        <div
          key={p.id}
          className="petal-fall"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.fallDuration}s`,
            animationDelay: `${p.fallDelay}s`,
          }}
        >
          <div
            className="petal-sway"
            style={{
              animationDuration: `${p.swayDuration}s`,
              // @ts-expect-error custom CSS variable
              '--sway-dist': `${p.swayDistance}px`,
            }}
          >
            {/* Organic Petal Shapes */}
            {p.shape === 0 && (
              // Classic Rose/Sakura Petal
              <svg
                width={p.size}
                height={p.size * 1.25}
                viewBox="0 0 24 30"
                fill="none"
                style={{
                  opacity: p.opacity,
                  filter: 'drop-shadow(0 2px 4px rgba(74, 69, 63, 0.12))',
                }}
              >
                <path
                  d="M12 2 C18 2, 23 8, 22 17 C21 24, 15 28, 12 29 C9 28, 3 24, 2 17 C1 8, 6 2, 12 2 Z"
                  fill={p.color}
                />
                {/* Subtle delicate vein */}
                <path
                  d="M12 7 C12 14, 12 20, 12 25"
                  stroke="#E8A7B0"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            )}

            {p.shape === 1 && (
              // Asymmetric fluttering petal
              <svg
                width={p.size * 1.1}
                height={p.size}
                viewBox="0 0 28 24"
                fill="none"
                style={{
                  opacity: p.opacity,
                  filter: 'drop-shadow(0 2px 4px rgba(74, 69, 63, 0.12))',
                }}
              >
                <path
                  d="M4 12 C6 5, 14 2, 20 4 C26 6, 28 14, 24 19 C20 24, 11 25, 6 21 C2 18, 2 15, 4 12 Z"
                  fill={p.color}
                />
                <path
                  d="M7 14 C12 12, 17 11, 22 10"
                  stroke="#E8A7B0"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </svg>
            )}

            {p.shape === 2 && (
              // Heart-crested delicate petal
              <svg
                width={p.size}
                height={p.size * 1.2}
                viewBox="0 0 24 28"
                fill="none"
                style={{
                  opacity: p.opacity,
                  filter: 'drop-shadow(0 2px 4px rgba(74, 69, 63, 0.12))',
                }}
              >
                <path
                  d="M12 4 C15 1, 21 2, 23 8 C25 15, 18 23, 12 27 C6 23, -1 15, 1 8 C3 2, 9 1, 12 4 Z"
                  fill={p.color}
                />
                <circle cx="12" cy="14" r="1.5" fill="#FAF0EA" opacity="0.6" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
