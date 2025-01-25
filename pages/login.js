import Login from '../components/auth/Login'
import { useAuth } from '../utils/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Add a console.log to debug
  console.log('Rendering LoginPage, user:', user)
  
  return (
    <div className="min-h-screen">
      <Login />
    </div>
  )
}
