import type { 
  SignupDTO, LoginDTO, UserProfileUpdateDTO, BloodRequestDTO, 
  ResetPasswordDTO, TokenDTO, EmailDTO, UserProfileResponseDTO,
  BloodRequestUpdateDTO
} from '../types';

// Empty BASE_URL = use Vite dev proxy (see vite.config.ts).
// All /api/* requests are forwarded server-side to http://localhost:8080
// → no CORS preflight, works for ALL HTTP methods (GET, POST, PATCH, etc.)
const BASE_URL = '';


// Custom fetch wrapper with CORS credentials support
async function request<T>(
  path: string, 
  method: string, 
  body?: any, 
  params?: Record<string, any>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Construct URL with query parameters
  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch (e) {
      // not JSON
    }
    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json() as T;
  }
  
  return (await response.text()) as unknown as T;
}

// API methods matching controllers
export const authAPI = {
  signup: (data: SignupDTO) => request<{ message: string; token?: string }>('/api/v1/auth/signup', 'POST', data),
  login: (data: LoginDTO) => request<string>('/api/v1/auth/login', 'POST', data),
  logout: () => request<string>('/api/v1/auth/logout', 'POST'),
  emailVerify: (data: TokenDTO) => request<{ message: string }>('/api/v1/auth/email-verify', 'POST', data),
  resendEmail: (data: EmailDTO) => request<{ message: string }>('/api/v1/auth/email-verify/resend', 'POST', data),
  forgetPassword: (data: EmailDTO) => request<{ message: string }>('/api/v1/auth/password/forget', 'POST', data),
  resetPassword: (data: ResetPasswordDTO) => request<{ message: string }>('/api/v1/auth/password/reset', 'POST', data),
  checkLoginStatus: () => request<string>('/api/v1/auth/check', 'GET'),
  refreshAccessToken: () => request<string>('/api/v1/auth/refresh', 'POST'),
  directLogin: (data: TokenDTO) => request<string>('/api/v1/auth/direct-login', 'POST', data),
  testHi: () => request<string>('/api/v1/auth/hi', 'GET'),
};

export const userAPI = {
  updateProfile: (profile: UserProfileUpdateDTO) => request<{ message: string; profile: any }>('/api/v1/user/update/profile', 'POST', profile),
  getUserProfile: () => request<UserProfileResponseDTO>('/api/v1/user/profile', 'GET'),
  getBloodRequest: (id: string) => request<any>(`/api/v1/user/blood/request/${id}`, 'GET'),
};

export const receiverAPI = {
  createBloodRequest: (data: BloodRequestDTO) => request<{ message: string; request: any }>('/api/v1/reciver/blood-request', 'POST', data),
  updateBloodRequest: (data: BloodRequestUpdateDTO) => request<{ message: string; request: any }>('/api/v1/reciver/request-update', 'POST', data),
  getMyRequests: () => request<any[]>('/api/v1/reciver/myrequest', 'GET'),
  completeRequest: (requestId: string) => request<string>('/api/v1/reciver/complete', 'POST', null, { requestId }),
  cancelRequest: (requestId: string) => request<string>('/api/v1/reciver/cancel', 'POST', null, { requestId }),
  getRecomendedDoners: () => request<any[]>('/api/v1/reciver/recommend-donors', 'GET'),
};

export const donorAPI = {
  getRecommendedDonations: () => request<any[]>('/api/v1/donor/recommend-requests', 'GET'),
  responseDonationById: (id: string, status: string) => request<any>(`/api/v1/donor/respond/${id}`, 'POST', null, { status }),
  getBloodRequestHistory: () => request<any[]>('/api/v1/donor/history', 'GET'),
  // Update donation status through its lifecycle: INITIATED → CONTACT_SHARED → IN_PROGRESS → COMPLETED | CANCELLED
  // Backend API needed: POST /api/v1/donor/donation/{donationId}/status?status=CONTACT_SHARED
  updateDonationStatus: (donationId: string, status: string) =>
    request<string>(`/api/v1/donor/donation/${donationId}/status`, 'POST', null, { status }),
};

export const notificationAPI = {
  // GET /api/v1/notifications — all notifications for current user
  getAll: () => request<any[]>('/api/v1/notifications', 'GET'),
  // GET /api/v1/notifications/unread — only unread notifications
  getUnread: () => request<any[]>('/api/v1/notifications/unread', 'GET'),
  // PATCH /api/v1/notifications/{notificationId}/read — mark one as read
  markAsRead: (notificationId: string) => request<string>(`/api/v1/notifications/${notificationId}/read`, 'PATCH'),
};