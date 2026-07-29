import React, { useState } from 'react';
import { X, Ruler, CheckCircle2, Sparkles, HelpCircle, Shield, Droplets } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';

interface SizingPrepGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const SizingPrepGuide: React.FC<SizingPrepGuideProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'size-chart' | 'how-to-measure' | 'application-prep'>('size-chart');

  if (isModal && !isOpen) return null;

  const content = (
    <div className="space-y-8">
      {/* Tab Switchers */}
      <div className="flex border-b border-[#E8DFC8] gap-4 sm:gap-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('size-chart')}
          className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'size-chart'
              ? 'border-[#B8860B] text-[#1A1817]'
              : 'border-transparent text-[#1A1817]/50 hover:text-[#1A1817]'
          }`}
        >
          1. Size Chart (XS - L)
        </button>

        <button
          onClick={() => setActiveTab('how-to-measure')}
          className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'how-to-measure'
              ? 'border-[#B8860B] text-[#1A1817]'
              : 'border-transparent text-[#1A1817]/50 hover:text-[#1A1817]'
          }`}
        >
          2. Tape & Ruler Method
        </button>

        <button
          onClick={() => setActiveTab('application-prep')}
          className={`pb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
            activeTab === 'application-prep'
              ? 'border-[#B8860B] text-[#1A1817]'
              : 'border-transparent text-[#1A1817]/50 hover:text-[#1A1817]'
          }`}
        >
          3. Prep & 5x Reusability
        </button>
      </div>

      {/* Tab 1: Size Chart Table */}
      {activeTab === 'size-chart' && (
        <div className="space-y-6">
          <p className="text-xs sm:text-sm text-[#1A1817]/80 leading-relaxed">
            Measure the widest part of your natural nail bed in millimeters (mm). Match your 5 fingers (Thumb, Index, Middle, Ring, Pinky) to our standard sizing presets below:
          </p>

          <div className="overflow-x-auto border border-[#E8DFC8] rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs text-[#1A1817]">
              <thead className="bg-[#1A1817] text-[#FAF7F2] font-serif text-sm uppercase">
                <tr>
                  <th className="p-3.5">Size Preset</th>
                  <th className="p-3.5">Thumb</th>
                  <th className="p-3.5">Index</th>
                  <th className="p-3.5">Middle</th>
                  <th className="p-3.5">Ring</th>
                  <th className="p-3.5">Pinky</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                <tr className="hover:bg-[#FAF7F2]">
                  <td className="p-3.5 font-bold text-[#B8860B]">XS (Petite)</td>
                  <td className="p-3.5">14 mm</td>
                  <td className="p-3.5">11 mm</td>
                  <td className="p-3.5">12 mm</td>
                  <td className="p-3.5">11 mm</td>
                  <td className="p-3.5">8 mm</td>
                </tr>
                <tr className="hover:bg-[#FAF7F2]">
                  <td className="p-3.5 font-bold text-[#B8860B]">S (Small)</td>
                  <td className="p-3.5">15 mm</td>
                  <td className="p-3.5">12 mm</td>
                  <td className="p-3.5">13 mm</td>
                  <td className="p-3.5">12 mm</td>
                  <td className="p-3.5">9 mm</td>
                </tr>
                <tr className="hover:bg-[#FAF7F2] bg-[#FAF7F2]/50">
                  <td className="p-3.5 font-bold text-[#B8860B]">M (Medium - Most Popular)</td>
                  <td className="p-3.5 font-semibold">16 mm</td>
                  <td className="p-3.5 font-semibold">13 mm</td>
                  <td className="p-3.5 font-semibold">14 mm</td>
                  <td className="p-3.5 font-semibold">13 mm</td>
                  <td className="p-3.5 font-semibold">10 mm</td>
                </tr>
                <tr className="hover:bg-[#FAF7F2]">
                  <td className="p-3.5 font-bold text-[#B8860B]">L (Large)</td>
                  <td className="p-3.5">17 mm</td>
                  <td className="p-3.5">14 mm</td>
                  <td className="p-3.5">15 mm</td>
                  <td className="p-3.5">14 mm</td>
                  <td className="p-3.5">11 mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#1A1817]">Between sizes or have unique finger widths?</p>
              <p className="text-[#1A1817]/70">
                Choose <span className="font-bold">Custom Size</span> in our builder or send us a quick photo of your hand next to a coin on WhatsApp — our nail artists will select exact matching tips!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: How to Measure */}
      {activeTab === 'how-to-measure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1817] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-serif font-bold text-base text-[#1A1817]">Clear Tape Method</h4>
              <p className="text-xs text-[#1A1817]/70">
                Place a strip of clear tape horizontally across the widest curve of your natural nail bed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1817] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-serif font-bold text-base text-[#1A1817]">Mark Sidewalls</h4>
              <p className="text-xs text-[#1A1817]/70">
                Use a fine pen to mark the left and right edges where your nail meets the skin fold (sidewalls).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFC8] space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#1A1817] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-serif font-bold text-base text-[#1A1817]">Measure in MM</h4>
              <p className="text-xs text-[#1A1817]/70">
                Remove the tape, press it flat onto a ruler, and count the distance between marks in millimeters (mm).
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#1A1817] text-[#FAF7F2] rounded-2xl border border-[#B8860B]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-serif font-bold text-base text-[#D4AF37]">Need Sizing Help on WhatsApp?</p>
              <p className="text-xs text-white/70">Send us a photo of your tape measurements for instant verification.</p>
            </div>
            <a
              href={buildWhatsAppUrl('Hello Pearl & Polishh! I need help verifying my nail sizes from my tape measurements.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba5a] transition-colors whitespace-nowrap"
            >
              Ask WhatsApp Concierge
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Application & Prep */}
      {activeTab === 'application-prep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Glue Application */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFC8] space-y-3">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Shield className="w-5 h-5" />
                <h4 className="font-serif font-bold text-lg text-[#1A1817]">Long Wear (2 - 3 Weeks)</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#1A1817]/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Push back cuticles gently with included wooden stick.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Buff shine off natural nail bed with included mini buffer block.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Wipe dust off with alcohol pad to ensure oil-free surface.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Apply a pea drop of salon glue to both natural nail and press-on back. Press firmly for 20 seconds at a 45° angle.</span>
                </li>
              </ul>
            </div>

            {/* Sticky Tab Application */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFC8] space-y-3">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Droplets className="w-5 h-5" />
                <h4 className="font-serif font-bold text-lg text-[#1A1817]">Weekend Wear (3 - 7 Days)</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#1A1817]/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Follow standard cuticle push and alcohol prep steps above.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Select matching size adhesive sticky tab from kit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Peel backing film, press onto natural nail, then align press-on.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <span>Allows 100% damage-free, quick removal for changing looks often!</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Removal Tips */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC8] space-y-2">
            <h4 className="font-serif font-bold text-sm text-[#1A1817]">Safe Removal & Reusability Tip (Up to 5x)</h4>
            <p className="text-xs text-[#1A1817]/70 leading-relaxed">
              Soak fingers in warm water mixed with a drop of liquid soap and cuticle oil for 10-15 minutes. The press-ons will gently pop off without damaging your natural nail plate or dulling the topcoat artwork. Store them back in your Pearl & Polishh luxury velvet pouch!
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DFC8] p-6 sm:p-8 relative shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#B8860B]" />
              <h3 className="font-serif text-2xl font-bold text-[#1A1817]">
                Sizing & Application Guide
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8DFC8] text-[#1A1817] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="sizing-guide" className="py-20 bg-[#FAF7F2] border-t border-[#E8DFC8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A1817]/5 border border-[#B8860B]/20 text-xs font-semibold text-[#B8860B] uppercase tracking-widest">
            <Ruler className="w-3.5 h-3.5" />
            <span>Precision Fit Guarantee</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">
            Interactive Sizing & Prep Guide
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1817]/70 max-w-xl mx-auto">
            Find your perfect size in minutes or learn how to apply your custom press-ons for 3 weeks of wear.
          </p>
        </div>

        {content}
      </div>
    </section>
  );
};
