export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Address {
  id: number;
  label: string;
  street?: string;
  number?: string;
  addressLine?: string;
  references?: string;
  district: string;
  province: string;
  department: string;
  zipCode?: string;
  zoneId?: number;
}
