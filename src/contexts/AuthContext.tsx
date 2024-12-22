"use client"

import { createContext, useContext, useEffect, useState } from "react"
import axios from 'axios';

// Kullanıcı tipi tanımı
type User = {
  id: string
  email: string
  name: string
  role: 'teacher' | 'admin'
}

// Context için tip tanımı
type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// Context oluşturma
const AuthContext = createContext<AuthContextType | null>(null)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Kullanıcı bilgilerini getir
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token || !role) {
        setUser(null);
        setLoading(false);
        return;
      }
  

    const endpoint = role === 'teacher' 
        ? 'http://127.0.0.1:8000/auth/teacher/me'
        : 'http://127.0.0.1:8000/auth/institution_admin/me';

    const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Fetched User:', response.data); // Response'u burada loglayın.

    setUser({
        ...response.data,
        role: role as 'teacher' | 'admin'
    });
      setError(null);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user data');
      logout();
    } finally {
      setLoading(false);
    }
  };
  

  // Login fonksiyonu
  const login = async (email: string, password: string, role: string) => {
    setLoading(true)
    try {
      const endpoint = role === 'teacher'
        ? 'http://127.0.0.1:8000/auth/teacher/login'
        : 'http://127.0.0.1:8000/auth/institution_admin/login'

      const response = await axios.post(endpoint, { email, password })
      
      const token = response.data.access_token
      
      // Token'ı kaydet
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`
      document.cookie = `role=${role}; path=/; Secure; SameSite=Strict`

      // Kullanıcı bilgilerini getir
      await fetchUser()
      
      // Yönlendirme
      window.location.href = role === 'teacher' ? '/teacher' : '/admin'
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.response?.data?.detail || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout fonksiyonu
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setUser(null)
    window.location.href = '/login'
  }

  // Sayfa yüklendiğinde kullanıcı bilgilerini kontrol et
  useEffect(() => {
    fetchUser()
  }, [])

  // Context değerleri
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser: fetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

