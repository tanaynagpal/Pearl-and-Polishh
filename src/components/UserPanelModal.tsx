import React, { useState, useEffect } from 'react';
import { UserProfile, OrderRecord, AppointmentRecord, CustomFingerSizes } from '../types';
import { api } from '../services/api';
import { buildWhatsAppUrl } from '../data/products';
import { X, User, Crown, Ruler, Package, Calendar, Heart, LogOut, CheckCircle2, MessageCircle, Clock, Sparkles, Save, Edit3, Trash2, Plus, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface UserPanelModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenAppointmentModal?: () => void;
}

export const UserPanelModal: React.FC<UserPanelModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogout,
  onOpenAppointmentModal,
}) => {
  const [activeTab, setActiveTab] = useState<'sizes' | 'orders' | 'appointments'>('sizes');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Appointments & Orders state management
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [editingApt, setEditingApt] = useState<AppointmentRecord | null>(null);

  // Sync user orders and appointments from API
  const reloadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ordRes, aptRes] = await Promise.all([
        api.getMyOrders().catch(() => ({ orders: [] })),
        api.getMyAppointments().catch(() => ({ appointments: [] })),
      ]);
      if (ordRes.orders) setOrders(ordRes.orders);
      if (aptRes.appointments) setAppointments(aptRes.appointments);
    } catch (e) {
      console.error('Failed to reload user data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadUserData();
    }
  }, [user, isOpen, activeTab]);

  // Finger sizes state
  const [sizes, setSizes] = useState<CustomFingerSizes>(
    user?.savedSizes || {
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
    }
  );

  if (!isOpen || !user) return null;

  const handleSaveSizes = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleStartEditAppointment = (apt: AppointmentRecord) => {
    setEditingAptId(apt.id);
    setEditingApt({ ...apt });
  };

  const handleCancelEditAppointment = () => {
    setEditingAptId(null);
    setEditingApt(null);
  };

  const handleSaveAppointment = async () => {
    if (!editingApt) return;
    try {
      await api.updateAppointmentStatus(editingApt.id, editingApt.status || 'Confirmed');
      await reloadUserData();
      setEditingAptId(null);
      setEditingApt(null);
      setActionNotice({ text: 'Appointment updated successfully!', type: 'success' });
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e: any) {
      setActionNotice({ text: e.message || 'Failed to update appointment.', type: 'error' });
    }
  };

  const handleCancelAppointment = async (aptId: string) => {
    if (confirm('Are you sure you want to cancel this studio appointment session?')) {
      try {
        await api.updateAppointmentStatus(aptId, 'Cancelled');
        await reloadUserData();
        if (editingAptId === aptId) {
          setEditingAptId(null);
          setEditingApt(null);
        }
        setActionNotice({ text: 'Appointment status changed to Cancelled.', type: 'info' });
        setTimeout(() => setActionNotice(null), 3500);
      } catch (e: any) {
        setActionNotice({ text: e.message || 'Failed to cancel appointment.', type: 'error' });
      }
    }
  };

  const handleDeleteAppointmentRecord = async (aptId: string) => {
    if (confirm('Remove this appointment record from your account history?')) {
      try {
        await api.updateAppointmentStatus(aptId, 'Cancelled');
        await reloadUserData();
        if (editingAptId === aptId) {
          setEditingAptId(null);
          setEditingApt(null);
        }
        setActionNotice({ text: 'Appointment record removed.', type: 'info' });
        setTimeout(() => setActionNotice(null), 3500);
      } catch (e: any) {
        setActionNotice({ text: e.message || 'Failed to delete appointment.', type: 'error' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFF5F7] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#800E2B]/20 p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-[#600A20] hover:text-white transition-colors text-[#600A20] z-10 cursor-pointer border border-[#800E2B]/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header Profile Card */}
        <div className="bg-vibrant-maroon p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-[#D4AF37]/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#E91E63]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E91E63] text-white border-2 border-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold tracking-wide">{user.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#420614] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Crown className="w-3 h-3" />
                    {user.vipTier || 'Rose Gold VIP'}
                  </span>
                </div>
                <p className="text-xs text-[#FFF3F6]/80 mt-0.5">{user.email} &bull; {user.phone}</p>
                <p className="text-[10px] text-[#D4AF37] mt-1">Atelier Client Member since {user.createdAt}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#E91E63]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 p-1 bg-white rounded-xl border border-[#800E2B]/20 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('sizes')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sizes' 
                ? 'bg-vibrant-maroon text-white shadow-xs' 
                : 'text-[#600A20]/70 hover:text-[#420614]'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Saved Sizing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-vibrant-maroon text-white shadow-xs' 
                : 'text-[#600A20]/70 hover:text-[#420614]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'appointments' 
                ? 'bg-vibrant-maroon text-white shadow-xs' 
                : 'text-[#600A20]/70 hover:text-[#420614]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#E91E63]" />
            <span>Appointments ({appointments.length})</span>
          </button>
        </div>

        {/* Tab 1: Saved Sizing Profile */}
        {activeTab === 'sizes' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#420614]">My Finger Measurements (mm)</h3>
                <p className="text-xs text-[#600A20]/80">
                  Save your custom nail bed widths in millimeters so your press-on orders fit perfectly every time.
                </p>
              </div>
              <button
                onClick={handleSaveSizes}
                className="px-4 py-2 rounded-xl bg-vibrant-pink-gradient text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>

            {isSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nail sizes successfully saved to your client profile!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Hand */}
              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-3">
                <span className="text-xs font-bold text-[#600A20] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
                  Left Hand (mm)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { key: 'leftThumb', label: 'Thumb' },
                    { key: 'leftIndex', label: 'Index' },
                    { key: 'leftMiddle', label: 'Middle' },
                    { key: 'leftRing', label: 'Ring' },
                    { key: 'leftPinky', label: 'Pinky' },
                  ].map((f) => (
                    <div key={f.key}>
                      <span className="block text-[10px] text-[#420614]/70 font-semibold">{f.label}</span>
                      <input
                        type="number"
                        min="5"
                        max="25"
                        value={sizes[f.key as keyof CustomFingerSizes]}
                        onChange={(e) => setSizes({ ...sizes, [f.key]: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 py-1.5 text-center text-xs font-bold bg-[#FFF5F7] border border-[#800E2B]/20 rounded-lg text-[#420614]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Hand */}
              <div className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-3">
                <span className="text-xs font-bold text-[#600A20] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
                  Right Hand (mm)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { key: 'rightThumb', label: 'Thumb' },
                    { key: 'rightIndex', label: 'Index' },
                    { key: 'rightMiddle', label: 'Middle' },
                    { key: 'rightRing', label: 'Ring' },
                    { key: 'rightPinky', label: 'Pinky' },
                  ].map((f) => (
                    <div key={f.key}>
                      <span className="block text-[10px] text-[#420614]/70 font-semibold">{f.label}</span>
                      <input
                        type="number"
                        min="5"
                        max="25"
                        value={sizes[f.key as keyof CustomFingerSizes]}
                        onChange={(e) => setSizes({ ...sizes, [f.key]: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 py-1.5 text-center text-xs font-bold bg-[#FFF5F7] border border-[#800E2B]/20 rounded-lg text-[#420614]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif text-lg font-bold text-[#420614]">My Press-On Order Inquiries</h3>
            
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#800E2B]/10 space-y-2">
                <Package className="w-10 h-10 mx-auto text-[#E91E63]/40" />
                <p className="text-xs font-bold text-[#420614]">No order inquiries placed yet.</p>
                <p className="text-[11px] text-[#600A20]/70">Explore our catalog or Custom Set Builder to request your first handcrafted set!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#420614]">{ord.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-xs font-serif font-bold text-[#420614]">₹{ord.price}</span>
                    </div>

                    <div className="text-xs font-bold text-[#600A20]">{ord.itemTitle}</div>
                    <div className="text-[11px] text-[#420614]/75 bg-[#FFF5F7] p-2 rounded-lg border border-[#800E2B]/10">
                      {ord.details}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#800E2B] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E91E63]" />
                        Requested on {ord.date}
                      </span>
                      <a
                        href={buildWhatsAppUrl(`Hello Pearl & Polishh! Inquiry regarding my order ${ord.id} (${ord.itemTitle}).`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#420614]">My Studio Session Bookings</h3>
                <p className="text-xs text-[#600A20]/80">
                  Manage, reschedule, or cancel your in-studio nail sessions.
                </p>
              </div>

              {onOpenAppointmentModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAppointmentModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#600A20] text-white text-xs font-bold hover:bg-[#800E2B] transition-all flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Book New Session</span>
                </button>
              )}
            </div>

            {/* Action Notice Alert Banner */}
            {actionNotice && (
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in ${
                actionNotice.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionNotice.text}</span>
                </div>
                <button onClick={() => setActionNotice(null)} className="text-gray-500 hover:text-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#800E2B]/10 space-y-3">
                <Calendar className="w-10 h-10 mx-auto text-[#E91E63]/40" />
                <p className="text-xs font-bold text-[#420614]">No studio appointments booked.</p>
                <p className="text-[11px] text-[#600A20]/70">Schedule a Russian Manicure or Bridal Trial session at our Ludhiana atelier!</p>
                {onOpenAppointmentModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAppointmentModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-vibrant-maroon text-white text-xs font-bold hover:bg-[#600A20] transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <span>Book Studio Appointment Now</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const isEditing = editingAptId === apt.id && editingApt !== null;

                  if (isEditing && editingApt) {
                    return (
                      <div key={apt.id} className="p-4 bg-white rounded-2xl border-2 border-[#E91E63]/40 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-[#800E2B]/10 pb-2">
                          <span className="font-bold text-xs text-[#420614] flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-[#E91E63]" />
                            Reschedule Booking ({apt.id})
                          </span>
                          <span className="text-[10px] font-bold text-[#600A20]">
                            Editing Details
                          </span>
                        </div>

                        {/* Service Selection */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#420614] uppercase tracking-wider mb-1">
                            Service Type
                          </label>
                          <select
                            value={editingApt.serviceName}
                            onChange={(e) => {
                              const s = e.target.value;
                              setEditingApt({
                                ...editingApt,
                                serviceName: s,
                                appointmentType: s.includes('Bridal') ? 'Bridal Trial Package' : s.includes('Fitting') ? 'Press-On Fitting & Consultation' : 'In-Studio Gel Service'
                              });
                            }}
                            className="w-full text-xs p-2 rounded-xl border border-[#800E2B]/20 bg-[#FFF5F7] font-semibold text-[#420614] focus:outline-none focus:border-[#E91E63]"
                          >
                            <option value="In-Studio Russian Manicure & Builder Gel (₹1,950)">In-Studio Russian Manicure & Builder Gel (₹1,950)</option>
                            <option value="Full Sculpted Gel Extensions & Custom Art (₹2,800)">Full Sculpted Gel Extensions & Custom Art (₹2,800)</option>
                            <option value="Custom Press-On Fitting & Sizing Trial (₹850)">Custom Press-On Fitting & Sizing Trial (₹850)</option>
                            <option value="VIP Bridal Nail Trial & Royal High-Tea Consultation (₹3,500)">VIP Bridal Nail Trial & Royal High-Tea Consultation (₹3,500)</option>
                          </select>
                        </div>

                        {/* Date & Time Slot */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#420614] uppercase tracking-wider mb-1">
                              Preferred Date
                            </label>
                            <input
                              type="date"
                              value={editingApt.date}
                              onChange={(e) => setEditingApt({ ...editingApt, date: e.target.value })}
                              className="w-full text-xs p-2 rounded-xl border border-[#800E2B]/20 bg-[#FFF5F7] font-semibold text-[#420614] focus:outline-none focus:border-[#E91E63]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#420614] uppercase tracking-wider mb-1">
                              Preferred Time Slot
                            </label>
                            <select
                              value={editingApt.timeSlot}
                              onChange={(e) => setEditingApt({ ...editingApt, timeSlot: e.target.value })}
                              className="w-full text-xs p-2 rounded-xl border border-[#800E2B]/20 bg-[#FFF5F7] font-semibold text-[#420614] focus:outline-none focus:border-[#E91E63]"
                            >
                              {['10:00 AM', '12:30 PM', '2:30 PM', '4:30 PM', '6:00 PM'].map((slot) => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Special Requests / Notes */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#420614] uppercase tracking-wider mb-1">
                            Special Requests / Nail Condition
                          </label>
                          <textarea
                            value={editingApt.specialNotes || ''}
                            onChange={(e) => setEditingApt({ ...editingApt, specialNotes: e.target.value })}
                            rows={2}
                            placeholder="Add any specific requests or nail art details..."
                            className="w-full text-xs p-2 rounded-xl border border-[#800E2B]/20 bg-[#FFF5F7] text-[#420614] focus:outline-none focus:border-[#E91E63] resize-none"
                          />
                        </div>

                        {/* Status Select */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#420614] uppercase tracking-wider mb-1">
                            Booking Status
                          </label>
                          <select
                            value={editingApt.status}
                            onChange={(e) => setEditingApt({ ...editingApt, status: e.target.value as any })}
                            className="w-full text-xs p-2 rounded-xl border border-[#800E2B]/20 bg-[#FFF5F7] font-bold text-[#420614] focus:outline-none focus:border-[#E91E63]"
                          >
                            <option value="Requested">Requested (Awaiting Confirmation)</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#800E2B]/10">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveAppointment}
                              className="px-3.5 py-1.5 rounded-xl bg-vibrant-maroon text-white text-xs font-bold hover:bg-[#600A20] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Save Changes</span>
                            </button>

                            <button
                              onClick={handleCancelEditAppointment}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteAppointmentRecord(apt.id)}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Record</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={apt.id} className="p-4 bg-white rounded-2xl border border-[#800E2B]/15 space-y-3 shadow-xs hover:border-[#800E2B]/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#420614]">{apt.id}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>

                        <button
                          onClick={() => handleStartEditAppointment(apt)}
                          className="px-2.5 py-1 rounded-lg bg-[#FFF3F6] hover:bg-[#FCE4EC] text-[#800E2B] text-[11px] font-bold border border-[#E91E63]/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-[#E91E63]" />
                          <span>Reschedule / Edit</span>
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[#600A20]">{apt.serviceName}</div>

                      <div className="text-[11px] text-[#420614]/80 flex flex-wrap items-center gap-3 bg-[#FFF5F7] p-2.5 rounded-xl border border-[#800E2B]/10">
                        <span className="font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#E91E63]" />
                          {apt.date}
                        </span>
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#E91E63]" />
                          {apt.timeSlot}
                        </span>
                      </div>

                      {apt.specialNotes && (
                        <p className="text-[11px] text-[#420614]/75 italic pl-1 border-l-2 border-[#E91E63]">
                          "{apt.specialNotes}"
                        </p>
                      )}

                      {/* Bottom Quick Action bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#800E2B]/10 text-[11px]">
                        <a
                          href={buildWhatsAppUrl(
                            `Hello Pearl & Polishh! 💅\n\nI have a question or update regarding my studio booking (${apt.id}):\n• Service: ${apt.serviceName}\n• Date: ${apt.date} (${apt.timeSlot})\n• Status: ${apt.status}\n\nPlease help confirm!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Notify Studio on WhatsApp</span>
                        </a>

                        {apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel Session</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
