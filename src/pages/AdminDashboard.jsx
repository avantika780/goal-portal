import { useState } from 'react'
import Navbar from '../components/Navbar'
import { getData, saveData } from '../data/db'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [data, setData] = useState(getData())
  const [activeTab, setActiveTab] = useState('overview')

  const employees = data.users.filter(u => u.role === 'employee')
  const managers = data.users.filter(u => u.role === 'manager')
  const allGoals = data.goals

  const approvedGoals = allGoals.filter(g => g.status === 'approved')
  const pendingGoals = allGoals.filter(g => g.status === 'pending')
  const draftGoals = allGoals.filter(g => g.status === 'draft')

  const handleUnlockGoal = (goalId) => {
    const updatedGoals = data.goals.map(g =>
      g.id === goalId ? { ...g, status: 'draft' } : g
    )
    const log = {
      id: Date.now(),
      action: 'unlocked',
      goalId,
      by: 'Admin',
      at: new Date().toISOString(),
    }
    const updated = { ...data, goals: updatedGoals, auditLogs: [...data.auditLogs, log] }
    saveData(updated)
    setData(updated)
    toast.success('Goal unlocked!')
  }

  const handleExportCSV = () => {
    const rows = [
      ['Employee', 'Goal Title', 'Thrust Area', 'UoM', 'Target', 'Weightage', 'Status'],
      ...allGoals.map(g => [
        g.employeeName,
        g.title,
        g.thrustArea,
        g.uom,
        g.target,
        g.weightage,
        g.status,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'goals_report.csv'
    a.click()
    toast.success('CSV downloaded!')
  }

  const tabs = ['overview', 'goals', 'audit']

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
                <p className="text-sm text-gray-500 mt-1">Employees</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{managers.length}</p>
                <p className="text-sm text-gray-500 mt-1">Managers</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{approvedGoals.length}</p>
                <p className="text-sm text-gray-500 mt-1">Approved Goals</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{pendingGoals.length}</p>
                <p className="text-sm text-gray-500 mt-1">Pending Approval</p>
              </div>
            </div>

            {/* Employee Status Table */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Employee Goal Status</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Employee</th>
                    <th className="pb-2">Total Goals</th>
                    <th className="pb-2">Approved</th>
                    <th className="pb-2">Pending</th>
                    <th className="pb-2">Draft</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const empGoals = allGoals.filter(g => g.employeeId === emp.id)
                    return (
                      <tr key={emp.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{emp.name}</td>
                        <td className="py-2">{empGoals.length}</td>
                        <td className="py-2 text-green-600">{empGoals.filter(g => g.status === 'approved').length}</td>
                        <td className="py-2 text-yellow-600">{empGoals.filter(g => g.status === 'pending').length}</td>
                        <td className="py-2 text-gray-400">{empGoals.filter(g => g.status === 'draft').length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="flex flex-col gap-4">
            {allGoals.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                No goals found
              </div>
            ) : (
              allGoals.map(goal => (
                <div key={goal.id} className="bg-white rounded-xl shadow p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{goal.employeeName}</p>
                      <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                      <p className="text-sm text-gray-500">{goal.thrustArea} • {goal.uom} • Target: {goal.target} • Weightage: {goal.weightage}%</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        goal.status === 'approved' ? 'bg-green-100 text-green-700' :
                        goal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        goal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {goal.status}
                      </span>
                      {goal.status === 'approved' && (
                        <button
                          onClick={() => handleUnlockGoal(goal.id)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          🔓 Unlock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Audit Log</h3>
            {data.auditLogs.length === 0 ? (
              <p className="text-center text-gray-400">No audit logs yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {[...data.auditLogs].reverse().map(log => (
                  <div key={log.id} className="border-b pb-3 last:border-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{log.by}</span> {log.action} goal #{log.goalId}
                    </p>
                    {log.comment && <p className="text-xs text-gray-500 mt-0.5">Comment: {log.comment}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(log.at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}