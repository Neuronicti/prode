'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/ui'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { loginWithGoogle, isLoading } = useUIStore()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleCredentialResponse,
        })

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          locale: 'es',
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleCredentialResponse = async (response: any) => {
    try {
      await loginWithGoogle(response.credential)
      router.push('/picks')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-3xl font-black text-white">
          Pro<span className="text-[#2970CA]">de</span> Mundial 2026
        </h1>
        <p className="text-zinc-400 mt-2">Hacé tus predicciones y competí con tus compañeros</p>
      </div>

      <div className="bg-[#111] rounded-2xl p-8 border border-white/5 w-full max-w-sm flex flex-col items-center gap-4">
        <p className="text-zinc-400 text-sm text-center">
          Ingresá con tu cuenta de Google para empezar
        </p>

        <div
          ref={googleButtonRef}
          className="w-full flex justify-center"
          style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.7 : 1 }}
        />

        {isLoading && <p className="text-sm text-zinc-500">Ingresando...</p>}
      </div>
    </div>
  )
}
