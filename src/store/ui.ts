'use client'

import { create } from 'zustand'
import { User } from '@/lib/types'
import { api } from '@/lib/api'

interface UIState {
  currentUser: User | null
  isLoggedIn: boolean
  authReady: boolean
  isLoading: boolean

  setUser: (user: User | null) => void
  loginWithGoogle: (token: string) => Promise<void>
  logout: () => void
  loadUserFromStorage: () => void
  setAuthReady: (ready: boolean) => void
}

const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null

  const uid = localStorage.getItem('auth_user_id')
  const displayName = localStorage.getItem('auth_user_name')
  const email = localStorage.getItem('auth_user_email')
  const photoURL = localStorage.getItem('auth_user_photo')

  if (!uid) return null

  return { uid, displayName: displayName || '', email: email || '', photoURL: photoURL || '' }
}

const saveUserToStorage = (user: User | null) => {
  if (typeof window === 'undefined') return

  if (user) {
    localStorage.setItem('auth_user_id', user.uid)
    localStorage.setItem('auth_user_name', user.displayName)
    localStorage.setItem('auth_user_email', user.email)
    localStorage.setItem('auth_user_photo', user.photoURL)
  } else {
    localStorage.removeItem('auth_user_id')
    localStorage.removeItem('auth_user_name')
    localStorage.removeItem('auth_user_email')
    localStorage.removeItem('auth_user_photo')
  }
}

const getTokenFromStorage = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

const saveTokenToStorage = (token: string | null) => {
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export const useUIStore = create<UIState>()((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  authReady: false,
  isLoading: false,

  setUser: (user) => {
    saveUserToStorage(user)
    set({ currentUser: user, isLoggedIn: !!user })
  },

  loginWithGoogle: async (token: string) => {
    set({ isLoading: true })
    try {
      const response = await api.googleAuth(token)

      saveTokenToStorage(response.token)
      saveUserToStorage(response.user)

      set({
        currentUser: response.user,
        isLoggedIn: true,
        isLoading: false,
      })
    } catch (error) {
      console.error('Login failed:', error)
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    saveTokenToStorage(null)
    saveUserToStorage(null)
    set({ currentUser: null, isLoggedIn: false })
  },

  loadUserFromStorage: () => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()

    set({
      currentUser: user,
      isLoggedIn: !!user && !!token,
      authReady: true,
    })
  },

  setAuthReady: (ready) => set({ authReady: ready }),
}))
