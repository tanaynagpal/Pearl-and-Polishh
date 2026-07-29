import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, MessageCircle, Instagram, Mail, Calendar, Navigation, Sparkles } from 'lucide-react';
import { buildWhatsAppUrl, STUDIO_INSTAGRAM_URL } from '../data/products';
import { getStoredStudioSettings } from '../data/storage';
import { StudioSettings } from '../types';

interface LocationContactSectionProps {
  onOpenAppointmentModal: () => void;
}

export const LocationContactSection: React.FC<LocationContactSectionProps> = ({
  onOpenAppointmentModal,
}) => {
  const [settings, setSettings] = useState<StudioSettings>(getStoredStudioSettings());

  useEffect(() => {
    setSettings(getStoredStudioSettings());
  }, []);

  const exactAddress = settings.address || '44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015';
  const mapSearchUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(exactAddress)}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(exactAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  
  const studioWhatsAppUrl = buildWhatsAppUrl(
    `Hello ${settings.studioName}! I have a question regarding studio directions, opening hours, or booking.`,
    settings.phoneWhatsApp
  );

  return (
    <section id="location" className="py-20 bg-[#FFF3F6] relative border-t border-[#800E2B]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E91E63]/30 text-xs font-bold text-[#E91E63] uppercase tracking-widest shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Nail Studio & Contact</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#420614]">
            Visit Studio or Get in Touch
          </h2>

          <p className="text-sm sm:text-base text-[#600A20]/80">
            Our studio offers 1-on-1 Russian gel manicures, builder gel extensions, and in-person press-on fitting consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Contact Details & Hours */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#800E2B]/15 shadow-md flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              <div className="border-b border-[#800E2B]/10 pb-4">
                <h3 className="font-serif text-2xl font-bold text-[#420614]">
                  {settings.studioName && settings.studioName !== 'Pearl & Polish' ? settings.studioName : 'Pearl & Polishh'}
                </h3>
                <p className="text-xs text-[#E91E63] font-bold uppercase tracking-wider mt-0.5">
                  {settings.tagline}
                </p>
              </div>

              {/* Address Box */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF3F6] border border-[#800E2B]/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#E91E63]" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#420614] uppercase tracking-wider">Studio Address</p>
                  <p className="text-[#600A20] leading-relaxed">{settings.address}</p>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#E91E63] font-bold hover:underline pt-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Google Maps Directions &rarr;</span>
                  </a>
                </div>
              </div>

              {/* Opening Hours Box */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF3F6] border border-[#800E2B]/15 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#E91E63]" />
                </div>
                <div className="text-xs space-y-1.5 w-full">
                  <p className="font-bold text-[#420614] uppercase tracking-wider">Opening Hours</p>
                  <div className="space-y-1 text-[#600A20]">
                    <div className="flex justify-between border-b border-[#800E2B]/10 pb-1">
                      <span>Monday – Friday:</span>
                      <span className="font-bold text-[#420614]">{settings.openingHoursWeekdays}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#800E2B]/10 pb-1">
                      <span>Saturday:</span>
                      <span className="font-bold text-[#420614]">{settings.openingHoursSaturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-bold text-[#E91E63]">{settings.openingHoursSunday}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF3F6] border border-[#800E2B]/15 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#E91E63]" />
                </div>
                <div className="text-xs space-y-2">
                  <p className="font-bold text-[#420614] uppercase tracking-wider">Direct Channels</p>
                  <div className="space-y-1 text-[#600A20]">
                    <p className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp: {settings.phoneWhatsApp}</span>
                    </p>
                    <a
                      href={STUDIO_INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-[#E91E63] transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                      <span>Instagram: {settings.instagram}</span>
                    </a>
                    <a
                      href={`mailto:${settings.email}`}
                      className="flex items-center gap-2 hover:text-[#E91E63] transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#E91E63]" />
                      <span>Email: {settings.email}</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#800E2B]/10">
              <button
                onClick={onOpenAppointmentModal}
                className="w-full py-3.5 rounded-2xl bg-vibrant-maroon text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book In-Studio Appointment</span>
              </button>

              <a
                href={studioWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Right Column: Embedded Google Map */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#800E2B]/15 overflow-hidden shadow-md min-h-[400px] relative flex flex-col">
            <div className="bg-[#420614] text-white p-4 text-xs font-semibold flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Atelier Location Map</span>
              </div>
              <span className="text-[#D4AF37] uppercase tracking-wider text-[10px] font-bold">Ludhiana Studio</span>
            </div>

            <div className="flex-1 w-full h-full min-h-[360px] relative">
              <iframe
                title="Pearl & Polishh Studio Map Location"
                src={embedMapUrl}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

