import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NailProduct, ProductCategory, PressOnShape } from '../types';
import { buildWhatsAppUrl } from '../data/products';
import { MessageCircle, Search, Filter, Sparkles, Info, Star, Share2 } from 'lucide-react';
import { ShareProductModal } from './ShareProductModal';

interface ProductCatalogProps {
  onSelectProduct: (product: NailProduct) => void;
  onOpenCustomBuilder: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  onOpenCustomBuilder,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShape, setSelectedShape] = useState<string>('All');
  const [selectedProductShape, setSelectedProductShape] = useState<{ [key: string]: string }>({});
  const [selectedProductLength, setSelectedProductLength] = useState<{ [key: string]: string }>({});
  const [sharingProduct, setSharingProduct] = useState<NailProduct | null>(null);

  const [productsList, setProductsList] = useState<NailProduct[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts();
        setProductsList(res.products || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
  
    fetchProducts();
  }, []);
  const categories = ['All', 'Press-Ons', '3D Art', 'Bridal', 'Chrome', 'Gel Extensions', 'Gel Polish'];

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory =
      activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesShape =
      selectedShape === 'All' ||
      (product.shapeOptions && product.shapeOptions.some((s) => s.toLowerCase().includes(selectedShape.toLowerCase())));

    return matchesCategory && matchesSearch && matchesShape;
  });

  const handleShapeChange = (productId: string, shape: string) => {
    setSelectedProductShape((prev) => ({ ...prev, [productId]: shape }));
  };

  const handleLengthChange = (productId: string, length: string) => {
    setSelectedProductLength((prev) => ({ ...prev, [productId]: length }));
  };

  const getProductWhatsAppUrl = (product: NailProduct) => {
    const chosenShape = selectedProductShape[getProductId(product)] || (product.shapeOptions ? product.shapeOptions[0] : 'Default');
    const chosenLength = selectedProductLength[getProductId(product)] || (product.lengthOptions ? product.lengthOptions[0] : 'Medium');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const productUrl = `${origin}${pathname}?product=${encodeURIComponent(getProductId(product))}`;

    const message = `Hello Pearl & Polishh! 💅\n\nI am interested in ordering:\n• Item: ${product.title}\n• Price: ₹${product.price}\n• Shape Choice: ${chosenShape}\n• Length Choice: ${chosenLength}\n• Product Link: ${productUrl}\n\nPlease let me know the estimated delivery and help me confirm my sizes!`;

    return buildWhatsAppUrl(message);
  };


const getProductId = (product: NailProduct): string => {
  return product._id || product.id;
};

