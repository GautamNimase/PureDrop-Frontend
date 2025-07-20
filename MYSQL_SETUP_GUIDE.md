# 🗄️ MySQL Database Setup Guide

## **📋 Complete MySQL Integration for Water Management System**

This guide will help you connect your water management system to a MySQL database with full functionality including stored procedures, triggers, and views.

---

## **🚀 Quick Setup Steps**

### **1. Install MySQL Server**

#### **Windows:**
```bash
# Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
# Run the installer and follow the setup wizard
# Remember your root password!
```

#### **macOS:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### **2. Create Database and User**

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE watersystem;

-- Create user (optional but recommended)
CREATE USER 'watersystem_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON watersystem.* TO 'watersystem_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **3. Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=watersystem

# Server Configuration
PORT=5000

# JWT Configuration (if using authentication)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **4. Install Dependencies**

```bash
cd backend
npm install
```

### **5. Initialize Database**

```bash
# The database will be automatically initialized when you start the server
npm start
```

---

## **📊 Database Schema Overview**

### **Tables Created:**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | Customer information | Email uniqueness, status tracking |
| **employees** | Staff information | Role management, contact details |
| **water_sources** | Water supply sources | Capacity tracking, status management |
| **connections** | User water connections | Meter numbers, status tracking |
| **meter_readings** | Consumption readings | Units consumed, date tracking |
| **bills** | Billing information | Payment status, amount calculation |
| **alerts** | System notifications | Type categorization, user association |
| **complaints** | Customer complaints | Status tracking, response management |
| **audit_logs** | System audit trail | User actions, timestamp tracking |

### **Triggers Implemented:**

| Trigger | Purpose | Actions |
|---------|---------|---------|
| **after_user_insert** | User creation logging | Audit log entry |
| **after_meter_reading_insert** | Reading processing | Auto bill generation, alerts |
| **after_bill_update** | Payment processing | Alert resolution, overdue detection |
| **after_complaint_insert** | Complaint logging | Audit trail creation |
| **escalate_old_complaints** | Complaint management | Auto-escalation after 7 days |

### **Views Available:**

| View | Purpose | Data |
|------|---------|------|
| **user_overview** | User summary | Connections, bills, status |
| **outstanding_bills** | Unpaid bills | User info, amounts, dates |
| **high_consumption_alerts** | Consumption alerts | User details, consumption data |
| **user_complaints** | Complaint tracking | User info, status, responses |
| **connection_meter_readings** | Reading history | User, connection, consumption data |

### **Stored Procedures:**

| Procedure | Purpose | Parameters |
|-----------|---------|------------|
| **sp_CreateUser** | User creation | Name, email, phone, address, type |
| **sp_UpdateUser** | User modification | UserID, updated fields |
| **sp_GenerateBill** | Bill generation | MeterReadingID, rate |
| **sp_ProcessPayment** | Payment processing | BillID, amount, method |
| **sp_RecordMeterReading** | Reading recording | ConnectionID, date, units |
| **sp_GetUserSummary** | User analytics | UserID |
| **sp_GetSystemSummary** | System statistics | None |

---

## **🔧 API Endpoints**

### **Database Views as API:**

```bash
# User Overview
GET /api/views/user-overview

# Outstanding Bills
GET /api/views/outstanding-bills

# High Consumption Alerts
GET /api/views/high-consumption-alerts

# User Complaints
GET /api/views/user-complaints

# Connection Meter Readings
GET /api/views/connection-meter-readings

# Bill Payment History
GET /api/views/bill-payment-history

# System Alerts Summary
GET /api/views/system-alerts-summary
```

### **Stored Procedures as API:**

```bash
# User Management
POST /api/users                    # sp_CreateUser
PUT /api/users/:id                 # sp_UpdateUser

# Bill Management
POST /api/bills                    # sp_GenerateBill
POST /api/bills/process-payment    # sp_ProcessPayment

# Meter Readings
POST /api/readings                 # sp_RecordMeterReading

# Analytics
GET /api/users/:id/summary         # sp_GetUserSummary
GET /api/analytics/summary         # sp_GetSystemSummary
```

---

## **🧪 Testing the Setup**

### **1. Health Check**

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Water System API is running",
  "timestamp": "2023-07-19T10:30:00.000Z",
  "database": "Connected"
}
```

### **2. Database Stats**

```bash
curl http://localhost:5000/api/stats
```

**Expected Response:**
```json
{
  "users": 3,
  "employees": 3,
  "connections": 3,
  "meter_readings": 3,
  "bills": 3,
  "alerts": 3,
  "complaints": 3,
  "audit_logs": 3
}
```

### **3. Test User Overview**

```bash
curl http://localhost:5000/api/views/user-overview
```

**Expected Response:**
```json
[
  {
    "UserID": 1,
    "Name": "John Doe",
    "Email": "john@example.com",
    "ConnectionType": "Residential",
    "ConnectionStatus": "Active",
    "MeterNumber": "MTR001",
    "LatestBillID": 1,
    "LatestBillAmount": 250.00,
    "TotalConnections": 1,
    "ActiveConnections": 1
  }
]
```

---

## **🔍 Troubleshooting**

### **Common Issues:**

#### **1. Database Connection Failed**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check credentials in .env file
cat backend/.env

# Test MySQL connection
mysql -u root -p
```

#### **2. Permission Denied**
```sql
-- Grant privileges to user
GRANT ALL PRIVILEGES ON watersystem.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

#### **3. Port Already in Use**
```bash
# Kill existing Node.js processes
taskkill /f /im node.exe  # Windows
pkill node                 # Linux/macOS

# Or change port in .env
PORT=5001
```

#### **4. Module Not Found**
```bash
# Install dependencies
cd backend
npm install

# Check package.json
cat package.json
```

---

## **📈 Performance Optimization**

### **Database Indexes:**

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(Email);
CREATE INDEX idx_connections_userid ON connections(UserID);
CREATE INDEX idx_bills_status ON bills(PaymentStatus);
CREATE INDEX idx_readings_date ON meter_readings(ReadingDate);
CREATE INDEX idx_alerts_userid ON alerts(UserID);
```

### **Connection Pooling:**

The application uses MySQL2 with connection pooling for optimal performance:

```javascript
// Config in config/database.js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## **🔒 Security Considerations**

### **1. Environment Variables**
- Never commit `.env` files to version control
- Use strong passwords for database users
- Rotate secrets regularly

### **2. Database Security**
```sql
-- Create dedicated user with minimal privileges
CREATE USER 'watersystem_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON watersystem.* TO 'watersystem_app'@'localhost';
REVOKE DROP, CREATE, ALTER ON watersystem.* FROM 'watersystem_app'@'localhost';
```

### **3. API Security**
- Rate limiting enabled
- Helmet.js for security headers
- CORS configuration
- Input validation on all endpoints

---

## **🎉 Success Indicators**

Your MySQL integration is successful when:

✅ **Server starts without errors**
✅ **Health check returns "Connected"**
✅ **Database stats show populated tables**
✅ **API endpoints return data**
✅ **Triggers create audit logs automatically**
✅ **Stored procedures execute successfully**
✅ **Views return formatted data**

---

## **📚 Next Steps**

1. **Test all API endpoints** with sample data
2. **Implement frontend integration** with the new MySQL backend
3. **Add authentication** using JWT tokens
4. **Set up monitoring** and logging
5. **Deploy to production** with proper security

**Your water management system is now fully integrated with MySQL!** 🚀 