import type {
  Property,
  Booking,
  CleaningJob,
  Contact,
  User,
} from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// API response wrapper
type ApiResponse<T> = {
  data: T;
};

type ApiErrorResponse = {
  error: {
    message: string;
    code: string;
  };
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

// Auth response types
type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    contact_id: string;
  };
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;
    const authToken = token || this.token;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      const error = json as ApiErrorResponse;
      throw new Error(error.error?.message || 'An unknown error occurred');
    }

    // Unwrap the data envelope
    const result = json as ApiResponse<T>;
    return result.data;
  }

  // ============================================================================
  // Auth
  // ============================================================================

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return this.request<RefreshResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    });
  }

  async logout(): Promise<void> {
    await this.request<{ success: boolean }>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  // ============================================================================
  // Properties
  // ============================================================================

  async getProperties(opts?: { limit?: number; offset?: number }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<Property[]>(`/api/v1/properties${query}`);
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/api/v1/properties/${id}`);
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    return this.request<Property>('/api/v1/properties', {
      method: 'POST',
      body: property,
    });
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    return this.request<Property>(`/api/v1/properties/${id}`, {
      method: 'PUT',
      body: property,
    });
  }

  // ============================================================================
  // Bookings
  // ============================================================================

  async getBookings(opts?: { limit?: number; offset?: number }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<Booking[]>(`/api/v1/bookings${query}`);
  }

  async getBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/api/v1/bookings/${id}`);
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    return this.request<Booking>('/api/v1/bookings', {
      method: 'POST',
      body: booking,
    });
  }

  // ============================================================================
  // Cleaning Jobs
  // ============================================================================

  async getJobs(opts?: { limit?: number; offset?: number }): Promise<CleaningJob[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<CleaningJob[]>(`/api/v1/jobs${query}`);
  }

  async getJob(id: string): Promise<CleaningJob> {
    return this.request<CleaningJob>(`/api/v1/jobs/${id}`);
  }

  async clockInJob(id: string): Promise<CleaningJob> {
    return this.request<CleaningJob>(`/api/v1/jobs/${id}/clock-in`, {
      method: 'POST',
    });
  }

  async clockOutJob(id: string): Promise<CleaningJob> {
    return this.request<CleaningJob>(`/api/v1/jobs/${id}/clock-out`, {
      method: 'POST',
    });
  }

  async updateJobStatus(id: string, status: string): Promise<CleaningJob> {
    return this.request<CleaningJob>(`/api/v1/jobs/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async assignStaffToJob(id: string, contactId: string): Promise<void> {
    await this.request(`/api/v1/jobs/${id}/assign`, {
      method: 'POST',
      body: { contact_id: contactId },
    });
  }

  // ============================================================================
  // Contacts
  // ============================================================================

  async getContacts(opts?: { limit?: number; offset?: number }): Promise<Contact[]> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set('limit', String(opts.limit));
    if (opts?.offset) params.set('offset', String(opts.offset));
    const query = params.toString() ? `?${params}` : '';
    return this.request<Contact[]>(`/api/v1/contacts${query}`);
  }

  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/api/v1/contacts/${id}`);
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>('/api/v1/contacts', {
      method: 'POST',
      body: contact,
    });
  }

  // ============================================================================
  // Admin - Pending Contacts
  // ============================================================================

  async getPendingContacts(): Promise<unknown[]> {
    return this.request<unknown[]>('/api/v1/admin/pending-contacts');
  }

  async approvePendingContact(id: string, contactId: string): Promise<void> {
    await this.request(`/api/v1/admin/pending-contacts/${id}/approve`, {
      method: 'POST',
      body: { contact_id: contactId },
    });
  }

  async createContactFromPending(id: string, data: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>(`/api/v1/admin/pending-contacts/${id}/create`, {
      method: 'POST',
      body: data,
    });
  }

  async rejectPendingContact(id: string): Promise<void> {
    await this.request(`/api/v1/admin/pending-contacts/${id}/reject`, {
      method: 'POST',
    });
  }
}

// Singleton instance
export const api = new ApiClient();
