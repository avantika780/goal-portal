import { useState } from 'react'
import Navbar from '../components/Navbar'
import { getData, saveData } from '../data/db'
import toast from 'react-hot-toast'

const THRUST_AREAS = ['Sales', 'Operations', 'HR', 'Finance', 'Technology', 'Customer Service']
const UOM_TYPES = ['Numeric', '%', 'Timeline', 'Zero-based']
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export default function EmployeeDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'))
  const [data, setData] = useState(getData())
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('goals')
  const [selectedQuarter, setSelectedQuarter] = useState('Q1')

  const myGoals = data.goals.filter(g => g.employeeId === user.id)
  const approvedGoals = myGoals.filter(g => g.status === 'approved')

  const [form, setForm] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uom: '',
    target: '',
    weightage: '',
  })

  const [achievementForm, setAchievementForm] = useState({})

  const handleAddGoal = () => {
    if (!form.thrustArea || !form.title || !form.uom || !form.target || !form.weightage) {
      toast.error('Please fill all fields')
      return
    }
    if (myGoals.length >= 8) {
      toast.error('Maximum 8 goals allowed')
      return
    }
    const weightage = Number(form.weightage)
    if (weightage < 10) {
      toast.error('Minimum weightage is 10%')
      return
    }
    const totalWeightage = myGoals
      .filter(g => g.status === 'draft')
      .reduce((sum, g) => sum + Number(g.weightage), 0)
    if (totalWeightage + weightage > 100) {
      toast.error(`Total weightage cannot exceed 100%. You have ${100 - totalWeightage}% remaining`)
      return
    }
    const newGoal = {
      id: Date.now(),
      employeeId: user.id,
      employeeName: user.name,
      ...form,
      weightage,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    const updated = { ...data, goals: [...data.goals, newGoal] }
    saveData(updated)
    setData(updated)
    setForm({ thrustArea: '', title: '', description: '', uom: '', target: '', weightage: '' })
    setShowForm(false)
    toast.success('Goal added!')
  }

  const handleSubmitAll = () => {
    const draftGoals = myGoals.filter(g => g.status === 'draft')

    if (draftGoals.length === 0) {
      toast.error('No draft goals to submit')
      return
    }

    const totalWeightage = draftGoals.reduce((sum, g) => sum + Number(g.weightage), 0)

    if (totalWeightage !== 100) {
      toast.error(`Total weightage must be 100%. Currently ${totalWeightage}%`)
      return
    }

    const updatedGoals = data.goals.map(g =>
      g.employeeId === user.id && g.status === 'draft'
        ? { ...g, status: 'pending' }
        : g
    )

    const updated = { ...data, goals: updatedGoals }
    saveData(updated)
    setData(updated)
    toast.success('Goals submitted for approval!')
  }

  const handleDeleteGoal = (id) => {
    const updatedGoals = data.goals.filter(g => g.id !== id)
    const updated = { ...data, goals: updatedGoals }
    saveData(updated)
    setData(updated)
    toast.success('Goal deleted')
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

  const handleSaveAchievement = (goalId) => {
    const key = `${goalId}_${selectedQuarter}`
    const entry = achievementForm[key]
    if (!entry?.actual || !entry?.status) {
      toast.error('Please enter actual value and status')
      return
    }
    const existing = data.achievements.filter(
      a => !(a.goalId === goalId && a.quarter === selectedQuarter)
    )
    const newEntry = {
      id: Date.now(),
      goalId,
      employeeId: user.id,
      quarter: selectedQuarter,
      actual: entry.actual,
      status: entry.status,
      updatedAt: new Date().toISOString(),
    }
    const updated = { ...data, achievements: [...existing, newEntry] }
    saveData(updated)
    setData(updated)
    toast.success(`${selectedQuarter} achievement saved!`)
  }

  const getAchievement = (goalId) => {
    return data.achievements.find(
      a => a.goalId === goalId && a.quarter === selectedQuarter
    )
  }

  const getStatusColor = (status) => {
    if (status === 'draft') return 'bg-gray-100 text-gray-600'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (status === 'approved') return 'bg-green-100 text-green-700'
    if (status === 'rejected') return 'bg-red-100 text-red-700'
  }

  const totalWeightage = myGoals
    .filter(g => g.status === 'draft')
    .reduce((sum, g) => sum + Number(g.weightage), 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['goals', 'achievements'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* GOALS TAB */}
        {activeTab === 'goals' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">My Goals</h2>
                <p className="text-gray-500 text-sm">Draft weightage: {totalWeightage}% / 100%</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Add Goal
                </button>
                <button
                  onClick={handleSubmitAll}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Submit for Approval
                </button>
              </div>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">New Goal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Thrust Area</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      value={form.thrustArea}
                      onChange={e => setForm({ ...form, thrustArea: e.target.value })}
                    >
                      <option value="">Select</option>
                      {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Unit of Measurement</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      value={form.uom}
                      onChange={e => setForm({ ...form, uom: e.target.value })}
                    >
                      <option value="">Select</option>
                      {UOM_TYPES.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Goal Title</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      placeholder="Enter goal title"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Description</label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      placeholder="Enter description"
                      rows={2}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Target</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      placeholder="e.g. 100"
                      value={form.target}
                      onChange={e => setForm({ ...form, target: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Weightage (%)</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                      placeholder="min 10%"
                      value={form.weightage}
                      onChange={e => setForm({ ...form, weightage: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleAddGoal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Goal</button>
                  <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            )}

            {myGoals.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                No goals yet. Click "Add Goal" to start.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {myGoals.map(goal => (
                  <div key={goal.id} className="bg-white rounded-xl shadow p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                        <p className="text-sm text-gray-500">{goal.thrustArea} • {goal.uom} • Target: {goal.target}</p>
                        <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>{goal.status}</span>
                        <span className="text-sm font-semibold text-blue-600">{goal.weightage}%</span>
                        {goal.status === 'draft' && (
                          <button onClick={() => handleDeleteGoal(goal.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quarterly Check-ins</h2>
              <div className="flex gap-2">
                {QUARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedQuarter === q ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {approvedGoals.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                No approved goals yet. Get your goals approved first.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {approvedGoals.map(goal => {
                  const key = `${goal.id}_${selectedQuarter}`
                  const saved = getAchievement(goal.id)
                  return (
                    <div key={goal.id} className="bg-white rounded-xl shadow p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                          <p className="text-sm text-gray-500">{goal.thrustArea} • {goal.uom} • Target: {goal.target}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{goal.weightage}%</span>
                      </div>

                      {saved && (
                        <div className="bg-green-50 rounded-lg p-3 mb-3 text-sm">
                          <p className="text-green-700 font-medium">Saved for {selectedQuarter}</p>
                          <p className="text-gray-600">Actual: {saved.actual} | Status: {saved.status} | Score: {computeScore(goal, saved.actual)}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-gray-600">Actual Achievement</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            placeholder="Enter actual value"
                            value={achievementForm[key]?.actual || ''}
                            onChange={e => setAchievementForm({
                              ...achievementForm,
                              [key]: { ...achievementForm[key], actual: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <select
                            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                            value={achievementForm[key]?.status || ''}
                            onChange={e => setAchievementForm({
                              ...achievementForm,
                              [key]: { ...achievementForm[key], status: e.target.value }
                            })}
                          >
                            <option value="">Select</option>
                            <option>Not Started</option>
                            <option>On Track</option>
                            <option>Completed</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveAchievement(goal.id)}
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Save {selectedQuarter} Achievement
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}