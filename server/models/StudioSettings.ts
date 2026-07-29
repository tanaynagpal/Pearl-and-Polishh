import mongoose, { Schema, Document } from 'mongoose';

export interface IStudioSettings extends Document {
  studioName: string;
  tagline: string;
  address: string;
  phoneWhatsApp: string;
  instagram: string;
  email: string;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudioSettingsSchema = new Schema<IStudioSettings>(
  {
    studioName: { type: String, default: 'Pearl & Polishh', trim: true },
    tagline: { type: String, default: 'LUDHIANA LUXURY ATELIER & CUSTOM GEL PRESS-ON STUDIO', trim: true },
    address: { type: String, default: '44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015', trim: true },
    phoneWhatsApp: { type: String, default: '+91 98778 85144', trim: true },
    instagram: { type: String, default: '@pearl.and.polishh', trim: true },
    email: { type: String, default: 'maanvinagpal18@gmail.com', lowercase: true, trim: true },
    openingHoursWeekdays: { type: String, default: '10:00 AM – 7:00 PM', trim: true },
    openingHoursSaturday: { type: String, default: '10:00 AM – 6:00 PM', trim: true },
    openingHoursSunday: { type: String, default: 'Bridal Appointments Only', trim: true },
  },
  { timestamps: true }
);

export const StudioSettingsModel =
  mongoose.models.StudioSettings || mongoose.model<IStudioSettings>('StudioSettings', StudioSettingsSchema);

