import SignUp from '../components/auth/SignUp'
import { useAuth } from '../utils/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function SignUpPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return <SignUp />
}
