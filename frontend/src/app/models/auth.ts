export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}
