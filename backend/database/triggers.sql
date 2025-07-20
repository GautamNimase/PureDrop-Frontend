-- MySQL Triggers for Water Management System
-- This file contains all the database triggers

-- User Triggers

-- Trigger: after_user_insert
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (NEW.Name, 'Create User', NOW(), CONCAT('Created UserID ', NEW.UserID));
END;

-- Trigger: after_user_update
CREATE TRIGGER after_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (NEW.Name, 'Update User', NOW(), CONCAT('Updated UserID ', NEW.UserID));
END;

-- Trigger: after_user_delete
CREATE TRIGGER after_user_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (OLD.Name, 'Delete User', NOW(), CONCAT('Deleted UserID ', OLD.UserID));
END;

-- Meter Reading Triggers

-- Trigger: after_meter_reading_insert
CREATE TRIGGER after_meter_reading_insert
AFTER INSERT ON meter_readings
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    DECLARE user_id INT;
    
    -- Get user information
    SELECT u.Name, u.UserID INTO user_name, user_id
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    WHERE c.ConnectionID = NEW.ConnectionID;
    
    -- Create high consumption alert if consumption > 100
    IF NEW.UnitsConsumed > 100 THEN
        INSERT INTO alerts (Type, Message, Status, Timestamp, UserID)
        VALUES (
            'High Consumption',
            CONCAT('High consumption detected: ', NEW.UnitsConsumed, ' units for ConnectionID ', NEW.ConnectionID),
            'Active',
            NOW(),
            user_id
        );
    END IF;
    
    -- Automatic bill generation
    INSERT INTO bills (MeterReadingID, BillDate, Amount, PaymentStatus)
    VALUES (NEW.MeterReadingID, CURDATE(), NEW.UnitsConsumed * 2.50, 'Unpaid');
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Create Reading', NOW(), CONCAT('Created MeterReadingID ', NEW.MeterReadingID));
END;

-- Trigger: after_meter_reading_update
CREATE TRIGGER after_meter_reading_update
AFTER UPDATE ON meter_readings
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT u.Name INTO user_name
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    WHERE c.ConnectionID = NEW.ConnectionID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Update Reading', NOW(), CONCAT('Updated MeterReadingID ', NEW.MeterReadingID));
END;

-- Trigger: after_meter_reading_delete
CREATE TRIGGER after_meter_reading_delete
AFTER DELETE ON meter_readings
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT u.Name INTO user_name
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    WHERE c.ConnectionID = OLD.ConnectionID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Delete Reading', NOW(), CONCAT('Deleted MeterReadingID ', OLD.MeterReadingID));
END;

-- Bill Triggers

-- Trigger: after_bill_insert
CREATE TRIGGER after_bill_insert
AFTER INSERT ON bills
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT u.Name INTO user_name
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
    WHERE mr.MeterReadingID = NEW.MeterReadingID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Create Bill', NOW(), CONCAT('Created BillID ', NEW.BillID));
END;

-- Trigger: after_bill_update
CREATE TRIGGER after_bill_update
AFTER UPDATE ON bills
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    DECLARE user_id INT;
    
    -- Get user information
    SELECT u.Name, u.UserID INTO user_name, user_id
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
    WHERE mr.MeterReadingID = NEW.MeterReadingID;
    
    -- Check for overdue bills
    IF NEW.PaymentStatus = 'Unpaid' AND NEW.BillDate < CURDATE() THEN
        INSERT INTO alerts (Type, Message, Status, Timestamp, UserID)
        VALUES (
            'Payment Overdue',
            CONCAT('Bill ', NEW.BillID, ' is overdue.'),
            'Active',
            NOW(),
            user_id
        );
    END IF;
    
    -- Resolve alerts when bill is paid
    IF NEW.PaymentStatus = 'Paid' THEN
        UPDATE alerts
        SET Status = 'Resolved'
        WHERE Type = 'Payment Overdue'
          AND UserID = user_id
          AND Status = 'Active';
    END IF;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Update Bill', NOW(), CONCAT('Updated BillID ', NEW.BillID));
END;

-- Trigger: after_bill_delete
CREATE TRIGGER after_bill_delete
AFTER DELETE ON bills
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT u.Name INTO user_name
    FROM users u
    JOIN connections c ON u.UserID = c.UserID
    JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
    WHERE mr.MeterReadingID = OLD.MeterReadingID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Delete Bill', NOW(), CONCAT('Deleted BillID ', OLD.BillID));
END;

-- Connection Triggers

-- Trigger: after_connection_insert
CREATE TRIGGER after_connection_insert
AFTER INSERT ON connections
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = NEW.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Create Connection', NOW(), CONCAT('Created ConnectionID ', NEW.ConnectionID));
END;

-- Trigger: after_connection_update
CREATE TRIGGER after_connection_update
AFTER UPDATE ON connections
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = NEW.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Update Connection', NOW(), CONCAT('Updated ConnectionID ', NEW.ConnectionID));
END;

-- Trigger: after_connection_delete
CREATE TRIGGER after_connection_delete
AFTER DELETE ON connections
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = OLD.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Delete Connection', NOW(), CONCAT('Deleted ConnectionID ', OLD.ConnectionID));
END;

-- Complaint Triggers

-- Trigger: after_complaint_insert
CREATE TRIGGER after_complaint_insert
AFTER INSERT ON complaints
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = NEW.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Create Complaint', NOW(), CONCAT('Created ComplaintID ', NEW.ComplaintID));
END;

-- Trigger: after_complaint_update
CREATE TRIGGER after_complaint_update
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = NEW.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Update Complaint', NOW(), CONCAT('Updated ComplaintID ', NEW.ComplaintID));
END;

-- Trigger: after_complaint_delete
CREATE TRIGGER after_complaint_delete
AFTER DELETE ON complaints
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(100);
    
    -- Get user information
    SELECT Name INTO user_name FROM users WHERE UserID = OLD.UserID;
    
    -- Audit log
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (user_name, 'Delete Complaint', NOW(), CONCAT('Deleted ComplaintID ', OLD.ComplaintID));
END;

-- Employee Triggers

-- Trigger: after_employee_insert
CREATE TRIGGER after_employee_insert
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (NEW.Name, 'Create Employee', NOW(), CONCAT('Created EmployeeID ', NEW.EmployeeID));
END;

-- Trigger: after_employee_update
CREATE TRIGGER after_employee_update
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (NEW.Name, 'Update Employee', NOW(), CONCAT('Updated EmployeeID ', NEW.EmployeeID));
END;

-- Trigger: after_employee_delete
CREATE TRIGGER after_employee_delete
AFTER DELETE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (User, Action, Timestamp, Details)
    VALUES (OLD.Name, 'Delete Employee', NOW(), CONCAT('Deleted EmployeeID ', OLD.EmployeeID));
END;

-- Advanced Business Logic Triggers

-- Trigger: escalate_old_complaints (Event-based trigger)
-- This will be handled by a scheduled event or application logic

-- Trigger: suspend_user_on_unpaid_bills (Event-based trigger)
-- This will be handled by a scheduled event or application logic 