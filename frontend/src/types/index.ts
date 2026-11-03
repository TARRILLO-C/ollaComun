export type UserRole = 'BODEGA' | 'COMEDOR';

export type DocumentType = 'DNI' | 'RUC';

export type DonationCategory = 
  | 'PANADERIA' 
  | 'FRUTAS_VERDURAS' 
  | 'ABARROTES' 
  | 'LACTEOS' 
  | 'COMIDA_PREPARADA' 
  | 'OTROS';

export type DonationStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'DELIVERED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export type DeliveryStatus = 
  | 'PENDING_PICKUP' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  role: UserRole;
  docType: DocumentType;
  docNumber: string;
  pin?: string;
  businessName: string;
  representativeName: string;
  phone: string;
  email: string;
  addressLine: string;
  district: string;
  facadePhotoUrl?: string;
  isVerified: boolean;
  location: Coordinates;
}

export interface Donation {
  id: string;
  donorId: string;
  donorBusinessName: string;
  donorPhone: string;
  donorAddress: string;
  title: string;
  category: DonationCategory;
  description: string;
  quantityValue: number;
  unitMeasure: string;
  pickupStartAt: string; // ISO date string
  pickupEndAt: string;   // ISO date string
  status: DonationStatus;
  photoUrl?: string;
  location: Coordinates;
  createdAt: string;
  // Calculado dinámicamente según la ubicación del observador
  distanceMeters?: number;
}

export interface Delivery {
  id: string;
  donationId: string;
  receiverId: string;
  receiverBusinessName: string;
  receiverPhone: string;
  pickupPin: string;       // PIN de 6 dígitos
  qrHashToken: string;     // Hash de validación
  status: DeliveryStatus;
  reservedAt: string;
  deliveredAt?: string;
}

export interface PushNotificationAlert {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  donationId?: string;
  read: boolean;
}
