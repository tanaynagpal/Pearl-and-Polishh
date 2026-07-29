import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';

export const FloatingWhatsAppButton: React.FC = () => {
  const whatsappUrl = buildWhatsAppUrl(
    'Hello Pearl & Polish! I have a question about custom press-on designs or studio booking.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip bubble */}
      <div className="hidden sm:flex items-center gap-2 bg-[#1A1817] text-[#FAF7F2] text-xs font-semibold px-3.5 py-2 rounded-full shadow-2xl border border-[#B8860B]/40 animate-bounce">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Chat on WhatsApp</span>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group p-4 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center cursor-pointer"
        aria-label="Order or Chat on WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
        <MessageCircle className="w-6 h-6 text-white relative z-10" />
      </a>
    </div>
  );
};
