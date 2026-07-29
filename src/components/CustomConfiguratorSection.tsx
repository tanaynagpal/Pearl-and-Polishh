import React, { useState } from 'react';
import { CustomPressOnState, PressOnShape, PressOnSize, PressOnFinish } from '../types';
import { buildWhatsAppUrl } from '../data/products';
import { Sparkles, Ruler, Check, MessageCircle, RefreshCw, Info, HelpCircle } from 'lucide-react';

interface CustomConfiguratorProps {
  onOpenSizingGuide: () => void;
}

export const CustomConfiguratorSection: React.FC<CustomConfiguratorProps> = ({
  onOpenSizingGuide,
}) => {
  const [config, setConfig] = useState<CustomPressOnState>({
    shape: 'Medium Almond',
    length: 'Medium',
    sizePreset: 'S',
    customSizes: {
      leftThumb: 15,
      leftIndex: 12,
      leftMiddle: 13,
      leftRing: 12,
      leftPinky: 9,
      rightThumb: 15,
      rightIndex: 12,
      rightMiddle: 13,
      rightRing: 12,
      rightPinky: 9,
    },
    baseColor: 'Translucent Rose Nude',
    finish: 'Glazed Chrome',
    artComplexity: 'Intricate / Full 3D Charms',
    notes: 'I would like subtle pearl charms on the ring fingers and gold chrome French tips.',
    clientName: '',
  });

  // Calculate price estimate based on complexity & length
  const calculateEstimate = () => {
    let base = 1200;
    if (config.artComplexity === 'Moderate / Accent Nails') base = 1450;
    if (config.artComplexity === 'Intricate / Full 3D Charms') base = 1850;
    if (config.artComplexity === 'Bridal / Sculpted Pearls') base = 2450;

    if (config.length === 'Long') base += 100;
    if (config.length === 'Extra Long') base += 200;
    if (config.finish === 'Glazed Chrome' || config.finish === 'Cat-Eye Shimmer') base += 100;

    return base;
  };

  const estimatedPrice = calculateEstimate();

  const handleCustomSizeChange = (finger: keyof typeof config.customSizes, val: number) => {
    setConfig((prev) => ({
      ...prev,
      customSizes: {
        ...prev.customSizes,
        [finger]: val,
      },
    }));
  };

  const getWhatsAppQuery = () => {
    const sizeDetails =
      config.sizePreset === 'Custom'
        ? `Custom Sizes (mm): Thumb:${config.customSizes.leftThumb}, Index:${config.customSizes.leftIndex}, Middle:${config.customSizes.leftMiddle}, Ring:${config.customSizes.leftRing}, Pinky:${config.customSizes.leftPinky}`
        : `Preset Size: ${config.sizePreset}`;

    const text = `Hello Pearl & Polishh! 💅\n\nI created a bespoke press-on set design using your custom builder:\n\n• Client Name: ${config.clientName || 'Valued Guest'}\n• Shape: ${config.shape}\n• Length: ${config.length}\n• Sizing: ${sizeDetails}\n• Base Shade: ${config.baseColor}\n• Finish: ${config.finish}\n• Art Level: ${config.artComplexity}\n• Notes/Idea: ${config.notes || 'None'}\n\nEstimated Quote: ₹${estimatedPrice}\n\nPlease review my custom request and guide me on finalizing my order!`;

    return buildWhatsAppUrl(text);
  };

  const shapes: PressOnShape[] = [
    'Short Almond',
    'Medium Almond',
    'Long Coffin',
    'Short Square',
    'Medium Coffin',
    'Stiletto',
  ];

  const lengths: ('Short' | 'Medium' | 'Long' | 'Extra Long')[] = ['Short', 'Medium', 'Long', 'Extra Long'];

  const sizes: PressOnSize[] = ['XS', 'S', 'M', 'L', 'Custom'];

  const baseColors = [
    'Translucent Rose Nude',
    'Milky Pearl White',
    'Champagne Beige',
    'French Ombré Blush',
    'Soft Lavender Nude',
    'Gothic Velvet Black',
  ];

  const finishes: PressOnFinish[] = [
    'Glossy Topcoat',
    'Glazed Chrome',
    'Cat-Eye Shimmer',
    '3D Gel & Pearls',
    'Velvety Matte',
  ];

  const artLevels = [
    { title: 'Minimal / Sheer', price: '₹1,200', desc: 'Solid luxury gel color, clean nude or sheer glow' },
    { title: 'Moderate / Accent Nails', price: '₹1,450', desc: '2-4 accent nails with French tips, gold foil or line art' },
    { title: 'Intricate / Full 3D Charms', price: '₹1,850', desc: 'All nails decorated with pearls, gold zari filigree & 3D art' },
    { title: 'Bridal / Sculpted Pearls', price: '₹2,450', desc: 'Full custom bridal art, aurora lace, and royal baroque pearls' },
  ] as const;

  return (
    <section id="custom-builder" className="py-20 bg-[#FFF3F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E91E63]/30 text-xs font-bold text-[#E91E63] uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Interactive Custom Atelier</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#420614]">
            Custom Press-On Set Builder
          </h2>

          <p className="text-sm sm:text-base text-[#600A20]/80">
            Tailor every detail of your press-on nails from length and shape to base shade and 3D embellishments. Get an instant quote and send your custom spec sheet directly to WhatsApp.
          </p>
        </div>

        {/* Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form Column */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#800E2B]/15 shadow-lg space-y-8">
            
            {/* Step 1: Shape & Length */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#420614] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#420614] text-white text-xs flex items-center justify-center font-sans">1</span>
                  Select Shape & Length
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#420614]">Nail Shape:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {shapes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setConfig({ ...config, shape: s })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                        config.shape === s
                          ? 'border-[#E91E63] bg-[#FFF3F6] text-[#420614] shadow-xs'
                          : 'border-[#800E2B]/15 bg-white text-[#600A20] hover:border-[#E91E63]/50'
                      }`}
                    >
                      <span>{s}</span>
                      {config.shape === s && <Check className="w-4 h-4 text-[#E91E63]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-[#420614]">Nail Length:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {lengths.map((l) => (
                    <button
                      key={l}
                      onClick={() => setConfig({ ...config, length: l })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        config.length === l
                          ? 'border-[#420614] bg-[#420614] text-white'
                          : 'border-[#800E2B]/15 bg-white text-[#600A20] hover:border-[#E91E63]/50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-[#800E2B]/15" />

            {/* Step 2: Sizing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#420614] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#420614] text-white text-xs flex items-center justify-center font-sans">2</span>
                  Finger Sizing
                </h3>
                <button
                  onClick={onOpenSizingGuide}
                  className="text-xs font-bold text-[#E91E63] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>How to measure?</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setConfig({ ...config, sizePreset: sz })}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      config.sizePreset === sz
                        ? 'border-[#E91E63] bg-[#E91E63] text-white shadow-xs'
                        : 'border-[#800E2B]/15 bg-white text-[#600A20] hover:border-[#E91E63]/50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Custom Millimeters Inputs if Custom Size selected */}
              {config.sizePreset === 'Custom' && (
                <div className="p-4 rounded-2xl bg-[#FFF3F6] border border-[#800E2B]/20 space-y-3">
                  <p className="text-xs font-bold text-[#420614] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E91E63]" />
                    <span>Enter Width in Millimeters (mm):</span>
                  </p>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div>
                      <label className="text-[10px] font-bold text-[#600A20] block mb-1">Thumb</label>
                      <input
                        type="number"
                        value={config.customSizes.leftThumb}
                        onChange={(e) => handleCustomSizeChange('leftThumb', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#600A20] block mb-1">Index</label>
                      <input
                        type="number"
                        value={config.customSizes.leftIndex}
                        onChange={(e) => handleCustomSizeChange('leftIndex', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#600A20] block mb-1">Middle</label>
                      <input
                        type="number"
                        value={config.customSizes.leftMiddle}
                        onChange={(e) => handleCustomSizeChange('leftMiddle', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#600A20] block mb-1">Ring</label>
                      <input
                        type="number"
                        value={config.customSizes.leftRing}
                        onChange={(e) => handleCustomSizeChange('leftRing', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#600A20] block mb-1">Pinky</label>
                      <input
                        type="number"
                        value={config.customSizes.leftPinky}
                        onChange={(e) => handleCustomSizeChange('leftPinky', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#800E2B]/15" />

            {/* Step 3: Base Shade & Finish */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#420614] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#420614] text-white text-xs flex items-center justify-center font-sans">3</span>
                Base Shade & Texture Finish
              </h3>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#420614]">Base Polish Color:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {baseColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setConfig({ ...config, baseColor: col })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        config.baseColor === col
                          ? 'border-[#E91E63] bg-[#FFF3F6] text-[#420614]'
                          : 'border-[#800E2B]/15 bg-white text-[#600A20]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-[#420614]">Finish Effect:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {finishes.map((f) => (
                    <button
                      key={f}
                      onClick={() => setConfig({ ...config, finish: f })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        config.finish === f
                          ? 'border-[#420614] bg-[#420614] text-white'
                          : 'border-[#800E2B]/15 bg-white text-[#600A20]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-[#800E2B]/15" />

            {/* Step 4: Art Complexity */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#420614] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#420614] text-white text-xs flex items-center justify-center font-sans">4</span>
                Art Complexity Tier
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artLevels.map((lvl) => (
                  <button
                    key={lvl.title}
                    onClick={() => setConfig({ ...config, artComplexity: lvl.title as any })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      config.artComplexity === lvl.title
                        ? 'border-[#E91E63] bg-[#FFF3F6] shadow-sm'
                        : 'border-[#800E2B]/15 bg-white hover:border-[#E91E63]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#420614]">{lvl.title}</span>
                      <span className="font-serif font-bold text-sm text-[#E91E63]">{lvl.price}</span>
                    </div>
                    <p className="text-[11px] text-[#600A20]/70 leading-tight">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Notes & Name */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#420614] block">
                Custom Notes & Pinterest Inspiration Description:
              </label>
              <textarea
                rows={3}
                placeholder="Describe your design vision or paste photo references (e.g., 'Maroon velvet French tips with gold foil line art on index fingers')..."
                value={config.notes}
                onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                className="w-full p-3 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs text-[#420614] focus:outline-none focus:border-[#E91E63]"
              />

              <div className="pt-2">
                <label className="text-xs font-bold text-[#420614] block mb-1">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={config.clientName}
                  onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                  className="w-full p-3 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs text-[#420614] focus:outline-none focus:border-[#E91E63]"
                />
              </div>
            </div>

          </div>

          {/* Live Summary & WhatsApp Spec Sheet Box */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-[#420614] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 shadow-2xl space-y-6">
              
              <div className="border-b border-white/20 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                    Bespoke Summary
                  </span>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-2xl font-bold mt-1">Your Custom Spec</h3>
              </div>

              <div className="space-y-3 text-xs text-white/90">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Shape:</span>
                  <span className="font-bold text-white">{config.shape}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Length:</span>
                  <span className="font-bold text-white">{config.length}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Sizing:</span>
                  <span className="font-bold text-[#D4AF37]">{config.sizePreset}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Base Shade:</span>
                  <span className="font-bold text-white">{config.baseColor}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Finish:</span>
                  <span className="font-bold text-white">{config.finish}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/70">Art Level:</span>
                  <span className="font-bold text-white line-clamp-1">{config.artComplexity.split('/')[0]}</span>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 bg-white/10 rounded-2xl border border-[#D4AF37]/30 space-y-1">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">
                  Estimated Quote:
                </p>
                <p className="font-serif text-3xl font-bold text-[#D4AF37]">
                  ₹{estimatedPrice}
                  <span className="text-xs font-sans text-white/70 font-normal ml-2">INR</span>
                </p>
                <p className="text-[10px] text-white/60">
                  Includes full application prep kit & luxury gift pouch.
                </p>
              </div>

              <a
                href={getWhatsAppQuery()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-vibrant-pink-gradient text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Send Custom Spec to WhatsApp</span>
              </a>

              <p className="text-[10px] text-center text-white/70 leading-tight">
                Our lead nail artist will review your details, confirm sizes, and finalize your custom set via WhatsApp!
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

