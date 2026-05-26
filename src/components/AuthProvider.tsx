'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/ui'
import { useProdeStore } from '@/store/prode'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUserFromStorage, currentUser } = useUIStore()

  useEffect(() => {
    // Load user from localStorage on app start
    loadUserFromStorage()
  }, [loadUserFromStorage])

  useEffect(() => {
    // Load matches and standings for everyone (public data)
    console.log('AuthProvider: Loading public data...')
    useProdeStore.getState().loadMatches().catch((err) => {
      console.error('AuthProvider: Failed to load matches:', err)
    })
    useProdeStore.getState().loadStandings().catch((err) => {
      console.error('AuthProvider: Failed to load standings:', err)
    })
  }, [])

  // useEffect(() => {
  //   // Load user predictions if logged in
  //   // Temporarily disabled - predictions will load on demand
  //   if (currentUser?.uid) {
  //     useProdeStore.getState().loadPredictions(currentUser.uid).catch((err) => {
  //       console.error('AuthProvider: Failed to load predictions:', err)
  //     })
  //   }
  // }, [currentUser?.uid])

  return <>{children}</>
}
