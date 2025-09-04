<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
>>>>>>> 0316fdbf5683d977fb8690e98e8f2bf2f2a0c34d
