import { useRouter } from 'next/router'
import { useAuth } from '../utils/AuthContext'
import { signOut } from '../utils/supabase'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) {
    return null // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Struxure</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to your Dashboard</h2>
          <p className="text-gray-300">
            You're now signed in as {user?.email}
          </p>
        </div>
      </main>
    </div>
  )
}
