import { useState } from 'react'
import Navbar from '../components/Navbar'
import { getData, saveData } from '../data/db'
import toast from 'react-hot-toast'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export default function ManagerDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'))
  const [data, setData] = useState(getData())
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [activeTab, setActiveTab] = useState('approval')
  const [selectedQuarter, setSelectedQuarter] = useState('Q1')
  const [comment, setComment] = useState('')
  const [checkinComments, setCheckinComments] = useState({})

  const myEmployees = data.users.filter(u => u.managerId === user.id)

  const employeeGoals = selectedEmployee
    ? data.goals.filter(g => g.employeeId === selectedEmployee.id)
    : []

  const pendingGoals = employeeGoals.filter(g => g.status === 'pending')
  const approvedGoals = employeeGoals.filter(g => g.status === 'approved')

  const handleApprove = (goalId) => {
    const updatedGoals = data.goals.map(g =>
      g.id === goalId ? { ...g, status: 'approved' } : g
    )
    const log = {
      id: Date.now(),
      action: 'approved',
      goalId,
      by: user.name,
      at: new Date().toISOString(),
      comment,
    }
    const updated = { ...data, goals: updatedGoals, auditLogs: [...data.auditLogs, log] }
    saveData(updated)
    setData(updated)
    setComment('')
    toast.success('Goal approved!')
  }

  const handleReject = (goalId) => {
    const updatedGoals = data.goals.map(g =>
      g.id === goalId ? { ...g, status: 'rejected' } : g
    )
    const log = {
      id: Date.now(),
      action: 'rejected',
      goalId,
      by: user.name,
      at: new Date().toISOString(),
      comment,
    }
    const updated = { ...data, goals: updatedGoals, auditLogs: [...data.auditLogs, log] }
    saveData(updated)
    setData(updated)
    setComment('')
    toast.success('Goal rejected!')
  }

  const getAchievement = (goalId) => {
    return data.achievements.find(
      a => a.goalId === goalId && a.quarter === selectedQuarter
    )
  }

  const computeScore = (goal, actual) => {
    if (!actual) return 'N/A'
    const target = Number(goal.target)
    const actualNum = Number(actual)
    if (goal.uom === 'Zero-based') return actualNum === 0 ? '100%' : '0%'
    if (goal.uom === 'Numeric' || goal.uom === '%') {
      return ((actualNum / target) * 100).toFixed(1) + '%'
    }
    return 'N/A'
  }

  const handleSaveCheckin = (goalId) => {
    const key = `${goalId}_${selectedQuarter}`
    const text = checkinComments[key]
    if (!text) {
      toast.error('Please enter a comment')
      return
    }
    const newComment = {
      id: Date.now(),
      goalId,
      managerId: user.id,
      managerName: user.name,
      quarter: selectedQuarter,
      comment: text,
      at: new Date().toISOString(),
    }
    const updated = {
      ...data,
      checkinComments: [...(data.checkinComments || []), newComment]
    }
    saveData(updated)
    setData(updated)
    toast.success('Check-in comment saved!')
  }

  const getCheckinComment = (goalId) => {
    return (data.checkinComments || []).find(
      c => c.goalId === goalId && c.quarter === selectedQuarter
    )
  }

  const getStatusColor = (status) => {
    if (status === 'draft') return 'bg-gray-100 text-gray-600'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (status === 'approved') return 'bg-green-100 text-green-700'
    if (status === 'rejected') return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manager Dashboard</h2>

        <div className="grid grid-cols-3 gap-6">

          {/* Employee List */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-700 mb-3">My Team</h3>
            {myEmployees.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-4 text-center text-gray-400 text-sm">
                No employees found
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myEmployees.map(emp => {
                  const empGoals = data.goals.filter(g => g.employeeId === emp.id)
                  const pending = empGoals.filter(g => g.status === 'pending').length
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`bg-white rounded-xl shadow p-4 cursor-pointer hover:border-blue-400 border-2 ${selectedEmployee?.id === emp.id ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                      {pending > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {pending} pending
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="col-span-2">
            {!selectedEmployee ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                Select an employee to view their goals
              </div>
            ) : (
              <div>
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  {['approval', 'checkin'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {tab === 'approval' ? '✓ Approval' : '📋 Check-in'}
                    </button>
                  ))}
                </div>

                {/* APPROVAL TAB */}
                {activeTab === 'approval' && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Pending Goals — {selectedEmployee.name}
                    </h3>
                    {pendingGoals.length === 0 ? (
                      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
                        No pending goals
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {pendingGoals.map(goal => (
                          <div key={goal.id} className="bg-white rounded-xl shadow p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                                <p className="text-sm text-gray-500">{goal.thrustArea} • {goal.uom} • Target: {goal.target}</p>
                                <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                                  {goal.status}
                                </span>
                                <span className="text-sm font-semibold text-blue-600">{goal.weightage}%</span>
                              </div>
                            </div>
                            <div className="mt-3 border-t pt-3">
                              <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                                placeholder="Add a comment (optional)"
                                rows={2}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(goal.id)}
                                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleReject(goal.id)}
                                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CHECKIN TAB */}
                {activeTab === 'checkin' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Check-in — {selectedEmployee.name}
                      </h3>
                      <div className="flex gap-2">
                        {QUARTERS.map(q => (
                          <button
                            key={q}
                            onClick={() => setSelectedQuarter(q)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedQuarter === q ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {approvedGoals.length === 0 ? (
                      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
                        No approved goals yet
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {approvedGoals.map(goal => {
                          const achievement = getAchievement(goal.id)
                          const savedComment = getCheckinComment(goal.id)
                          const key = `${goal.id}_${selectedQuarter}`
                          return (
                            <div key={goal.id} className="bg-white rounded-xl shadow p-5">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                                  <p className="text-sm text-gray-500">{goal.thrustArea} • Target: {goal.target}</p>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">{goal.weightage}%</span>
                              </div>

                              {/* Achievement Info */}
                              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <p className="text-gray-400 text-xs">Target</p>
                                    <p className="font-semibold">{goal.target}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-xs">Actual</p>
                                    <p className="font-semibold">{achievement?.actual || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-xs">Score</p>
                                    <p className="font-semibold text-blue-600">
                                      {achievement ? computeScore(goal, achievement.actual) : '—'}
                                    </p>
                                  </div>
                                </div>
                                {achievement && (
                                  <p className="text-center text-xs mt-2 text-gray-500">
                                    Status: {achievement.status}
                                  </p>
                                )}
                              </div>

                              {/* Saved Comment */}
                              {savedComment && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm text-blue-700">
                                  <p className="font-medium">Your comment ({selectedQuarter}):</p>
                                  <p>{savedComment.comment}</p>
                                </div>
                              )}

                              {/* Add Comment */}
                              <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
                                placeholder={`Add check-in comment for ${selectedQuarter}...`}
                                rows={2}
                                value={checkinComments[key] || ''}
                                onChange={e => setCheckinComments({
                                  ...checkinComments,
                                  [key]: e.target.value
                                })}
                              />
                              <button
                                onClick={() => handleSaveCheckin(goal.id)}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Save Comment
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}