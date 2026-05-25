// RedHope DTO Type Definitions

export interface UserProfileUpdateDTO {
  name: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  rhFactor?: string;
  healthConditions?: string;
  lat: number;
  lon: number;
  city: string;
  profileUrl?: string;
  available: boolean;
  adult?: boolean;
}

export interface UserProfileResponseDTO {
  id: string;
  name: string;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  donorRank: string | null;
  rewardPoints: number;
  bloodGroup: string | null;
  rhFactor: string | null;
  lastDonationDate: string | null;
  lat: number | null;
  lon: number | null;
  city: string | null;
  healthConditions: string | null;
  profileUrl: string | null;
  available: boolean;
  adult?: boolean;
}

export interface BloodRequestDTO {
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  latitude: number;
  longitude: number;
  urgency: string; // 'Critical' | 'Normal'
  description?: string;
}

export interface BloodRequestUpdateDTO {
  requestId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  city: string;
  hospitalName: string;
  hospitalAddress?: string;
  notes?: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  password?: string;
}

export interface ResetPasswordDTO {
  token?: string;
  password?: string;
}

export interface EmailDTO {
  email: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface TokenDTO {
  token: string;
}

export interface BloodRequestResponseDTO {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  city: string;
  latitude: number;
  longitude: number;
  urgency: string;
  status: string;
  requestDate: string;
  hospitalAddress?: string;
  description?: string;
  notes?: string;
  requesterName?: string;
}

// Donor history item — REAL response from GET /api/v1/donor/history
// DonationStatus enum: INITIATED | CONTACT_SHARED | IN_PROGRESS | COMPLETED | CANCELLED
export interface DonorHistoryItemDTO {
  requestId: string;          // UUID of the blood request
  donationId: string;         // UUID of the donation record
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  city: string;
  hospitalName: string | null;
  donorName: string | null;
  requesterName: string | null;
  status: string;             // INITIATED | CONTACT_SHARED | IN_PROGRESS | COMPLETED | CANCELLED
  donationDate: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
}

// Notification — GET /api/v1/notifications & /api/v1/notifications/unread
// Backend enum: SYSTEM | BLOOD_REQUEST_MATCH | DONATION_ACCEPTED | DONATION_STATUS_UPDATE | REWARD_EARNED | URGENT_ALERT
export type NotificationType =
  | 'SYSTEM'
  | 'BLOOD_REQUEST_MATCH'
  | 'DONATION_ACCEPTED'
  | 'DONATION_STATUS_UPDATE'
  | 'REWARD_EARNED'
  | 'URGENT_ALERT';

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}
