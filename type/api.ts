// API response types
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface CreditsResponse {
  credits: number;
}

export interface ProcessingResponse {
  success: boolean;
  message: string;
  jobId: string;
}

// API error response
export interface ApiErrorResponse {
  error: boolean;
  message: string;
  status: number;
  code?: string;
}

// API request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProcessingRequest {
  file: string;
  options: {
    variant: string;
    censorWord: string;
    replacementType: string;
  };
}
