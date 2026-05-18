import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getData } from '../data/db'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    const data = getData()
    const user = data.users.find(
      u => u.email === email && u.password === password
    )

    if (!user) {
      toast.error('Invalid email or password')
      return
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user))

    if (user.role === 'employee') navigate('/employee')
    else if (user.role === 'manager') navigate('/manager')
    else if (user.role === 'admin') navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Goal Portal
        </h1>
        <p className="text-center text-gray-500 mb-6">AtomQuest Hackathon</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>

        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>👤 employee@test.com / 1234</p>
          <p>👔 manager@test.com / 1234</p>
          <p>🔧 admin@test.com / 1234</p>
        </div>
      </div>
    </div>
  )
}