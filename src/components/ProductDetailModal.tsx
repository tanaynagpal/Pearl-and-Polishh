import React, { useState } from 'react';
import { NailProduct, PressOnShape } from '../types';
import { api } from '../services/api';
import { buildWhatsAppUrl } from '../data/products';
import { X, Star, CheckCircle2, MessageCircle, Sparkles, ShieldCheck, Share2 } from 'lucide-react';
import { ShareProductModal } from './ShareProductModal';

interface ProductDetailModalProps {
  product: NailProduct | null;
  onClose: () => void;
  onOpenSizingGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenSizingGuide,
}) => {
  const [isSharing, setIsSharing] = useState(false);

  if (!product) return null;

  const [selectedShape, setSelectedShape] = useState<string>(
    product.shapeOptions[0] || 'Short Almond'
  );
  const [selectedLength, setSelectedLength] = useState<string>(
    product.lengthOptions[0] || 'Medium'
  );

  const getWhatsAppUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const productUrl = `${origin}${pathname}?product=${encodeURIComponent(product.id)}`;

    const text = `Hello Pearl & Polishh! 💅\n\nI would like to order:\n• Item: ${product.title}\n• Price: ₹${product.price}\n• Preferred Shape: ${selectedShape}\n• Preferred Length: ${selectedLength}\n• Product Link: ${productUrl}\n\nPlease guide me on sizing and payment instructions!`;
    return buildWhatsAppUrl(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DFC8] p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-[#1A1817] hover:text-white transition-colors text-[#1A1817] z-10 cursor-pointer border border-[#E8DFC8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Image Showcase */}
          <div className="md:col-span-6 relative aspect-4/3 rounded-2xl overflow-hidden bg-[#F5EFE6] border border-[#E8DFC8]">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isBestseller && (
              <span className="absolute top-3 left-3 bg-[#1A1817] text-[#FAF7F2] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#B8860B]">
                Bestseller
              </span>
            )}
          </div>

          {/* Details Body */}
          <div className="md:col-span-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#B8860B] font-bold">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1817] mt-0.5">
                {product.title}
              </h2>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-[#B8860B]">
                  <Star className="w-4 h-4 fill-[#B8860B]" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-[#1A1817]/50">({product.reviewCount} reviews)</span>
                </div>
                <span className="font-serif text-3xl font-bold text-[#1A1817]">
                  ₹{product.price}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#1A1817]/75 leading-relaxed">
              {product.description}
            </p>

            {/* Shape Chooser */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A1817]">Choose Shape:</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSizingGuide();
                  }}
                  className="text-[11px] text-[#B8860B] hover:underline font-semibold"
                >
                  Sizing Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.shapeOptions.map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedShape === shape
                        ? 'bg-[#1A1817] text-white shadow-xs'
                        : 'bg-white border border-[#E8DFC8] text-[#1A1817]/80 hover:border-[#B8860B]'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Chooser */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-[#1A1817] block">Choose Length:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.lengthOptions.map((length) => (
                  <button
                    key={length}
                    onClick={() => setSelectedLength(length)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedLength === length
                        ? 'bg-[#B8860B] text-white shadow-xs'
                        : 'bg-white border border-[#E8DFC8] text-[#1A1817]/80 hover:border-[#B8860B]'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFC8] space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1817]/60">
                Included with this set:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {product.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5 text-[11px] text-[#1A1817]/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  try {
                    await api.createOrder({
                      itemTitle: product.title,
                      productCategory: product.category,
                      price: product.price,
                      details: `Shape: ${selectedShape} | Length: ${selectedLength}`,
                    });
                  } catch (e) {
                    console.error('Order creation error:', e);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#420614] hover:bg-[#600A20] text-white font-bold text-xs tracking-wide border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] group-hover/btn:scale-110 transition-transform shrink-0" />
                <span>Order Now (₹{product.price})</span>
              </a>

              <button
                type="button"
                onClick={() => setIsSharing(true)}
                className="p-2.5 rounded-full bg-[#FFF3F6] border border-[#800E2B]/20 text-[#420614] hover:bg-[#420614] hover:text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Share Product Modal */}
      {isSharing && (
        <ShareProductModal
          product={product}
          onClose={() => setIsSharing(false)}
        />
      )}
    </div>
  );
};
