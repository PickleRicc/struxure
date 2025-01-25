import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    } else {
      router.replace('/dashboard')
    }
  }, [user, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  )
}