const getProductImage = (product: NailProduct): string | undefined => {
  return product.images?.[0] || product.image || undefined;
};


  return (
    <section id="catalog" className="py-20 bg-[#FFF3F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E91E63]/30 text-xs font-bold text-[#E91E63] uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>The Pearl & Polishh Collection</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#420614]">
            Vibrant Gallery & Press-On Atelier
          </h2>

          <p className="text-sm sm:text-base text-[#600A20]/80">
            Browse our signature gel creations, maroon velvets, and 3D sculpted sets. Every design connects directly to WhatsApp for dynamic order placement.
          </p>
        </div>

        {/* Category Tabs & Search Controls */}
        <div className="space-y-6 mb-10">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-vibrant-maroon text-white shadow-md border border-[#D4AF37]/40'
                    : 'bg-white border border-[#800E2B]/20 text-[#600A20] hover:bg-[#FCE4EC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Shape Dropdown Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-white p-3 rounded-2xl border border-[#800E2B]/20 shadow-xs">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E91E63]" />
              <input
                type="text"
                placeholder="Search by keyword (e.g. Maroon, Velvet, Magenta, Pearl)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs text-[#420614] placeholder-[#600A20]/40 bg-transparent focus:outline-none font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-[#800E2B]/15 pt-2 sm:pt-0">
              <Filter className="w-4 h-4 text-[#E91E63] shrink-0" />
              <span className="text-xs font-bold text-[#420614] shrink-0">Nail Shape:</span>
              <select
                value={selectedShape}
                onChange={(e) => setSelectedShape(e.target.value)}
                className="bg-[#FFF3F6] text-xs text-[#420614] font-bold border border-[#800E2B]/20 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="All">All Shapes</option>
                <option value="Almond">Almond</option>
                <option value="Coffin">Coffin</option>
                <option value="Square">Square</option>
                <option value="Stiletto">Stiletto</option>
                <option value="Oval">Oval</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#800E2B]/15 space-y-4">
            <p className="font-serif text-xl text-[#420614]">No nail sets match your search filter.</p>
            <p className="text-xs text-[#600A20]/70">Try searching for "Maroon", "Velvet", or "Pink", or reset your filters.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
                setSelectedShape('All');
              }}
              className="px-4 py-2 rounded-full bg-vibrant-maroon text-white text-xs font-bold uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((product,index) => {
              const currentShape =
              selectedProductShape[getProductId(product)] ||
              (product.shapeOptions ? product.shapeOptions[0] : 'Short Almond');
            
            const currentLength =
              selectedProductLength[getProductId(product)] ||
              (product.lengthOptions ? product.lengthOptions[0] : 'Medium');

              return (
                <div
                  key={`${getProductId(product)}-${index}`}
                  className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#800E2B]/15 hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square sm:aspect-4/3 overflow-hidden bg-[#FFF3F6]">
                    <img
                      src={getProductImage(product)}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Badge Overlays */}
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-wrap gap-1">
                      {product.features?.includes('Bestseller') && (
                        <span className="bg-[#420614] text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border border-[#D4AF37]/50 shadow-xs">
                          Bestseller
                        </span>
                      )}
                      {product.features?.includes('New') && (
                        <span className="bg-[#E91E63] text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-xs">
                          New
                        </span>
                      )}
                      <span className="bg-white/95 backdrop-blur-xs text-[#420614] text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border border-[#800E2B]/20 hidden xs:inline-block">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingProduct(product);
                        }}
                        className="bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-md hover:bg-[#E91E63] hover:text-white transition-colors text-[#420614] cursor-pointer"
                        title="Share Product"
                      >
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-md hover:bg-[#420614] hover:text-white transition-colors text-[#420614] cursor-pointer"
                        title="View Details"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-[#E91E63]">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#E91E63]" />
                          <span className="font-bold">{product.rating}</span>
                          <span className="text-[#600A20]/50 hidden sm:inline">({product.reviewCount})</span>
                        </div>
                        <span className="font-serif text-xs sm:text-lg lg:text-2xl font-bold text-[#420614]">
                          ₹{product.price}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-serif text-xs sm:text-base lg:text-xl font-bold text-[#420614] hover:text-[#E91E63] transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.title}
                      </h3>

                      <p className="text-[10px] sm:text-xs text-[#600A20]/80 line-clamp-1 sm:line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Shape & Length Selectors */}
                    {product.shapeOptions && product.lengthOptions && (
                      <div className="space-y-1.5 pt-1.5 border-t border-[#800E2B]/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] sm:text-[11px] gap-1">
                          <span className="font-bold text-[#420614] shrink-0">Shape:</span>
                          <div className="flex flex-wrap gap-0.5 sm:gap-1">
                            {product.shapeOptions.slice(0, 3).map((shape) => (
                              <button
                                key={shape}
                                onClick={() => handleShapeChange(getProductId(product), shape)}
                                className={`px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded transition-colors cursor-pointer ${
                                  currentShape === shape
                                    ? 'bg-[#420614] text-white font-bold'
                                    : 'bg-[#FFF3F6] text-[#600A20] hover:bg-[#FCE4EC]'
                                }`}
                              >
                                {shape}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] sm:text-[11px] gap-1">
                          <span className="font-bold text-[#420614] shrink-0">Length:</span>
                          <div className="flex flex-wrap gap-0.5 sm:gap-1">
                            {product.lengthOptions.map((length) => (
                              <button
                                key={length}
                                onClick={() => handleLengthChange(getProductId(product), length)}
                                className={`px-1.5 py-0.5 text-[8px] sm:text-[10px] rounded transition-colors cursor-pointer ${
                                  currentLength === length
                                    ? 'bg-[#E91E63] text-white font-bold'
                                    : 'bg-[#FFF3F6] text-[#600A20] hover:bg-[#FCE4EC]'
                                }`}
                              >
                                {length}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button: Order Now */}
                    <div className="pt-1">
                      <a
                        href={getProductWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 sm:py-2.5 px-3 rounded-full bg-[#420614] hover:bg-[#600A20] text-white text-[11px] sm:text-xs font-bold tracking-wide border border-[#D4AF37]/40 hover:border-[#D4AF37]/70 shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 group/btn"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366] group-hover/btn:scale-110 transition-transform shrink-0" />
                        <span className="truncate">Order Now</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Share Modal */}
        <ShareProductModal
          product={sharingProduct}
          onClose={() => setSharingProduct(null)}
        />

        {/* Custom Order Banner */}
        <div className="mt-16 bg-vibrant-maroon text-white rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E91E63] text-white text-xs font-bold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Bespoke Design Atelier</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Have a custom design idea or reference photo in mind?
            </h3>

            <p className="text-xs sm:text-sm text-[#FFF3F6]/85 leading-relaxed">
              Our master nail artist recreates any design idea! Use our interactive Custom Builder to pick length, shape, base shade, and art complexity — then send your inquiry straight to WhatsApp.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenCustomBuilder}
                className="px-6 py-3.5 rounded-full bg-vibrant-pink-gradient text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Custom Press-On Configurator</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

