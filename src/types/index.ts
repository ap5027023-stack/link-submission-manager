export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  submissionLimit: number;
  status: "active" | "disabled";
  createdDate: string;
  role: "admin" | "user";
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  submissionLimit: number;
  status: "active" | "disabled";
  createdDate: string;
  role: "admin" | "user";
}

export interface LinkSubmission {
  submissionId: string;
  userId: string;
  userEmail: string;
  link: string;
  timestamp: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: "admin" | "user";
  name: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserStats {
  submissionLimit: number;
  totalSubmitted: number;
  remaining: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  submissionLimit: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  submissionLimit?: number;
  status?: "active" | "disabled";
}
