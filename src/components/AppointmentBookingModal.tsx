import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, MessageCircle, Sparkles, User, Phone, CheckCircle2 } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';
import { getStoredStudioSettings, DEFAULT_STUDIO_SERVICES, DEFAULT_STUDIO_TIME_SLOTS } from '../data/storage';
import { BookingState, StudioSettings } from '../types';
import { api } from '../services/api';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState<StudioSettings>(getStoredStudioSettings());

  useEffect(() => {
    setSettings(getStoredStudioSettings());
  }, [isOpen]);

  const services = settings.appointmentServices && settings.appointmentServices.length > 0
    ? settings.appointmentServices
    : DEFAULT_STUDIO_SERVICES;

  const timeSlots = settings.appointmentTimeSlots && settings.appointmentTimeSlots.length > 0
    ? settings.appointmentTimeSlots
    : DEFAULT_STUDIO_TIME_SLOTS;

  const [booking, setBooking] = useState<BookingState>({
    serviceName: services[0]?.title || 'In-Studio Russian Manicure & Builder Gel (₹1,950)',
    appointmentType: (services[0]?.category as any) || 'In-Studio Gel Service',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: timeSlots[0] || '2:30 PM',
    clientName: '',
    phone: '',
    specialNotes: 'Looking forward to strengthening my natural nails with builder gel.',
  });

  const getWhatsAppBookingUrl = () => {
    const text = `Hello Pearl & Polishh Studio! 💅✨\n\nI would like to request an in-studio appointment:\n\n• Service: ${booking.serviceName}\n• Date: ${booking.date}\n• Time Slot: ${booking.timeSlot}\n• Client Name: ${booking.clientName || 'Valued Guest'}\n• Phone Number: ${booking.phone || 'Provided in chat'}\n• Special Notes: ${booking.specialNotes || 'None'}\n\nPlease confirm studio availability for this slot!`;
    return buildWhatsAppUrl(text);
  };

  const handleConfirmBooking = async () => {
    try {
      await api.createAppointment({
        clientName: booking.clientName || 'Valued Guest',
        clientEmail: 'guest@example.com',
        clientPhone: booking.phone || '+91 98765 00000',
        serviceName: booking.serviceName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        notes: booking.specialNotes,
      });
    } catch (e) {
      console.error('Appointment database save:', e);
    }
    window.open(getWhatsAppBookingUrl(), '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DFC8] p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1817] text-[#FAF7F2] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1817]">Book Studio Appointment</h3>
              <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider">
                Pearl & Polishh Private Atelier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E8DFC8] text-[#1A1817] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Notice */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFC8] flex items-center gap-3 text-xs text-[#1A1817]/80">
          <MapPin className="w-4 h-4 text-[#B8860B] shrink-0" />
          <span><strong className="text-[#1A1817]">Studio Address:</strong> {settings.address}</span>
        </div>

        {/* Form Controls */}
        <div className="space-y-5">
          
          {/* Select Service */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1817] uppercase tracking-wider block">
              1. Choose Service:
            </label>
            <div className="space-y-2">
              {services.map((svc) => (
                <button
                  key={svc.title}
                  onClick={() =>
                    setBooking({
                      ...booking,
                      serviceName: svc.title,
                      appointmentType: svc.category as any,
                    })
                  }
                  className={`w-full p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                    booking.serviceName === svc.title
                      ? 'border-[#B8860B] bg-[#1A1817] text-[#FAF7F2] shadow-xs'
                      : 'border-[#E8DFC8] bg-white text-[#1A1817]/80 hover:border-[#B8860B]/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p>{svc.title}</p>
                    <p className="text-[10px] text-[#B8860B] font-normal">{svc.category}</p>
                  </div>
                  <span className="text-[11px] opacity-80 shrink-0">{svc.duration}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1817] uppercase tracking-wider block">
                2. Preferred Date:
              </label>
              <input
                type="date"
                value={booking.date}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                className="w-full p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs font-bold text-[#1A1817] focus:outline-none focus:border-[#B8860B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1817] uppercase tracking-wider block">
                3. Preferred Time Slot:
              </label>
              <select
                value={booking.timeSlot}
                onChange={(e) => setBooking({ ...booking, timeSlot: e.target.value })}
                className="w-full p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs font-bold text-[#1A1817] focus:outline-none focus:border-[#B8860B]"
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1817] block">Your Full Name:</label>
              <input
                type="text"
                placeholder="e.g. Simran Kaur"
                value={booking.clientName}
                onChange={(e) => setBooking({ ...booking, clientName: e.target.value })}
                className="w-full p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#B8860B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1817] block">WhatsApp / Phone:</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={booking.phone}
                onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                className="w-full p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#B8860B]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1A1817] block">Nail Condition / Special Requests:</label>
            <textarea
              rows={2}
              placeholder="e.g. Existing gel removal needed, or bridal party request..."
              value={booking.specialNotes}
              onChange={(e) => setBooking({ ...booking, specialNotes: e.target.value })}
              className="w-full p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs text-[#1A1817] focus:outline-none focus:border-[#B8860B]"
            />
          </div>

        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <a
            href={getWhatsAppBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Request Appointment on WhatsApp</span>
          </a>
          <p className="text-[10px] text-center text-[#1A1817]/60 mt-2">
            No upfront charge. Appointment status & confirmation will be sent directly via WhatsApp.
          </p>
        </div>

      </div>
    </div>
  );
};
