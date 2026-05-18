import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { Toaster } from 'react-hot-toast'

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('loggedInUser'))
  if (!user) return <Navigate to="/" />
  if (user.role !== role) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee" element={
          <PrivateRoute role="employee">
            <EmployeeDashboard />
          </PrivateRoute>
        } />
        <Route path="/manager" element={
          <PrivateRoute role="manager">
            <ManagerDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App