# PureDrop

A modern, fullstack water management system for users and administrators. PureDrop enables real-time monitoring, billing, alerts, and analytics for water usage and quality.

---

## Features
- User and admin dashboards
- Secure login/signup with JWT
- MongoDB database with Mongoose ODM
- Meter readings, billing, alerts, complaints, and more
- Responsive React frontend
- Node.js/Express backend
- Role-based access and route protection
- Beautiful UI/UX with accessibility

---

## Tech Stack
- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Node.js, Express (in-memory data)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local or cloud)

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

### 3. Environment Setup
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/watersystem
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### 4. Run the Application
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

### 5. Add Sample Data (Optional)
```bash
cd backend
node add-sample-data.js
```

### 6. Usage
- Visit [http://localhost:3000](http://localhost:3000) in your browser.
- Log in as admin or user (authentication is mocked or can be extended).
- Use the sidebar to navigate between dashboard sections.
- Perform CRUD operations, view audit logs, and manage alerts/complaints.

## Project Structure
```
watersystem/
  backend/      # Express API with MongoDB
  frontend/     # React app (admin & user dashboards)
```

## Database Schema
- **Users** - Customer information and connection types
- **Employees** - Staff management and roles
- **Water Sources** - Reservoirs, wells, rivers, lakes
- **Connections** - User-source connections with meters
- **Meter Readings** - Consumption tracking with automatic billing
- **Bills** - Payment management with status tracking
- **Alerts** - System notifications and warnings
- **Complaints** - Customer service management
- **Audit Logs** - System activity tracking

## Key Features
- **Automatic Billing** - Bills generated from meter readings
- **High Consumption Alerts** - Automatic alerts for >100 units
- **Payment Tracking** - Overdue detection and payment processing
- **Audit Logging** - Complete activity tracking
- **Role-based Access** - Admin and user dashboards
- **Real-time Analytics** - Consumption and billing reports

## License
MIT (or your chosen license) 
