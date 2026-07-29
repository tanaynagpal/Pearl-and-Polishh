import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, Sparkles, MapPin, Ruler, ShoppingBag, Calendar, User, Crown, ShieldCheck, Star } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';
import { UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenCustomBuilder: () => void;
  onOpenSizingGuide: () => void;
  onOpenAppointmentModal: () => void;
  onOpenAuthModal: () => void;
  onOpenUserPanel: () => void;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenCustomBuilder,
  onOpenSizingGuide,
  onOpenAppointmentModal,
  onOpenAuthModal,
  onOpenUserPanel,
  onOpenAdminPanel,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const generalWhatsAppUrl = buildWhatsAppUrl(
    'Hello Pearl & Polishh! I would like to inquire about custom press-on nails or book a studio appointment.'
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFF3F6]/95 backdrop-blur-md shadow-md border-b border-[#800E2B]/20'
          : 'bg-[#FFF3F6]/80 backdrop-blur-xs border-b border-[#800E2B]/10'
      }`}
    >
      {/* Top Banner announcement */}
      <div className="bg-vibrant-maroon text-[#FFF3F6] text-[10px] sm:text-[11px] py-1 sm:py-1.5 px-3 text-center font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 sm:gap-2 border-b border-[#D4AF37]/30">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] shrink-0" />
        <span className="truncate sm:whitespace-normal">Vibrant Custom Press-Ons &bull; Direct WhatsApp Concierge &bull; Ludhiana Studio & Pan-India Shipping</span>
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37] shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a href="#" className="group">
          <BrandLogo size="md" />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold text-[#420614] tracking-wide flex-nowrap shrink-0">
          <a
            href="#catalog"
            className="hover:text-[#E91E63] transition-colors flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4 text-[#D81B60] shrink-0" />
            <span>Catalog</span>
          </a>

          <button
            onClick={onOpenCustomBuilder}
            className="hover:text-[#E91E63] transition-colors flex items-center gap-1.5 py-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#D81B60] shrink-0" />
            <span>Custom Builder</span>
          </button>

          <button
            onClick={onOpenSizingGuide}
            className="hover:text-[#E91E63] transition-colors flex items-center gap-1.5 py-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Ruler className="w-4 h-4 text-[#D81B60] shrink-0" />
            <span>Sizing Guide</span>
          </button>

          <a
            href="#testimonials"
            className="hover:text-[#E91E63] transition-colors flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0"
          >
            <Star className="w-4 h-4 text-[#D81B60] shrink-0" />
            <span>Reviews</span>
          </a>

          <a
            href="#location"
            className="hover:text-[#E91E63] transition-colors flex items-center gap-1.5 py-2 whitespace-nowrap shrink-0"
          >
            <MapPin className="w-4 h-4 text-[#D81B60] shrink-0" />
            <span>Studio</span>
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* User / Admin Auth State Button */}
          {currentUser ? (
            currentUser.role === 'admin' ? (
              <button
                onClick={onOpenAdminPanel}
                className="px-3.5 py-2 rounded-full bg-[#420614] text-[#D4AF37] border border-[#D4AF37] text-xs font-extrabold tracking-wide hover:bg-[#600A20] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={onOpenUserPanel}
                className="px-3.5 py-2 rounded-full bg-[#FCE4EC] text-[#800E2B] border border-[#E91E63]/40 text-xs font-extrabold tracking-wide hover:bg-[#E91E63] hover:text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#E91E63]" />
                <span>{currentUser.name.split(' ')[0]}'s Account</span>
              </button>
            )
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 rounded-full bg-white text-[#600A20] border border-[#800E2B]/30 text-xs font-extrabold tracking-wide hover:bg-[#600A20] hover:text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#E91E63]" />
              <span>Login / Sign In</span>
            </button>
          )}

          <button
            onClick={onOpenAppointmentModal}
            className="px-3.5 py-2 rounded-full border border-[#600A20] text-[#600A20] text-xs font-bold tracking-wide hover:bg-[#600A20] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Studio</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={currentUser.role === 'admin' ? onOpenAdminPanel : onOpenUserPanel}
              className="p-2 rounded-full bg-[#FCE4EC] text-[#800E2B] border border-[#E91E63]/30 text-xs font-bold flex items-center gap-1"
            >
              {currentUser.role === 'admin' ? <Crown className="w-4 h-4 text-[#D4AF37]" /> : <User className="w-4 h-4 text-[#E91E63]" />}
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="p-2 rounded-full bg-[#FFF3F6] text-[#600A20] border border-[#800E2B]/20 text-xs font-bold flex items-center gap-1"
            >
              <User className="w-4 h-4 text-[#E91E63]" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-[#420614] hover:text-[#E91E63] transition-colors rounded-lg border border-[#800E2B]/20"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF3F6] border-b border-[#800E2B]/20 px-6 py-6 shadow-xl space-y-4">
          <a
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-base font-serif font-bold text-[#420614] hover:text-[#E91E63] whitespace-nowrap"
          >
            <ShoppingBag className="w-5 h-5 text-[#D81B60]" />
            <span>Catalog</span>
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCustomBuilder();
            }}
            className="w-full text-left py-2 text-base font-serif font-bold text-[#420614] hover:text-[#E91E63] flex items-center justify-between whitespace-nowrap"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#D81B60]" />
              <span>Custom Builder</span>
            </div>
            <span className="text-xs font-sans bg-[#E91E63] text-white px-2 py-0.5 rounded-full font-bold">Popular</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSizingGuide();
            }}
            className="w-full text-left py-2 text-base font-serif font-bold text-[#420614] hover:text-[#E91E63] flex items-center gap-2.5 whitespace-nowrap"
          >
            <Ruler className="w-5 h-5 text-[#D81B60]" />
            <span>Sizing Guide</span>
          </button>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-base font-serif font-bold text-[#420614] hover:text-[#E91E63] whitespace-nowrap"
          >
            <Star className="w-5 h-5 text-[#D81B60]" />
            <span>Reviews</span>
          </a>
          <a
            href="#location"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2 text-base font-serif font-bold text-[#420614] hover:text-[#E91E63] whitespace-nowrap"
          >
            <MapPin className="w-5 h-5 text-[#D81B60]" />
            <span>Ludhiana Studio</span>
          </a>

          <div className="pt-4 border-t border-[#800E2B]/15 space-y-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser.role === 'admin') onOpenAdminPanel();
                  else onOpenUserPanel();
                }}
                className="w-full py-3 rounded-xl bg-[#420614] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2"
              >
                {currentUser.role === 'admin' ? <Crown className="w-4 h-4 text-[#D4AF37]" /> : <User className="w-4 h-4 text-[#E91E63]" />}
                <span>{currentUser.role === 'admin' ? 'Open Admin Portal' : `Open Account (${currentUser.name})`}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-3 rounded-xl bg-vibrant-maroon text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#E91E63]" />
                <span>Client & Admin Login</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointmentModal();
              }}
              className="w-full py-3 rounded-xl border border-[#600A20] text-[#600A20] font-bold text-xs tracking-wide flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Studio Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

