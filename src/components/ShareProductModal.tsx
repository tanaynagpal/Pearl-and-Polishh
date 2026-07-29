import React, { useState } from 'react';
import { NailProduct } from '../types';
import { X, Share2, Copy, Check, MessageCircle, Instagram, Link, Sparkles, Send } from 'lucide-react';
import { STUDIO_INSTAGRAM_URL } from '../data/products';

interface ShareProductModalProps {
  product: NailProduct | null;
  onClose: () => void;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);

  // Generate clean shareable link for this product
  const getProductShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?product=${encodeURIComponent(product.id)}`;
  };

  const shareUrl = getProductShareUrl();

  // 1. Copy Link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 2. Share on WhatsApp handler
  const handleWhatsAppShare = () => {
    const text = `Check out this gorgeous press-on set from Pearl & Polishh! 💅✨\n\n*${product.title}* (₹${product.price})\nCategory: ${product.category}\n\nView & Order here:\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. Share on Instagram handler
  const handleInstagramShare = () => {
    const instaCaption = `✨ ${product.title} (₹${product.price}) from Pearl & Polishh 💅\nShop this set or customize your own press-ons! Link: ${shareUrl} #PearlAndPolishh #PressOnNails #NailArt`;
    navigator.clipboard.writeText(instaCaption);
    setCopiedInsta(true);
    setTimeout(() => setCopiedInsta(false), 3000);

    // Attempt to open Instagram web/app
    window.open(STUDIO_INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  // 4. Native Device Share API (Mobile Web Share)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} - Pearl & Polishh`,
          text: `Check out ${product.title} (₹${product.price}) on Pearl & Polishh! 💅`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or not supported:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full border border-[#800E2B]/20 p-6 relative shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#800E2B]/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-[#E91E63]/10 text-[#E91E63]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#420614]">Share Product</h3>
              <p className="text-[10px] font-medium text-[#600A20]/70">Spread the sparkle with friends & family</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white hover:bg-[#420614] hover:text-white transition-colors text-[#420614] border border-[#800E2B]/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Card Preview */}
        <div className="flex items-center gap-3.5 p-3 bg-white rounded-2xl border border-[#800E2B]/15 shadow-xs">
          <img
            src={product.image}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover border border-[#800E2B]/20 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#E91E63] block">
              {product.category}
            </span>
            <h4 className="font-serif text-xs font-bold text-[#420614] truncate">
              {product.title}
            </h4>
            <p className="text-xs font-bold text-[#800E2B] mt-0.5">
              ₹{product.price}
            </p>
          </div>
        </div>

        {/* Sharing Options Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Share via WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="p-3 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba5a] transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm group cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">WhatsApp</span>
          </button>

          {/* Share via Instagram */}
          <button
            onClick={handleInstagramShare}
            className="p-3 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white hover:opacity-95 transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm group cursor-pointer"
          >
            <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">
              {copiedInsta ? 'Caption Copied! 📸' : 'Instagram'}
            </span>
          </button>

          {/* Copy Direct Link */}
          <button
            onClick={handleCopyLink}
            className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-1.5 border shadow-sm cursor-pointer ${
              copiedLink
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-[#420614] border-[#800E2B]/20 hover:border-[#E91E63]'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-5 h-5" />
                <span className="text-xs font-bold">Copied! ✨</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-[#E91E63]" />
                <span className="text-xs font-bold">Copy Link</span>
              </>
            )}
          </button>

          {/* Native System Share */}
          <button
            onClick={handleNativeShare}
            className="p-3 rounded-2xl bg-[#420614] text-white hover:bg-[#800E2B] transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-sm group cursor-pointer"
          >
            <Send className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">More Options...</span>
          </button>
        </div>

        {/* Copy Link Input Box */}
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-bold text-[#600A20] uppercase tracking-wider block">
            Product Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#800E2B]/20">
            <Link className="w-4 h-4 text-[#E91E63] shrink-0 ml-1.5" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full text-xs text-[#420614] bg-transparent outline-none truncate font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 rounded-lg bg-vibrant-maroon text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#E91E63] transition-colors shrink-0 cursor-pointer"
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Feedback message for Instagram */}
        {copiedInsta && (
          <div className="p-2.5 rounded-xl bg-[#FFF3F6] border border-[#E91E63]/30 text-center animate-fade-in">
            <p className="text-[11px] font-bold text-[#E91E63] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Caption & Link copied! Opening Instagram...</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
