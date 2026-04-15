export interface UserProfile {
  id: number;
  username: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  description: string;
  avatar: string;
  roles: string[];
  member_since: string;
  phone: string;
  whatsapp: string;
  website: string;
  verified: boolean;
}

export interface NotificationPrefs {
  inquiries: boolean;
  listing_status: boolean;
  expiry_reminders: boolean;
  marketing: boolean;
}
