'use client';

import React from 'react';
import { loveStories } from '@/lib/data';
import ScrollReveal from './ScrollReveal';

export default function LoveStorySection() {
  return (
    <section className="py-20 px-6 max-w-xl mx-auto space-y-10">
      <ScrollReveal animation="fade-up">
        <div className="text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
            Perjalanan Cinta
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2825] font-normal">
            Kisah Kami
          </h2>
          <div className="w-12 h-[1px] bg-[#C4BBB0] mx-auto mt-3" />
        </div>
      </ScrollReveal>

      <div className="relative border-l border-[#D6CFC7] ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8">
        {loveStories.map((story, index) => (
          <ScrollReveal 
            key={index} 
            animation="fade-up" 
            delay={index * 160}
            duration={700}
          >
            <div className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#FAF8F5] border-2 border-[#8C7B6B] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8C7B6B]" />
              </div>

              {/* Year Tag */}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EBE5DC] text-[#59524A] font-serif font-bold text-xs mb-2">
                {story.year}
              </span>

              {/* Content Card */}
              <div className="serein-card rounded-2xl p-5 space-y-1.5">
                <h3 className="text-base font-serif font-semibold text-[#2C2825]">
                  {story.title}
                </h3>
                <p className="text-xs text-[#59524A] leading-relaxed">
                  {story.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
