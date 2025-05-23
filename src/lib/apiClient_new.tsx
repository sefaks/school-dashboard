// lib/serverApi.ts
import { headers, cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';

export async function serverApi(endpoint: string, options: RequestInit = {}) {
  // Sunucu tarafında token alma seçeneği 1: Cookie'den alma
  const cookieStore = cookies();
  const cookieToken = cookieStore.get('next-auth.session-token')?.value;
  
  // Sunucu tarafında token alma seçeneği 2: Session'dan alma
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.accessToken;
  
  // Hangi token varsa onu kullan
  const token = sessionToken || cookieToken;
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const url = `${baseURL}${endpoint}`;
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // SSR için cache'i devre dışı bırak
  };
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

// GET isteği için kısa yol
export async function serverGet(endpoint: string) {
  return serverApi(endpoint, { method: 'GET' });
}

// POST isteği için kısa yol
export async function serverPost(endpoint: string, data: any) {
  return serverApi(endpoint, { 
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// PUT isteği için kısa yol
export async function serverPut(endpoint: string, data: any) {
  return serverApi(endpoint, { 
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// DELETE isteği için kısa yol
export async function serverDelete(endpoint: string) {
  return serverApi(endpoint, { method: 'DELETE' });
}