import { useRouter } from 'next/router'
import { useAuth } from '../utils/AuthContext'
import { signOut, supabase } from '../utils/supabase'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newProjectTitle, setNewProjectTitle] = useState('')

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      Authorization: `Bearer ${session?.access_token}`
    }
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = await getAuthHeader()
      const res = await fetch('/api/projects/list', { headers })
      if (!res.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await res.json()
      // Ensure data is an array
      setProjects(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(error.message)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'
      
      const res = await fetch('/api/projects/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: newProjectTitle || 'Untitled Project' })
      })
      if (!res.ok) {
        throw new Error('Failed to create project')
      }
      const newProject = await res.json()
      setProjects(prev => [newProject, ...prev])
      setNewProjectTitle('')
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error.message)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login')
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Struxure</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Project Form */}
        <form onSubmit={createProject} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="New Project Title"
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200"
            >
              Create Project
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
        </form>

        {/* Projects List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">
                {error ? 'Error loading projects. Please try again.' : 'No projects yet. Create one to get started!'}
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition duration-200"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition duration-200"
                >
                  View Project
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
