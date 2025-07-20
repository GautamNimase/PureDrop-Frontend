-- MySQL Views for Water Management System
-- This file contains all the database views

-- Drop existing views if they exist
DROP VIEW IF EXISTS user_overview;
DROP VIEW IF EXISTS outstanding_bills;
DROP VIEW IF EXISTS high_consumption_alerts;
DROP VIEW IF EXISTS user_complaints;
DROP VIEW IF EXISTS connection_meter_readings;
DROP VIEW IF EXISTS bill_payment_history;
DROP VIEW IF EXISTS system_alerts_summary;

-- 1. User Overview View
DROP VIEW IF EXISTS user_overview;
CREATE VIEW user_overview AS
SELECT
    u.UserID,
    u.Name,
    u.Email,
    u.Phone,
    u.Address,
    u.ConnectionType,
    c.ConnectionID,
    c.Status AS ConnectionStatus,
    c.MeterNumber,
    b.BillID AS LatestBillID,
    b.BillDate AS LatestBillDate,
    b.Amount AS LatestBillAmount,
    b.PaymentStatus AS LatestBillStatus,
    COUNT(DISTINCT c.ConnectionID) AS TotalConnections,
    SUM(CASE WHEN c.Status = 'Active' THEN 1 ELSE 0 END) AS ActiveConnections,
    COUNT(DISTINCT b.BillID) AS TotalBills,
    SUM(CASE WHEN b.PaymentStatus = 'Unpaid' THEN 1 ELSE 0 END) AS UnpaidBills
FROM users u
LEFT JOIN connections c ON u.UserID = c.UserID
LEFT JOIN (
    SELECT 
        mr.ConnectionID,
        b.BillID,
        b.BillDate,
        b.Amount,
        b.PaymentStatus,
        ROW_NUMBER() OVER (PARTITION BY mr.ConnectionID ORDER BY b.BillDate DESC) as rn
    FROM meter_readings mr
    JOIN bills b ON mr.MeterReadingID = b.MeterReadingID
) b ON c.ConnectionID = b.ConnectionID AND b.rn = 1
GROUP BY u.UserID, u.Name, u.Email, u.Phone, u.Address, u.ConnectionType, c.ConnectionID, c.Status, c.MeterNumber, b.BillID, b.BillDate, b.Amount, b.PaymentStatus;

-- 2. Outstanding Bills View
DROP VIEW IF EXISTS outstanding_bills;
CREATE VIEW outstanding_bills AS
SELECT
    b.BillID,
    b.BillDate,
    b.Amount,
    b.PaymentStatus,
    u.UserID,
    u.Name,
    u.Email,
    c.ConnectionID,
    c.MeterNumber,
    mr.UnitsConsumed,
    mr.ReadingDate
FROM bills b
JOIN meter_readings mr ON b.MeterReadingID = mr.MeterReadingID
JOIN connections c ON mr.ConnectionID = c.ConnectionID
JOIN users u ON c.UserID = u.UserID
WHERE b.PaymentStatus = 'Unpaid';

-- 3. High Consumption Alerts View
DROP VIEW IF EXISTS high_consumption_alerts;
CREATE VIEW high_consumption_alerts AS
SELECT
    a.AlertID,
    a.Type,
    a.Message,
    a.Status,
    a.Timestamp,
    u.UserID,
    u.Name,
    c.ConnectionID,
    c.MeterNumber,
    COUNT(DISTINCT c.ConnectionID) AS TotalConnections,
    SUM(CASE WHEN c.Status = 'Active' THEN 1 ELSE 0 END) AS ActiveConnections
FROM alerts a
JOIN users u ON a.UserID = u.UserID
LEFT JOIN connections c ON c.UserID = u.UserID
WHERE a.Type = 'High Consumption'
GROUP BY a.AlertID, a.Type, a.Message, a.Status, a.Timestamp, u.UserID, u.Name, c.ConnectionID, c.MeterNumber;

-- 4. User Complaints View
DROP VIEW IF EXISTS user_complaints;
CREATE VIEW user_complaints AS
SELECT
    comp.ComplaintID,
    comp.Description AS Message,
    comp.Status,
    comp.Date AS Timestamp,
    u.UserID,
    u.Name,
    u.Email,
    u.Phone,
    u.Address,
    comp.Response,
    comp.Type
FROM complaints comp
JOIN users u ON comp.UserID = u.UserID;

-- 5. Connection Meter Readings View
DROP VIEW IF EXISTS connection_meter_readings;
CREATE VIEW connection_meter_readings AS
SELECT
    mr.MeterReadingID,
    mr.ReadingDate,
    mr.UnitsConsumed,
    c.ConnectionID,
    c.MeterNumber,
    u.UserID,
    u.Name,
    u.Email,
    c.Status AS ConnectionStatus,
    c.ConnectionDate,
    c.SourceID
