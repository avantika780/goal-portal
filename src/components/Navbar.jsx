import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('loggedInUser'))

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser')
    navigate('/')
  }

  return (
    <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">🎯 Goal Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm">👤 {user?.name}</span>
        <span className="text-xs bg-blue-500 px-2 py-1 rounded-full capitalize">{user?.role}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 text-sm px-3 py-1 rounded-lg font-semibold hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  )
}