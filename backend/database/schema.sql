-- Water Management System Database Schema
-- MySQL Database Schema for Water Management System

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS watersystem;


-- -- Drop existing tables if they exist
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS alerts;
-- DROP TABLE IF EXISTS complaints;
-- DROP TABLE IF EXISTS bills;
-- DROP TABLE IF EXISTS meter_readings;
-- DROP TABLE IF EXISTS connections;
-- DROP TABLE IF EXISTS employees;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS water_sources;

-- Create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    Address TEXT,
    ConnectionType ENUM('Residential', 'Commercial', 'Industrial') DEFAULT 'Residential',
    Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add PasswordHash to users table if not present
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS PasswordHash VARCHAR(255);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Contact VARCHAR(100),
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Water Sources table
CREATE TABLE IF NOT EXISTS water_sources (
    SourceID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Type ENUM('Reservoir', 'Well', 'River', 'Lake') NOT NULL,
    Capacity DECIMAL(10,2),
    Status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    ConnectionID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    SourceID INT NOT NULL,
    MeterNumber VARCHAR(50) UNIQUE NOT NULL,
    ConnectionDate DATE NOT NULL,
    Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (SourceID) REFERENCES water_sources(SourceID) ON DELETE CASCADE
);

-- Meter Readings table
CREATE TABLE IF NOT EXISTS meter_readings (
    MeterReadingID INT PRIMARY KEY AUTO_INCREMENT,
    ConnectionID INT NOT NULL,
    ReadingDate DATE NOT NULL,
    UnitsConsumed DECIMAL(10,2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ConnectionID) REFERENCES connections(ConnectionID) ON DELETE CASCADE
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    BillID INT PRIMARY KEY AUTO_INCREMENT,
    MeterReadingID INT NOT NULL,
    BillDate DATE NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentStatus ENUM('Paid', 'Unpaid', 'Overdue') DEFAULT 'Unpaid',
    PaymentDate TIMESTAMP NULL,
    PaymentMethod VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MeterReadingID) REFERENCES meter_readings(MeterReadingID) ON DELETE CASCADE
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    AlertID INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(50) NOT NULL,
    Message TEXT NOT NULL,
    Status ENUM('Active', 'Resolved') DEFAULT 'Active',
    Severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    UserID INT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE SET NULL
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    ComplaintID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Type ENUM('Service', 'Billing', 'Quality', 'Technical') NOT NULL,
    Description TEXT NOT NULL,
    Status ENUM('Open', 'In Progress', 'Resolved', 'Escalated') DEFAULT 'Open',
    Response TEXT,
    Date DATE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    LogID INT PRIMARY KEY AUTO_INCREMENT,
    User VARCHAR(100) NOT NULL,
    Action VARCHAR(100) NOT NULL,
    Details TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data

-- Insert sample users
-- INSERT INTO users (Name, Email, Phone, Address, ConnectionType) VALUES
-- ('John Doe', 'john@example.com', '1234567890', '123 Main St', 'Residential'),
-- ('Jane Smith', 'jane@example.com', '0987654321', '456 Oak Ave', 'Commercial'),
-- ('Bob Wilson', 'bob@example.com', '5551234567', '789 Pine Rd', 'Industrial');

-- -- Insert sample employees
-- INSERT INTO employees (Name, Role, Contact) VALUES
-- ('Alice Johnson', 'Manager', 'alice@example.com'),
-- ('Bob Smith', 'Technician', 'bob@example.com'),
-- ('Carol Lee', 'Clerk', 'carol@example.com');

-- -- Insert sample water sources
-- INSERT INTO water_sources (Name, Type, Capacity) VALUES
-- ('Main Reservoir', 'Reservoir', 1000000.00),
-- ('City Well #1', 'Well', 500000.00),
-- ('River Station A', 'River', 750000.00);

-- -- Insert sample connections
-- INSERT INTO connections (UserID, SourceID, MeterNumber, ConnectionDate, Status) VALUES
-- (1, 1, 'MTR001', '2023-01-01', 'Active'),
-- (2, 2, 'MTR002', '2023-02-15', 'Inactive'),
-- (3, 1, 'MTR003', '2023-03-01', 'Active');

-- -- Insert sample meter readings
-- INSERT INTO meter_readings (ConnectionID, ReadingDate, UnitsConsumed) VALUES
-- (1, '2023-03-01', 120.00),
-- (2, '2023-03-02', 80.00),
-- (3, '2023-03-03', 150.00);

-- -- Insert sample bills
-- INSERT INTO bills (MeterReadingID, BillDate, Amount, PaymentStatus) VALUES
-- (1, '2023-04-01', 250.00, 'Paid'),
-- (2, '2023-04-02', 180.00, 'Unpaid'),
-- (3, '2023-04-03', 375.00, 'Unpaid');

-- -- Insert sample alerts
-- INSERT INTO alerts (Type, Message, Status, UserID) VALUES
-- ('High Consumption', 'Customer 1 exceeded monthly limit', 'Active', 1),
-- ('Payment Overdue', 'Bill 2 is overdue by 15 days', 'Resolved', 2),
-- ('Water Quality', 'pH levels below normal range', 'Active', NULL);

-- -- Insert sample complaints
-- INSERT INTO complaints (UserID, Type, Description, Status, Date) VALUES
-- (1, 'Service', 'No water supply for 2 days', 'Open', '2023-06-01'),
-- (2, 'Billing', 'Incorrect bill amount for last month', 'Resolved', '2023-06-02'),
-- (3, 'Quality', 'Water is muddy and smells bad', 'In Progress', '2023-06-03');

-- -- Insert sample audit logs
-- INSERT INTO audit_logs (User, Action, Details) VALUES
-- ('admin', 'Login', 'Successful login'),
-- ('employee1', 'Edit Bill', 'Edited BillID 5'),
-- ('admin', 'Delete Customer', 'Deleted CustomerID 2');  