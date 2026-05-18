export const defaultData = {
  users: [
    { id: 1, name: 'Alice Employee', email: 'employee@test.com', password: '1234', role: 'employee', managerId: 2 },
    { id: 2, name: 'Bob Manager', email: 'manager@test.com', password: '1234', role: 'manager', managerId: null },
    { id: 3, name: 'Carol Admin', email: 'admin@test.com', password: '1234', role: 'admin', managerId: null },
  ],
  goals: [],
  achievements: [],
  auditLogs: [],
}

// Load from localStorage or use default
export const getData = () => {
  const stored = localStorage.getItem('goalPortalData')
  return stored ? JSON.parse(stored) : defaultData
}

// Save to localStorage
export const saveData = (data) => {
  localStorage.setItem('goalPortalData', JSON.stringify(data))
}