FROM meter_readings mr
JOIN connections c ON mr.ConnectionID = c.ConnectionID
JOIN users u ON c.UserID = u.UserID;

-- 6. Bill Payment History View
DROP VIEW IF EXISTS bill_payment_history;
CREATE VIEW bill_payment_history AS
SELECT
    b.BillID,
    b.BillDate,
    b.Amount,
    b.PaymentStatus,
    b.PaymentDate,
    b.PaymentMethod,
    u.UserID,
    u.Name,
    u.Email,
    c.ConnectionID,
    c.MeterNumber,
    mr.UnitsConsumed,
    mr.ReadingDate
FROM bills b
JOIN meter_readings mr ON b.MeterReadingID = mr.MeterReadingID
JOIN connections c ON mr.ConnectionID = c.ConnectionID
JOIN users u ON c.UserID = u.UserID;

-- 7. System Alerts Summary View
DROP VIEW IF EXISTS system_alerts_summary;
CREATE VIEW system_alerts_summary AS
SELECT
    a.AlertID,
    a.Type,
    a.Message,
    a.Status,
    a.Severity,
    a.Timestamp,
    a.UserID,
    u.Name AS UserName,
    u.Email AS UserEmail
FROM alerts a
LEFT JOIN users u ON a.UserID = u.UserID;

-- Additional useful views

-- 8. User Billing Summary View
DROP VIEW IF EXISTS user_billing_summary;
CREATE VIEW user_billing_summary AS
SELECT
    u.UserID,
    u.Name,
    u.Email,
    COUNT(DISTINCT b.BillID) AS TotalBills,
    SUM(CASE WHEN b.PaymentStatus = 'Paid' THEN 1 ELSE 0 END) AS PaidBills,
    SUM(CASE WHEN b.PaymentStatus = 'Unpaid' THEN 1 ELSE 0 END) AS UnpaidBills,
    SUM(CASE WHEN b.PaymentStatus = 'Overdue' THEN 1 ELSE 0 END) AS OverdueBills,
    SUM(CASE WHEN b.PaymentStatus IN ('Unpaid', 'Overdue') THEN b.Amount ELSE 0 END) AS OutstandingAmount,
    SUM(b.Amount) AS TotalBilledAmount
FROM users u
LEFT JOIN connections c ON u.UserID = c.UserID
LEFT JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
LEFT JOIN bills b ON mr.MeterReadingID = b.MeterReadingID
GROUP BY u.UserID, u.Name, u.Email;

-- 9. Consumption Analysis View
DROP VIEW IF EXISTS consumption_analysis;
CREATE VIEW consumption_analysis AS
SELECT
    u.UserID,
    u.Name,
    c.ConnectionID,
    c.MeterNumber,
    COUNT(mr.MeterReadingID) AS TotalReadings,
    AVG(mr.UnitsConsumed) AS AverageConsumption,
    MAX(mr.UnitsConsumed) AS HighestConsumption,
    MIN(mr.UnitsConsumed) AS LowestConsumption,
    SUM(mr.UnitsConsumed) AS TotalConsumption,
    SUM(CASE WHEN mr.UnitsConsumed > 100 THEN 1 ELSE 0 END) AS HighConsumptionCount
FROM users u
JOIN connections c ON u.UserID = c.UserID
LEFT JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
GROUP BY u.UserID, u.Name, c.ConnectionID, c.MeterNumber;

-- 10. System Statistics View
DROP VIEW IF EXISTS system_statistics;
CREATE VIEW system_statistics AS
SELECT
    (SELECT COUNT(*) FROM users) AS TotalUsers,
    (SELECT COUNT(*) FROM employees) AS TotalEmployees,
    (SELECT COUNT(*) FROM connections WHERE Status = 'Active') AS ActiveConnections,
    (SELECT COUNT(*) FROM bills WHERE PaymentStatus = 'Unpaid') AS PendingBills,
    (SELECT COUNT(*) FROM meter_readings) AS TotalReadings,
    (SELECT COUNT(*) FROM water_sources) AS TotalSources,
    (SELECT COUNT(*) FROM alerts WHERE Status = 'Active') AS ActiveAlerts,
    (SELECT COUNT(*) FROM complaints WHERE Status IN ('Open', 'In Progress')) AS ActiveComplaints,
    (SELECT SUM(Amount) FROM bills WHERE PaymentStatus IN ('Unpaid', 'Overdue')) AS TotalOutstanding,
    (SELECT AVG(UnitsConsumed) FROM meter_readings) AS AverageConsumption; 