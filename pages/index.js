import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  // Show nothing while checking authentication
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Struxure</h1>
          <p className="text-gray-300">You are logged in as {user.email}</p>
        </div>
      </div>
    </div>
  )
}
