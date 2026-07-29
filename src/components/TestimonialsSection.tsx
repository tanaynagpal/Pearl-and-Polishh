import React, { useState, useEffect } from 'react';
import { getStoredTestimonials } from '../data/storage';
import { Testimonial } from '../types';
import { Star, ShieldCheck, Sparkles, Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  keyIndex?: number;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setTestimonials(getStoredTestimonials());
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-[#FFF3F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E91E63]/30 text-xs font-bold text-[#E91E63] uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Verified Reviews</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#420614]">
            Client Experiences & Reviews
          </h2>

          <p className="text-sm sm:text-base text-[#600A20]/80">
            Read authentic feedback from brides, festive fashionistas, and press-on nail lovers who trust Pearl & Polishh for their most memorable occasions.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-3xl border border-[#800E2B]/15 shadow-xs flex flex-col justify-between space-y-4 relative group hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-[#E91E63]/20 absolute top-4 right-4" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1 text-[#E91E63]">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E91E63] text-[#E91E63]" />
                  ))}
                </div>

                <p className="text-xs text-[#420614]/90 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#800E2B]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {review.avatarUrl && (
                      <img
                        src={review.avatarUrl}
                        alt={review.author}
                        className="w-8 h-8 rounded-full object-cover border border-[#E91E63]/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#420614]">
                        {review.author}
                      </h4>
                      <p className="text-[10px] text-[#600A20]/60">{review.location}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#E91E63] bg-[#FFF3F6] px-2 py-0.5 rounded-full border border-[#800E2B]/20 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-[#E91E63]" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-bold text-[#600A20] bg-[#FFF3F6] px-2.5 py-1 rounded-lg line-clamp-1">
                  Item: {review.itemPurchased}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

