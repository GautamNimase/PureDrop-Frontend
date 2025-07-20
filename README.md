# Water Management System

A full-featured admin dashboard and user portal for managing water utility operations, built with React (frontend) and Express (backend).

## Features
- **Admin Dashboard** with:
  - Summary cards (customers, employees, connections, bills, readings, sources, alerts, complaints, etc.)
  - Recent activity feed (audit logs)
  - Quick actions (add/edit entities, view alerts)
- **CRUD for all major entities:**
  - Customers
  - Employees
  - Water Connections
  - Meter Readings
  - Bills
  - Water Sources
  - Water Quality
  - Audit Logs (read-only)
  - Alerts (read-only)
  - Complaints
- **Validation, modals, and responsive tables** for all admin pages
- **Audit logging** for all create/update/delete actions
- **Modern, accessible, mobile-friendly UI**

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Node.js, Express (in-memory data)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd watersystem
```

### 2. Install Dependencies
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Run the Application
#### Start Backend
```bash
cd backend
npm start
```
- The backend runs on [http://localhost:5000](http://localhost:5000)

#### Start Frontend
```bash
cd ../frontend
npm start
```
- The frontend runs on [http://localhost:3000](http://localhost:3000)

### 4. Usage
- Visit [http://localhost:3000](http://localhost:3000) in your browser.
- Log in as admin or user (authentication is mocked or can be extended).
- Use the sidebar to navigate between dashboard sections.
- Perform CRUD operations, view audit logs, and manage alerts/complaints.

## Project Structure
```
watersystem/
  backend/      # Express API (in-memory data, REST endpoints)
  frontend/     # React app (admin & user dashboards)
```

## Customization
- To persist data, replace in-memory arrays with a database (e.g., MongoDB, PostgreSQL).
- To add authentication, integrate JWT or OAuth in backend and frontend.

## License
MIT (or your chosen license) 