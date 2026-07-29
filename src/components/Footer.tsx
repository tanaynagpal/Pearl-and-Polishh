import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, Instagram, MapPin, Heart, Shield, Mail } from 'lucide-react';
import { buildWhatsAppUrl, STUDIO_INSTAGRAM_URL } from '../data/products';
import { getStoredStudioSettings } from '../data/storage';
import { StudioSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenCustomBuilder: () => void;
  onOpenSizingGuide: () => void;
  onOpenAppointmentModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCustomBuilder,
  onOpenSizingGuide,
  onOpenAppointmentModal,
}) => {
  const [settings, setSettings] = useState<StudioSettings>(getStoredStudioSettings());

  useEffect(() => {
    setSettings(getStoredStudioSettings());
  }, []);

  const directWhatsAppUrl = buildWhatsAppUrl(
    `Hello ${settings.studioName}! I have a question regarding custom press-ons or studio appointments.`,
    settings.phoneWhatsApp
  );

  return (
    <footer className="bg-[#2A040E] text-white pt-16 pb-12 border-t border-[#D4AF37]/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <BrandLogo size="md" lightText={true} />
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Handcrafted salon gel quality, freshwater pearls, and custom 3D art fitted to your exact finger dimensions. Direct ordering and concierge support via WhatsApp.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                title="WhatsApp Direct"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={STUDIO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-[#E91E63] transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#D4AF37] uppercase tracking-wider">
              Bespoke Services
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <a href="#catalog" className="hover:text-[#D4AF37] transition-colors">
                  Shop Press-On Catalog
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenCustomBuilder}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Custom Set Configurator
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizingGuide}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Nail Sizing & Prep Guide
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAppointmentModal}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Book In-Studio Russian Manicure
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#D4AF37] uppercase tracking-wider">
              Studio & Orders
            </h4>
            <div className="space-y-2 text-xs text-white/80">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>WhatsApp: {settings.phoneWhatsApp}</span>
              </p>
              <a
                href={STUDIO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#E91E63] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Instagram: {settings.instagram}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 hover:text-[#E91E63] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Email: {settings.email}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 gap-4">
          <p>© {new Date().getFullYear()} Pearl & Polishh. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Direct WhatsApp Order Strategy</span>
            <span>&bull;</span>
            <span className="text-[#D4AF37]">Pan-India Express Shipping</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
