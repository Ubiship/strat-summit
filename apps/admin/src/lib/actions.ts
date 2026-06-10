'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type LoginResult = {
  success: true;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    contact_id: string;
  };
} | {
  success: false;
  error: string;
};

export async function login(formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error?.message || 'Invalid credentials',
      };
    }

    const data = json.data;

    // Set refresh token in httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Also store the access token in a cookie for SSR
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // Call backend logout if we have a token
  if (accessToken) {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Ignore errors - we're logging out anyway
    }
  }

  // Clear cookies
  cookieStore.delete('refresh_token');
  cookieStore.delete('access_token');

  redirect('/login');
}

export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // If we have a valid access token, return it
  if (accessToken) {
    // Simple expiry check - JWT structure is header.payload.signature
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        return accessToken;
      }
    } catch {
      // Token is malformed, try refresh
    }
  }

  // Try to refresh
  if (!refreshToken) {
    return null;
  }

  // We need the old access token for refresh (even if expired)
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const data = json.data;

    // Update cookies with new tokens
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    cookieStore.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return data.access_token as string;
  } catch {
    return null;
  }
}

export async function getServerUser() {
  const token = await getServerToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub || payload.user_id,
      role: payload.role,
      contactId: payload.contact_id,
    };
  } catch {
    return null;
  }
}
