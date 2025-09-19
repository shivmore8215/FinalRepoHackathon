import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  lastLogin?: string
}

interface SignupData {
  username: string
  email: string
  fullName: string
  password: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (userData: SignupData) => Promise<boolean>
  approveUser: (userId: string) => Promise<boolean>
  getAllPendingUsers: () => Promise<User[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api'
const TOKEN_KEY = 'train_plan_wise_token'

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || 'API request failed')
  }
  
  return response.json()
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        try {
          const response = await apiCall('/auth/me')
          setUser(response.user)
        } catch (error) {
          console.error('Error loading user:', error)
          localStorage.removeItem(TOKEN_KEY)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })

      // Store token and user data
      localStorage.setItem(TOKEN_KEY, response.token)
      setUser(response.user)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
  }

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      
      return true
    } catch (error) {
      console.error('Signup error:', error)
      // Re-throw the error so the component can handle it
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const approveUser = async (userId: string): Promise<boolean> => {
    try {
      await apiCall(`/auth/approve-user/${userId}`, {
        method: 'POST',
      })
      
      return true
    } catch (error) {
      console.error('Approve user error:', error)
      return false
    }
  }

  const getAllPendingUsers = async (): Promise<User[]> => {
    try {
      const response = await apiCall('/auth/pending-users')
      return response.users || []
    } catch (error) {
      console.error('Get pending users error:', error)
      return []
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    approveUser,
    getAllPendingUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}