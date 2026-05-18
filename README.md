# Goal Setting & Tracking Portal
### AtomQuest Hackathon 1.0

A web-based Goal Setting & Tracking Portal that supports the full lifecycle of employee goals — from creation and alignment to quarterly check-ins and performance visibility.

---

## Demo Credentials

| Role     | Email               | Password |
|----------|---------------------|----------|
| Employee | employee@test.com   | 1234     |
| Manager  | manager@test.com    | 1234     |
| Admin    | admin@test.com      | 1234     |

---

## Features

- Employee goal creation with validations (max 8 goals, min 10% weightage, total must equal 100%)
- Manager approval / rejection workflow
- Quarterly achievement check-ins (Q1, Q2, Q3, Q4)
- Score computation based on UoM type (Numeric, %, Zero-based)
- Admin dashboard with overview, audit log, and CSV export
- Role-based protected routes

---

## Tech Stack

- React (Vite)
- Tailwind CSS (CDN)
- React Router DOM
- React Hot Toast
- localStorage (no backend needed)

---

## How to Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Architecture

- Frontend: React + Tailwind CSS
- Data Storage: Browser localStorage
- Hosting: Vercel