import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className = 'mt-3.5' }: SectionDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className} pointer-events-none select-none`}>
      <div className="w-8 sm:w-11 h-[1px] bg-gradient-to-r from-transparent via-[#C4BBB0] to-[#A8988A]" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[#A8988A] shadow-xs" />
      <div className="w-8 sm:w-11 h-[1px] bg-gradient-to-l from-transparent via-[#C4BBB0] to-[#A8988A]" />
    </div>
  );
}
