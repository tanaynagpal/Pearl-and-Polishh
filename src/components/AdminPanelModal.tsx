import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  OrderRecord, 
  AppointmentRecord, 
  NailProduct, 
  ProductCategory, 
  Testimonial, 
  StudioSettings,
  StudioService
} from '../types';
import { api } from '../services/api';
import logoImg from '../assets/logo.jpg';
import { 
  INITIAL_STUDIO_SETTINGS,
  DEFAULT_STUDIO_SERVICES,
  DEFAULT_STUDIO_TIME_SLOTS
} from '../data/storage';
import { buildWhatsAppUrl } from '../data/products';
import { 
  X, Crown, Package, Calendar, Plus, Trash2, Edit, CheckCircle2, MessageCircle, Clock, 
  Search, Filter, TrendingUp, Sparkles, Layers, ShieldCheck, LogOut, RefreshCw, Star, 
  Users, Settings, Image as ImageIcon, MapPin, Check, RotateCcw, UserPlus, Upload, Link, Camera, Cloud
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  adminUser: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
  onCatalogUpdated?: () => void;
  onUserSwitched?: (user: UserProfile) => void;
}

// Image Preset Samples for fast input
const SAMPLE_PRODUCT_IMAGES = [
  { name: 'Burgundy Velvet & Pearls', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Emerald Chrome Waves', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Rose Gold Glazed', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Bridal Lace & Gold', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000' },
  { name: 'Deep Ruby Cat-Eye', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000' },
];

const SAMPLE_AVATARS = [
  { name: 'Client 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { name: 'Client 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
  { name: 'Client 3', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200' },
  { name: 'Client 4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  adminUser,
  onClose,
  onLogout,
  onCatalogUpdated,
  onUserSwitched,
}) => {
  if (!isOpen || !adminUser || adminUser.role !== 'admin') return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'appointments' | 'testimonials' | 'users' | 'settings'>('overview');
  
  // Data states
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [products, setProducts] = useState<NailProduct[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_STUDIO_SETTINGS);
  const [dataLoading, setDataLoading] = useState(false);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [ordRes, aptRes, prodRes, setRes, usrRes] = await Promise.all([
        api.getAllOrders().catch(() => ({ orders: [] })),
        api.getAllAppointments().catch(() => ({ appointments: [] })),
        api.getProducts().catch(() => ({ products: [] })),
        api.getSettings().catch(() => ({ settings: INITIAL_STUDIO_SETTINGS })),
        api.getUsers().catch(() => ({ users: [] })),
      ]);

      if (ordRes.orders) setOrders(ordRes.orders);
      if (aptRes.appointments) setAppointments(aptRes.appointments);
      if (prodRes.products) setProducts(prodRes.products);
      if (setRes.settings) setSettings(setRes.settings);
      if (usrRes.users) setUsers(usrRes.users);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Product Edit / Add state
  const [editingProduct, setEditingProduct] = useState<NailProduct | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('3D Art');
  const [prodPrice, setProdPrice] = useState('1850');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState(SAMPLE_PRODUCT_IMAGES[0].url);
  const [prodBestseller, setProdBestseller] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);

  // File upload refs & handlers for Gallery / Apple Photos / Google Photos
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

const handleProductImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProdImage(previewUrl);

    // Upload the actual file to Cloudinary
    const cloudinaryUrl = await api.uploadImage(file);

    // Replace temporary preview with permanent Cloudinary URL
    setProdImage(cloudinaryUrl);

    URL.revokeObjectURL(previewUrl);
  } catch (error: any) {
    console.error('Product image upload failed:', error);

    setProdImage('');

    alert(error.message || 'Failed to upload product image.');
  } finally {
    // Allow selecting the same file again
    e.target.value = '';
  }
};
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTestAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Order Edit / Add state
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderClient, setNewOrderClient] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderItem, setNewOrderItem] = useState('');
  const [newOrderPrice, setNewOrderPrice] = useState('1850');
  const [newOrderDetails, setNewOrderDetails] = useState('');

  // Appointment Edit / Add state
  const [editingAppointment, setEditingAppointment] = useState<AppointmentRecord | null>(null);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [newAptClient, setNewAptClient] = useState('');
  const [newAptPhone, setNewAptPhone] = useState('');
  const [newAptService, setNewAptService] = useState('Full Set 3D Sculpted Gel Extensions');
  const [newAptDate, setNewAptDate] = useState('2026-08-01');
  const [newAptTime, setNewAptTime] = useState('02:00 PM - 03:30 PM');

  // Testimonial Edit / Add state
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [testAuthor, setTestAuthor] = useState('');
  const [testLocation, setTestLocation] = useState('Ludhiana, Punjab');
  const [testRating, setTestRating] = useState('5');
  const [testComment, setTestComment] = useState('');
  const [testItem, setTestItem] = useState('Maroon Velvet Rose Pearls');
  const [testAvatar, setTestAvatar] = useState(SAMPLE_AVATARS[0].url);

  // Dummy User Edit / Add state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [userVip, setUserVip] = useState<'Velvet Bronze' | 'Rose Gold VIP' | 'Maroon Diamond'>('Rose Gold VIP');

  // Appointment Services & Time Slots manager state
  const [newSvcTitle, setNewSvcTitle] = useState('');
  const [newSvcDuration, setNewSvcDuration] = useState('60 min');
  const [newSvcCategory, setNewSvcCategory] = useState('In-Studio Gel Service');
  const [newTimeSlotInput, setNewTimeSlotInput] = useState('');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcTitle.trim()) return;
    const currentSvcs = settings.appointmentServices && settings.appointmentServices.length > 0
      ? settings.appointmentServices
      : DEFAULT_STUDIO_SERVICES;
    const newSvc: StudioService = {
      id: `svc-${Date.now()}`,
      title: newSvcTitle.trim(),
      duration: newSvcDuration.trim() || '60 min',
      category: newSvcCategory,
    };
    setSettings({
      ...settings,
      appointmentServices: [...currentSvcs, newSvc],
    });
    setNewSvcTitle('');
  };

  const handleDeleteService = (svcId: string) => {
    const currentSvcs = settings.appointmentServices && settings.appointmentServices.length > 0
      ? settings.appointmentServices
      : DEFAULT_STUDIO_SERVICES;
    setSettings({
      ...settings,
      appointmentServices: currentSvcs.filter((s) => s.id !== svcId),
    });
  };

  const handleUpdateServiceField = (svcId: string, field: keyof StudioService, value: string) => {
    const currentSvcs = settings.appointmentServices && settings.appointmentServices.length > 0
      ? settings.appointmentServices
      : DEFAULT_STUDIO_SERVICES;
    setSettings({
      ...settings,
      appointmentServices: currentSvcs.map((s) => s.id === svcId ? { ...s, [field]: value } : s),
    });
  };

  const handleAddTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeSlotInput.trim()) return;
    const currentSlots = settings.appointmentTimeSlots && settings.appointmentTimeSlots.length > 0
      ? settings.appointmentTimeSlots
      : DEFAULT_STUDIO_TIME_SLOTS;
    if (currentSlots.some((s) => s.toLowerCase() === newTimeSlotInput.trim().toLowerCase())) {
      alert('Time slot already exists.');
      return;
    }
    setSettings({
      ...settings,
      appointmentTimeSlots: [...currentSlots, newTimeSlotInput.trim()],
    });
    setNewTimeSlotInput('');
  };

  const handleDeleteTimeSlot = (slotToRemove: string) => {
    const currentSlots = settings.appointmentTimeSlots && settings.appointmentTimeSlots.length > 0
      ? settings.appointmentTimeSlots
      : DEFAULT_STUDIO_TIME_SLOTS;
    setSettings({
      ...settings,
      appointmentTimeSlots: currentSlots.filter((slot) => slot !== slotToRemove),
    });
  };

  // Refresh all state from backend API
  const handleRefresh = async () => {
    await loadData();
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdCategory('3D Art');
    setProdPrice('1850');
    setProdDescription('Handcrafted luxury salon gel press-on set with custom pearls and 3D detailing.');
    setProdImage(SAMPLE_PRODUCT_IMAGES[0].url);
    setProdBestseller(false);
    setProdIsNew(true);
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (p: NailProduct) => {
    setIsAddProductOpen(false);
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdCategory(p.category);
    setProdPrice(p.price.toString());
    setProdDescription(p.description);
    setProdImage(p.images?.[0] || '');
    setProdBestseller(!!p.isBestseller);
    setProdIsNew(!!p.isNew);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice) return;

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, {
          title: prodTitle,
          category: prodCategory,
          price: parseFloat(prodPrice) || 1850,
          description: prodDescription,
          images: [prodImage],
          featured: prodBestseller,
          isNew: prodIsNew,
        });
        setEditingProduct(null);
      } else {
        await api.createProduct({
          title: prodTitle,
          category: prodCategory,
          price: parseFloat(prodPrice) || 1850,
          description: prodDescription || 'Handcrafted luxury salon gel press-on set.',
          images: [prodImage],
          featured: prodBestseller,
        });
        setIsAddProductOpen(false);
      }
      await loadData();
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to remove this product design from the studio catalog?')) {
      try {
        await api.deleteProduct(productId);
        await loadData();
        if (onCatalogUpdated) onCatalogUpdated();
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  // --- ORDER HANDLERS ---
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  // --- APPOINTMENT HANDLERS ---
  const handleAppointmentStatusChange = async (aptId: string, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(aptId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment status.');
    }
  };

  // --- ORDER HANDLERS ---
  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      await api.updateOrderStatus(editingOrder.id, editingOrder.status);
      await loadData();
      setEditingOrder(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update order.');
    }
  };

  const handleAddOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderClient || !newOrderItem) return;
    try {
      await api.createOrder({
        itemTitle: newOrderItem,
        productCategory: '3D Art',
        price: parseFloat(newOrderPrice) || 1850,
        details: newOrderDetails || 'Shape: Medium Almond | Length: Medium',
      });
      await loadData();
      setIsAddOrderOpen(false);
      setNewOrderClient('');
      setNewOrderItem('');
    } catch (err: any) {
      alert(err.message || 'Failed to create order.');
    }
  };

  const handleDeleteOrderClick = (id: string) => {
    if (confirm('Delete this order inquiry record?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  // --- APPOINTMENT HANDLERS ---
  const handleSaveAppointmentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    try {
      await api.updateAppointmentStatus(editingAppointment.id, editingAppointment.status);
      await loadData();
      setEditingAppointment(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment.');
    }
  };

  const handleAddAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptClient) return;
    try {
      await api.createAppointment({
        clientName: newAptClient,
        clientPhone: newAptPhone || '+91 98765 43210',
        serviceName: newAptService,
        date: newAptDate,
        timeSlot: newAptTime,
        notes: '',
      });
      await loadData();
      setIsAddAptOpen(false);
      setNewAptClient('');
    } catch (err: any) {
      alert(err.message || 'Failed to create appointment.');
    }
  };

  const handleDeleteAppointmentClick = (id: string) => {
    if (confirm('Cancel and delete this appointment record?')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  // --- TESTIMONIAL HANDLERS ---
  const handleSaveTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAuthor || !testComment) return;

    if (editingTestimonial) {
      const updatedItem: Testimonial = {
        ...editingTestimonial,
        author: testAuthor,
        location: testLocation,
        rating: parseInt(testRating) || 5,
        comment: testComment,
        itemPurchased: testItem,
        avatarUrl: testAvatar,
      };
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? updatedItem : t));
      setEditingTestimonial(null);
    } else {
      const newItem: Testimonial = {
        id: `t-${Date.now()}`,
        author: testAuthor,
        location: testLocation || 'Ludhiana, Punjab',
        rating: parseInt(testRating) || 5,
        date: 'Just now',
        comment: testComment,
        itemPurchased: testItem || 'Custom 3D Press-On Set',
        verified: true,
        avatarUrl: testAvatar,
      };
      setTestimonials([newItem, ...testimonials]);
      setIsAddTestimonialOpen(false);
    }
  };

  const handleDeleteTestimonialClick = (id: string) => {
    if (confirm('Remove this client testimonial?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  // --- USER HANDLERS ---
  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    const emailClean = userEmail.trim().toLowerCase();

    if (editingUser) {
      const updatedUser: UserProfile = {
        ...editingUser,
        name: userName,
        email: emailClean,
        phone: userPhone,
        role: userRole,
        vipTier: userVip,
      };
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
    } else {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: userName,
        email: emailClean,
        phone: userPhone || '+91 98765 43210',
        role: userRole,
        vipTier: userVip,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setIsAddUserOpen(false);
      setUserName('');
      setUserEmail('');
    }
  };

  const handleSwitchUser = (targetUser: UserProfile) => {
    alert(`Active account set to: ${targetUser.name} (${targetUser.role.toUpperCase()})`);
    if (onUserSwitched) onUserSwitched(targetUser);
  };

  const handleDeleteUserClick = (id: string) => {
    if (confirm('Delete this user account record?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // --- SETTINGS HANDLER ---
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      await loadData();
      alert('Studio branding and settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings.');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.itemTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'In Crafting').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFF3F6] rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-[#800E2B]/20 p-5 sm:p-7 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-[#600A20] hover:text-white transition-colors text-[#600A20] z-10 cursor-pointer border border-[#800E2B]/20 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Admin Bar */}
        <div className="bg-vibrant-maroon p-5 sm:p-6 rounded-2xl text-white relative overflow-hidden shadow-xl border border-[#D4AF37]/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#B8860B] via-[#F3E5AB] to-[#D4AF37] p-[2px] shadow-lg shrink-0 overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#420614] flex items-center justify-center border border-white/20">
                  <img src={logoImg} alt="Studio Brand Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold">Studio Admin Control Panel</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#420614] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Access
                  </span>
                </div>
                <p className="text-xs text-[#FFF3F6]/80 mt-0.5">{settings.studioName} &bull; {settings.address.split(',')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Refresh Studio Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 p-1 bg-white rounded-2xl border border-[#800E2B]/15 shadow-xs">
          {[
            { id: 'overview', label: 'Metrics', icon: TrendingUp },
            { id: 'products', label: `Catalog (${products.length})`, icon: Layers },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'appointments', label: `Bookings (${appointments.length})`, icon: Calendar },
            { id: 'testimonials', label: `Reviews (${testimonials.length})`, icon: Star },
            { id: 'users', label: `Accounts (${users.length})`, icon: Users },
            { id: 'settings', label: 'Studio Info', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingProduct(null);
                  setIsAddProductOpen(false);
                  setEditingOrder(null);
                  setIsAddOrderOpen(false);
                  setEditingAppointment(null);
                  setIsAddAptOpen(false);
                  setEditingTestimonial(null);
                  setIsAddTestimonialOpen(false);
                  setEditingUser(null);
                  setIsAddUserOpen(false);
                }}
                className={`py-2 px-1.5 text-[11px] font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
                  activeTab === tab.id 
                    ? 'bg-vibrant-maroon text-white shadow-xs' 
                    : 'text-[#600A20]/80 hover:text-[#420614] hover:bg-[#FFF3F6]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#D4AF37]' : 'text-[#E91E63]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- TAB 1: OVERVIEW & KPIs --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider">Total Value</span>
                <p className="font-serif text-2xl font-bold text-[#420614]">₹{totalRevenue}</p>
                <span className="text-[10px] text-emerald-600 font-bold">WhatsApp & Studio Leads</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider">Active Crafting</span>
                <p className="font-serif text-2xl font-bold text-[#E91E63]">{activeOrdersCount}</p>
                <span className="text-[10px] text-[#600A20]/70 font-semibold">In production phase</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider">Total Inquiries</span>
                <p className="font-serif text-2xl font-bold text-[#420614]">{orders.length}</p>
                <span className="text-[10px] text-[#600A20]/70 font-semibold">Press-on requests</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-wider">Studio Sessions</span>
                <p className="font-serif text-2xl font-bold text-[#420614]">{appointments.length}</p>
                <span className="text-[10px] text-emerald-600 font-bold">Ludhiana atelier</span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-5 bg-white rounded-2xl border border-[#800E2B]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#420614]">Data & Factory Reset Controls</h4>
                <p className="text-xs text-[#600A20]/70">Restore default demo catalog, reviews, and studio settings anytime.</p>
              </div>

              <button
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl bg-[#FFF3F6] text-[#420614] hover:bg-[#420614] hover:text-white transition-all text-xs font-bold flex items-center gap-2 border border-[#800E2B]/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Backend Data</span>
              </button>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-5 bg-white rounded-2xl border border-[#800E2B]/15 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#420614]">Recent Order Leads</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#E91E63] hover:underline"
                >
                  Manage All Orders &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="p-3 bg-[#FFF3F6] rounded-xl flex items-center justify-between border border-[#800E2B]/10">
                    <div>
                      <p className="text-xs font-bold text-[#420614]">{o.clientName} &bull; <span className="text-[#E91E63]">{o.itemTitle}</span></p>
                      <p className="text-[10px] text-[#600A20]/70">{o.details}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-[#420614]">₹{o.price}</span>
                      <span className="block text-[10px] font-bold text-[#D81B60]">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CATALOG & PRODUCTS MANAGER --- */}
        {activeTab === 'products' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#420614]">Catalog & Press-On Designs</h3>
                <p className="text-xs text-[#600A20]/80">Update prices, images, descriptions, tags, or add brand new creations.</p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 rounded-xl bg-vibrant-pink-gradient text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Product Add or Edit Drawer */}
            {(isAddProductOpen || editingProduct) && (
              <form onSubmit={handleSaveProduct} className="p-5 bg-white rounded-2xl border-2 border-[#E91E63]/40 space-y-4 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#800E2B]/10 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#420614]">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Create New Studio Design'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}
                    className="text-xs font-bold text-[#E91E63] hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#420614] mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Deep Crimson Pearl Coffin"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#420614] mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-[#420614] mb-1">Category</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614]"
                    >
                      <option value="3D Art">3D Art</option>
                      <option value="Press-Ons">Press-Ons</option>
                      <option value="Chrome">Chrome</option>
                      <option value="Gel Extensions">Gel Extensions</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Gel Polish">Gel Polish</option>
                    </select>
                  </div>
                </div>

                {/* Product Image & Design Photos Selection Box */}
                <div className="space-y-3 p-3.5 bg-[#FFF3F6]/90 rounded-2xl border border-[#800E2B]/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#420614] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#E91E63]" />
                      <span>Product Image & Design Photos</span>
                    </label>
                    <span className="text-[10px] text-[#E91E63] font-bold">
                      Gallery &bull; Apple Photos &bull; Google Photos &bull; Cloud Link
                    </span>
                  </div>

                  {/* Live Image Thumbnail Preview */}
                  {prodImage && (
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#800E2B]/15 shadow-xs">
                      <img
                        src={prodImage}
                        alt="Product Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-[#800E2B]/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E91E63] block">
                          Selected Image Preview
                        </span>
                        <p className="text-[11px] text-[#420614] truncate font-mono mt-0.5">
                      {prodImage.startsWith('blob:')
  ? 'Uploading image...'
  : prodImage.includes('cloudinary.com')
    ? 'Uploaded to Cloudinary'
    : prodImage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProdImage('')}
                        className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Multi-Source Upload Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option A: Device Photo Picker (Gallery, Apple Photos, Google Photos) */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl bg-vibrant-maroon text-white text-xs font-bold uppercase tracking-wider hover:bg-[#800E2B] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>Add from Gallery / Photos</span>
                      </button>
                      <p className="text-[9px] text-[#600A20]/70 text-center mt-1">
                        Opens phone Gallery, Apple Photos, Google Photos app & files
                      </p>
                    </div>

                    {/* Option B: Direct URL / Google Photos Link */}
                    <div>
                      <div className="relative">
                        <Link className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#E91E63]" />
                        <input
                          type="text"
                          placeholder="Paste Google Photos link or image URL..."
                          value={prodImage.startsWith('data:') ? '' : prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614] placeholder:text-[#600A20]/40"
                        />
                      </div>
                      <p className="text-[9px] text-[#600A20]/70 text-center mt-1">
                        Or paste a direct URL / Google Photos shareable link
                      </p>
                    </div>
                  </div>

                  {/* Option C: Preset Studio Images */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-[#600A20] uppercase tracking-wider mb-1">
                      Or Select High-Res Sample Studio Image:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PRODUCT_IMAGES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProdImage(sample.url)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                            prodImage === sample.url
                              ? 'bg-[#E91E63] text-white border-[#E91E63]'
                              : 'bg-white text-[#600A20] border-[#800E2B]/20 hover:border-[#E91E63]'
                          }`}
                        >
                          {sample.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Handcrafted press-on set in salon gel..."
                    className="w-full px-3 py-2 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614]"
                  />
                </div>

                <div className="flex items-center gap-6 text-xs font-semibold text-[#600A20]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodBestseller}
                      onChange={(e) => setProdBestseller(e.target.checked)}
                      className="accent-[#E91E63]"
                    />
                    <span>Mark as Bestseller Badge</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsNew}
                      onChange={(e) => setProdIsNew(e.target.checked)}
                      className="accent-[#E91E63]"
                    />
                    <span>Mark as New Release</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-vibrant-maroon text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Publish to Atelier Catalog'}
                </button>
              </form>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <div key={p._id} className="p-3 bg-white rounded-2xl border border-[#800E2B]/15 flex items-center justify-between gap-3 shadow-xs hover:border-[#E91E63]/40 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images?.[0] || ''}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover border border-[#800E2B]/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#E91E63]">{p.category}</span>
                        {p.isBestseller && (
                          <span className="px-1.5 py-0.2 bg-[#D4AF37]/20 text-[#420614] text-[9px] font-extrabold rounded-md">Bestseller</span>
                        )}
                      </div>
                      <h5 className="font-serif font-bold text-xs text-[#420614] truncate">{p.title}</h5>
                      <p className="font-serif font-bold text-xs text-[#600A20]">₹{p.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="p-2 rounded-lg bg-[#FFF3F6] text-[#800E2B] hover:bg-[#E91E63] hover:text-white transition-colors cursor-pointer"
                      title="Edit Product Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Remove Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: ORDERS & CUSTOM INQUIRIES MANAGER --- */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#E91E63]" />
                <input
                  type="text"
                  placeholder="Search client, item, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#800E2B]/20 rounded-xl text-xs outline-none text-[#420614]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-white border border-[#800E2B]/20 rounded-xl text-xs font-semibold text-[#420614] outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending Inquiry">Pending Inquiry</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Crafting">In Crafting</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  onClick={() => setIsAddOrderOpen(!isAddOrderOpen)}
                  className="px-3 py-2 rounded-xl bg-vibrant-maroon text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Order</span>
                </button>
              </div>
            </div>

            {/* Add Order Form */}
            {isAddOrderOpen && (
              <form onSubmit={handleAddOrderSubmit} className="p-4 bg-white rounded-2xl border border-[#E91E63]/30 space-y-3 shadow-md">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#420614]">New Test Order Record</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Client Name"
                    value={newOrderClient}
                    onChange={(e) => setNewOrderClient(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone (+91 98765...)"
                    value={newOrderPhone}
                    onChange={(e) => setNewOrderPhone(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Product Item Title"
                    value={newOrderItem}
                    onChange={(e) => setNewOrderItem(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newOrderPrice}
                    onChange={(e) => setNewOrderPrice(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Specs (e.g., Medium Almond, Size S)"
                    value={newOrderDetails}
                    onChange={(e) => setNewOrderDetails(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-[#E91E63] text-white font-bold text-xs rounded-xl">
                  Create Order Record
                </button>
              </form>
            )}

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl text-xs font-bold text-[#600A20]/70">
                  No order inquiries match the current search filters.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#800E2B]/10 pb-2">
                      <div>
                        <span className="text-xs font-bold text-[#420614]">{ord.id} &bull; {ord.clientName}</span>
                        <span className="text-xs text-[#800E2B] ml-2">({ord.clientPhone})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#420614]">₹{ord.price}</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className="py-1 px-2.5 bg-[#FFF3F6] border border-[#800E2B]/30 rounded-lg text-[11px] font-bold text-[#600A20] outline-none cursor-pointer"
                        >
                          <option value="Pending Inquiry">Pending Inquiry</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Crafting">In Crafting</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrderClick(ord.id)}
                          className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#600A20]">{ord.itemTitle}</div>
                    <p className="text-[11px] text-[#420614]/80 bg-[#FFF3F6] p-2 rounded-lg">
                      {ord.details}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#800E2B]">Date: {ord.date}</span>
                      <a
                        href={buildWhatsAppUrl(
                          `Hello ${ord.clientName}! This is Pearl & Polish Atelier updating you on your order ${ord.id} (${ord.itemTitle}). Current Status: ${ord.status}.`,
                          ord.clientPhone
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs hover:bg-[#20ba5a]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Direct
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB 4: APPOINTMENTS MANAGER --- */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#420614]">Studio Appointment Sessions</h3>
              <button
                onClick={() => setIsAddAptOpen(!isAddAptOpen)}
                className="px-3 py-1.5 rounded-xl bg-vibrant-maroon text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book New Session</span>
              </button>
            </div>

            {/* Add Appointment Drawer */}
            {isAddAptOpen && (
              <form onSubmit={handleAddAppointmentSubmit} className="p-4 bg-white rounded-2xl border border-[#E91E63]/30 space-y-3 shadow-md">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#420614]">Schedule New Studio Session</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Client Name"
                    value={newAptClient}
                    onChange={(e) => setNewAptClient(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Client Phone (+91 ...)"
                    value={newAptPhone}
                    onChange={(e) => setNewAptPhone(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={newAptService}
                    onChange={(e) => setNewAptService(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="date"
                    value={newAptDate}
                    onChange={(e) => setNewAptDate(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Time Slot (e.g., 02:00 PM)"
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-[#E91E63] text-white font-bold text-xs rounded-xl">
                  Confirm Booking
                </button>
              </form>
            )}

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#420614]">{apt.id} &bull; {apt.clientName}</span>
                      <span className="text-xs text-[#800E2B] ml-2">({apt.clientPhone})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={apt.status}
                        onChange={(e) => handleAppointmentStatusChange(apt.id, e.target.value)}
                        className="py-1 px-2.5 bg-[#FFF3F6] border border-[#800E2B]/30 rounded-lg text-[11px] font-bold text-[#600A20] outline-none cursor-pointer"
                      >
                        <option value="Requested">Requested</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteAppointmentClick(apt.id)}
                        className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-[#600A20]">{apt.serviceName} ({apt.appointmentType})</p>
                  <p className="text-xs text-[#420614]/80">📅 Date: {apt.date} &bull; ⏰ Time: {apt.timeSlot}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: TESTIMONIALS MANAGER --- */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#420614]">Client Reviews & Social Proof</h3>
                <p className="text-xs text-[#600A20]/80">Manage customer feedback, ratings, and avatar profile photos.</p>
              </div>

              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setTestAuthor('');
                  setTestComment('');
                  setIsAddTestimonialOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-vibrant-pink-gradient text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Review</span>
              </button>
            </div>

            {/* Testimonial Form */}
            {(isAddTestimonialOpen || editingTestimonial) && (
              <form onSubmit={handleSaveTestimonialSubmit} className="p-4 bg-white rounded-2xl border-2 border-[#E91E63]/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-xs uppercase text-[#420614]">
                    {editingTestimonial ? `Edit Review from ${editingTestimonial.author}` : 'Create Client Review'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setIsAddTestimonialOpen(false); setEditingTestimonial(null); }}
                    className="text-xs font-bold text-[#E91E63]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Author Name"
                    value={testAuthor}
                    onChange={(e) => setTestAuthor(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Ludhiana, Punjab)"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <select
                    value={testRating}
                    onChange={(e) => setTestRating(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  >
                    <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                    <option value="3">3 Stars ⭐⭐⭐</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Item Purchased"
                    value={testItem}
                    onChange={(e) => setTestItem(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-vibrant-maroon text-white text-[10px] font-bold rounded-lg shrink-0 hover:bg-[#800E2B] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-[#D4AF37]" />
                      <span>From Gallery</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Or Avatar Photo URL"
                      value={testAvatar.startsWith('data:') ? 'Uploaded from Gallery' : testAvatar}
                      onChange={(e) => setTestAvatar(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Review comment..."
                  value={testComment}
                  onChange={(e) => setTestComment(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                />

                <button type="submit" className="w-full py-2 bg-vibrant-maroon text-white font-bold text-xs rounded-xl uppercase">
                  Save Review
                </button>
              </form>
            )}

            {/* Testimonials List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testimonials.map((t) => (
                <div key={t.id} className="p-3.5 bg-white rounded-2xl border border-[#800E2B]/15 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.avatarUrl && (
                        <img src={t.avatarUrl} alt={t.author} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                      )}
                      <div>
                        <p className="font-serif font-bold text-xs text-[#420614]">{t.author}</p>
                        <p className="text-[9px] text-[#600A20]/60">{t.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setTestAuthor(t.author);
                          setTestLocation(t.location);
                          setTestRating(t.rating.toString());
                          setTestComment(t.comment);
                          setTestItem(t.itemPurchased);
                          setTestAvatar(t.avatarUrl || SAMPLE_AVATARS[0].url);
                        }}
                        className="p-1.5 rounded bg-[#FFF3F6] text-[#800E2B] hover:bg-[#E91E63] hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonialClick(t.id)}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#420614]/80 italic">"{t.comment}"</p>
                  <div className="text-[10px] font-bold text-[#E91E63]">Item: {t.itemPurchased}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: USERS & DUMMY ACCOUNTS MANAGER --- */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#420614]">Dummy Accounts & User Profiles</h3>
                <p className="text-xs text-[#600A20]/80">Create, edit, or switch between client and admin dummy accounts.</p>
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserName('');
                  setUserEmail('');
                  setUserPhone('');
                  setIsAddUserOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-vibrant-maroon text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Dummy Account</span>
              </button>
            </div>

            {/* Add / Edit User Form */}
            {(isAddUserOpen || editingUser) && (
              <form onSubmit={handleSaveUserSubmit} className="p-4 bg-white rounded-2xl border-2 border-[#E91E63]/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-xs uppercase text-[#420614]">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create Dummy User Account'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                    className="text-xs font-bold text-[#E91E63]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#420614] mb-1">Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                    >
                      <option value="user">Client / Customer</option>
                      <option value="admin">Studio Master Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#420614] mb-1">VIP Tier</label>
                    <select
                      value={userVip}
                      onChange={(e) => setUserVip(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-[#FFF3F6] border rounded-lg text-xs"
                    >
                      <option value="Velvet Bronze">Velvet Bronze</option>
                      <option value="Rose Gold VIP">Rose Gold VIP</option>
                      <option value="Maroon Diamond">Maroon Diamond</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-vibrant-maroon text-white font-bold text-xs rounded-xl uppercase">
                  Save Account
                </button>
              </form>
            )}

            {/* Users List */}
            <div className="space-y-2.5">
              {users.map((u) => (
                <div key={u.id} className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3F6] border border-[#E91E63]/30 flex items-center justify-center font-bold text-[#420614] text-sm shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#420614]">{u.name}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                          u.role === 'admin' ? 'bg-[#D4AF37] text-[#420614]' : 'bg-[#FFF3F6] text-[#E91E63]'
                        }`}>
                          {u.role}
                        </span>
                        {u.vipTier && (
                          <span className="text-[10px] text-[#800E2B] font-semibold">&bull; {u.vipTier}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#600A20]/70">{u.email} &bull; {u.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSwitchUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFF3F6] text-[#800E2B] border border-[#800E2B]/20 text-[10px] font-bold uppercase hover:bg-[#E91E63] hover:text-white transition-all cursor-pointer"
                    >
                      Impersonate / Switch
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setUserName(u.name);
                        setUserEmail(u.email);
                        setUserPhone(u.phone || '');
                        setUserRole(u.role);
                        setUserVip(u.vipTier || 'Rose Gold VIP');
                      }}
                      className="p-1.5 rounded bg-gray-50 text-gray-600 hover:bg-gray-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== adminUser.id && (
                      <button
                        onClick={() => handleDeleteUserClick(u.id)}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 7: STUDIO BRANDING & SETTINGS --- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettingsSubmit} className="space-y-4 animate-fade-in p-5 bg-white rounded-2xl border border-[#800E2B]/15 shadow-sm">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#420614]">Studio Branding & General Information</h3>
              <p className="text-xs text-[#600A20]/80">Changes update live across the navigation, footer, and location section.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Studio Name</label>
                <input
                  type="text"
                  required
                  value={settings.studioName}
                  onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Studio Address</label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">WhatsApp Contact Phone</label>
                <input
                  type="text"
                  required
                  value={settings.phoneWhatsApp}
                  onChange={(e) => setSettings({ ...settings, phoneWhatsApp: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Concierge Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Mon - Fri Hours</label>
                <input
                  type="text"
                  value={settings.openingHoursWeekdays}
                  onChange={(e) => setSettings({ ...settings, openingHoursWeekdays: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Saturday Hours</label>
                <input
                  type="text"
                  value={settings.openingHoursSaturday}
                  onChange={(e) => setSettings({ ...settings, openingHoursSaturday: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#420614] mb-1">Sunday Hours</label>
                <input
                  type="text"
                  value={settings.openingHoursSunday}
                  onChange={(e) => setSettings({ ...settings, openingHoursSunday: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF3F6] border rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#420614] mb-1">Top Announcement Banner Text</label>
              <input
                type="text"
                value={settings.bannerAnnouncement}
                onChange={(e) => setSettings({ ...settings, bannerAnnouncement: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF3F6] border border-[#800E2B]/15 rounded-xl text-xs"
              />
            </div>

            {/* --- HERO SHOWCASE CARD EDITING --- */}
            <div className="pt-4 border-t border-[#800E2B]/15 space-y-3 bg-[#FFF9FA] p-4 rounded-2xl border border-[#E91E63]/20">
              <h4 className="font-serif text-base font-bold text-[#420614] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Hero Showcase Card (Home Page Top Right Card)</span>
              </h4>
              <p className="text-[11px] text-[#600A20]/80">
                Edit the featured press-on set card, pricing, badge, and photo displayed on the homepage hero section.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Badge Text (Top Overlay Pill)</label>
                  <input
                    type="text"
                    value={settings.heroCardBadge || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardBadge: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder="e.g. Rose Pearls & Velvet Set"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Tagline / Category Header</label>
                  <input
                    type="text"
                    value={settings.heroCardSubtitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardSubtitle: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder="e.g. READY TO ORDER"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Card Main Title</label>
                  <input
                    type="text"
                    value={settings.heroCardTitle || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardTitle: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder="e.g. Custom Press-On Set & Kit"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Card Price Display</label>
                  <input
                    type="text"
                    value={settings.heroCardPrice || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs font-bold text-[#B8860B]"
                    placeholder="e.g. ₹1,850"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Card Description</label>
                  <textarea
                    rows={2}
                    value={settings.heroCardDescription || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardDescription: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder="Includes 10 custom press-on nails..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Card Showcase Image URL</label>
                  <input
                    type="text"
                    value={settings.heroCardImageUrl || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardImageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#420614] mb-1">Floating Verified Review Quote</label>
                  <input
                    type="text"
                    value={settings.heroCardReviewQuote || ''}
                    onChange={(e) => setSettings({ ...settings, heroCardReviewQuote: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs"
                    placeholder='e.g. "Gorgeous luxury shine!"'
                  />
                </div>
              </div>
            </div>

            {/* --- APPOINTMENT SERVICES MANAGEMENT --- */}
            <div className="pt-4 border-t border-[#800E2B]/15 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#420614] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <span>Studio Appointment Services</span>
                  </h4>
                  <p className="text-[11px] text-[#600A20]/80">
                    Services shown in the client "Book Studio Appointment" modal.
                  </p>
                </div>
              </div>

              {/* Current Services List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {(settings.appointmentServices || DEFAULT_STUDIO_SERVICES).map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3 bg-[#FFF3F6] rounded-xl border border-[#800E2B]/15 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) => handleUpdateServiceField(svc.id, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-[#800E2B]/20 rounded-lg text-xs font-bold text-[#420614] focus:outline-none focus:border-[#E91E63]"
                        placeholder="Service Title & Price"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteService(svc.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <select
                        value={svc.category}
                        onChange={(e) => handleUpdateServiceField(svc.id, 'category', e.target.value)}
                        className="w-full sm:w-auto px-2.5 py-1 bg-white border border-[#800E2B]/20 rounded-lg text-[11px] font-medium text-[#420614]"
                      >
                        <option value="In-Studio Gel Service">In-Studio Gel Service</option>
                        <option value="Press-On Fitting & Consultation">Press-On Fitting & Consultation</option>
                        <option value="Bridal Trial Package">Bridal Trial Package</option>
                        <option value="Nail Art & Maintenance">Nail Art & Maintenance</option>
                      </select>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-[10px] text-[#600A20]/70 font-semibold shrink-0">Duration:</span>
                        <input
                          type="text"
                          value={svc.duration}
                          onChange={(e) => handleUpdateServiceField(svc.id, 'duration', e.target.value)}
                          className="w-full sm:w-28 px-2 py-1 bg-white border border-[#800E2B]/20 rounded-lg text-[11px] text-[#420614]"
                          placeholder="e.g. 90 min"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Service Form */}
              <div className="p-3.5 bg-[#FFF9FA] rounded-2xl border border-[#D4AF37]/40 space-y-3">
                <p className="text-xs font-bold text-[#420614] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Add New Studio Service:</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Service Title & Price (e.g., Builder Gel Extension - ₹2,200)"
                      value={newSvcTitle}
                      onChange={(e) => setNewSvcTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs text-[#420614]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 60 min)"
                      value={newSvcDuration}
                      onChange={(e) => setNewSvcDuration(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs text-[#420614]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newSvcCategory}
                    onChange={(e) => setNewSvcCategory(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#800E2B]/20 rounded-xl text-xs font-medium text-[#420614] flex-1"
                  >
                    <option value="In-Studio Gel Service">In-Studio Gel Service</option>
                    <option value="Press-On Fitting & Consultation">Press-On Fitting & Consultation</option>
                    <option value="Bridal Trial Package">Bridal Trial Package</option>
                    <option value="Nail Art & Maintenance">Nail Art & Maintenance</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-1.5 rounded-xl bg-[#420614] text-white text-xs font-bold hover:bg-[#600A20] transition-all cursor-pointer shrink-0"
                  >
                    + Add Service
                  </button>
                </div>
              </div>
            </div>

            {/* --- APPOINTMENT TIME SLOTS MANAGEMENT --- */}
            <div className="pt-4 border-t border-[#800E2B]/15 space-y-3">
              <h4 className="font-serif text-base font-bold text-[#420614] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Available Appointment Time Slots</span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {(settings.appointmentTimeSlots || DEFAULT_STUDIO_TIME_SLOTS).map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3F6] border border-[#800E2B]/20 text-xs font-bold text-[#420614]"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTimeSlot(slot)}
                      className="text-red-500 hover:text-red-700 ml-1 cursor-pointer font-extrabold"
                      title="Delete slot"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. 11:00 AM or 05:00 PM"
                  value={newTimeSlotInput}
                  onChange={(e) => setNewTimeSlotInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#FFF3F6] border border-[#800E2B]/20 rounded-xl text-xs text-[#420614]"
                />
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#420614] text-xs font-bold hover:bg-[#b59226] transition-all cursor-pointer"
                >
                  + Add Slot
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-vibrant-maroon text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer mt-4"
            >
              Save Studio Settings & Services
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
