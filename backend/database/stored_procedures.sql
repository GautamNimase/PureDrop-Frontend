-- MySQL Stored Procedures for Water Management System
-- This file contains all the stored procedures

-- 1. sp_CreateUser - Create a new user
CREATE PROCEDURE sp_CreateUser(
    IN p_Name VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Phone VARCHAR(20),
    IN p_Address TEXT,
    IN p_ConnectionType ENUM('Residential', 'Commercial', 'Industrial')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE Email = p_Email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already exists';
    END IF;
    
    -- Insert new user
    INSERT INTO users (Name, Email, Phone, Address, ConnectionType)
    VALUES (p_Name, p_Email, p_Phone, p_Address, p_ConnectionType);
    
    -- Get the inserted user ID
    SET @new_user_id = LAST_INSERT_ID();
    
    -- Return the created user
    SELECT * FROM users WHERE UserID = @new_user_id;
    
    COMMIT;
END;

-- 2. sp_UpdateUser - Update an existing user
CREATE PROCEDURE sp_UpdateUser(
    IN p_UserID INT,
    IN p_Name VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Phone VARCHAR(20),
    IN p_Address TEXT,
    IN p_ConnectionType ENUM('Residential', 'Commercial', 'Industrial')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE UserID = p_UserID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- Check if email already exists (excluding current user)
    IF EXISTS (SELECT 1 FROM users WHERE Email = p_Email AND UserID != p_UserID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already exists';
    END IF;
    
    -- Update user
    UPDATE users 
    SET Name = p_Name, Email = p_Email, Phone = p_Phone, Address = p_Address, ConnectionType = p_ConnectionType
    WHERE UserID = p_UserID;
    
    -- Return the updated user
    SELECT * FROM users WHERE UserID = p_UserID;
    
    COMMIT;
END;

-- 3. sp_GenerateBill - Generate bill from meter reading
CREATE PROCEDURE sp_GenerateBill(
    IN p_MeterReadingID INT,
    IN p_RatePerUnit DECIMAL(10,2)
)
BEGIN
    DECLARE v_units_consumed DECIMAL(10,2);
    DECLARE v_bill_amount DECIMAL(10,2);
    DECLARE v_connection_id INT;
    DECLARE v_user_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get meter reading details
    SELECT UnitsConsumed, ConnectionID INTO v_units_consumed, v_connection_id
    FROM meter_readings WHERE MeterReadingID = p_MeterReadingID;
    
    IF v_units_consumed IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Meter reading not found';
    END IF;
    
    -- Calculate bill amount
    SET v_bill_amount = v_units_consumed * p_RatePerUnit;
    
    -- Get user ID for alerts
    SELECT UserID INTO v_user_id
    FROM connections WHERE ConnectionID = v_connection_id;
    
    -- Insert bill
    INSERT INTO bills (MeterReadingID, BillDate, Amount, PaymentStatus)
    VALUES (p_MeterReadingID, CURDATE(), v_bill_amount, 'Unpaid');
    
    -- Create high consumption alert if needed
    IF v_units_consumed > 100 THEN
        INSERT INTO alerts (Type, Message, Status, UserID)
        VALUES ('High Consumption', CONCAT('High consumption detected: ', v_units_consumed, ' units'), 'Active', v_user_id);
    END IF;
    
    -- Return the generated bill
    SELECT * FROM bills WHERE MeterReadingID = p_MeterReadingID ORDER BY BillID DESC LIMIT 1;
    
    COMMIT;
END;

-- 4. sp_ProcessPayment - Process bill payment
CREATE PROCEDURE sp_ProcessPayment(
    IN p_BillID INT,
    IN p_PaymentAmount DECIMAL(10,2),
    IN p_PaymentMethod VARCHAR(50)
)
BEGIN
    DECLARE v_bill_amount DECIMAL(10,2);
    DECLARE v_payment_status VARCHAR(20);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get bill details
    SELECT Amount, PaymentStatus INTO v_bill_amount, v_payment_status
    FROM bills WHERE BillID = p_BillID;
    
    IF v_bill_amount IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bill not found';
    END IF;
    
    IF v_payment_status = 'Paid' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bill is already paid';
    END IF;
    
    IF p_PaymentAmount < v_bill_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment amount is less than bill amount';
    END IF;
    
    -- Update bill payment
    UPDATE bills 
    SET PaymentStatus = 'Paid', PaymentDate = NOW(), PaymentMethod = p_PaymentMethod
    WHERE BillID = p_BillID;
    
    -- Resolve overdue alerts for this user
    UPDATE alerts a
    JOIN connections c ON a.UserID = c.UserID
    JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
    JOIN bills b ON mr.MeterReadingID = b.MeterReadingID
    SET a.Status = 'Resolved'
    WHERE b.BillID = p_BillID AND a.Type = 'Payment Overdue' AND a.Status = 'Active';
    
    -- Return the updated bill
    SELECT * FROM bills WHERE BillID = p_BillID;
    
    COMMIT;
END;

-- 5. sp_RecordMeterReading - Record meter reading with alerts
CREATE PROCEDURE sp_RecordMeterReading(
    IN p_ConnectionID INT,
    IN p_ReadingDate DATE,
    IN p_UnitsConsumed DECIMAL(10,2)
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_reading_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if connection exists
    IF NOT EXISTS (SELECT 1 FROM connections WHERE ConnectionID = p_ConnectionID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Connection not found';
    END IF;
    
    -- Get user ID
    SELECT UserID INTO v_user_id FROM connections WHERE ConnectionID = p_ConnectionID;
    
    -- Insert meter reading
    INSERT INTO meter_readings (ConnectionID, ReadingDate, UnitsConsumed)
    VALUES (p_ConnectionID, p_ReadingDate, p_UnitsConsumed);
    
    SET v_reading_id = LAST_INSERT_ID();
    
    -- Create high consumption alert if needed
    IF p_UnitsConsumed > 100 THEN
        INSERT INTO alerts (Type, Message, Status, UserID)
        VALUES ('High Consumption', CONCAT('High consumption detected: ', p_UnitsConsumed, ' units'), 'Active', v_user_id);
    END IF;
    
    -- Generate bill automatically
    CALL sp_GenerateBill(v_reading_id, 2.50);
    
    -- Return the meter reading
    SELECT * FROM meter_readings WHERE MeterReadingID = v_reading_id;
    
    COMMIT;
END;

-- 6. sp_CreateConnection - Create water connection
CREATE PROCEDURE sp_CreateConnection(
    IN p_UserID INT,
    IN p_SourceID INT,
    IN p_MeterNumber VARCHAR(50),
    IN p_ConnectionDate DATE
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE UserID = p_UserID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- Check if meter number already exists
    IF EXISTS (SELECT 1 FROM connections WHERE MeterNumber = p_MeterNumber) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Meter number already exists';
    END IF;
    
    -- Insert connection
    INSERT INTO connections (UserID, SourceID, MeterNumber, ConnectionDate)
    VALUES (p_UserID, p_SourceID, p_MeterNumber, p_ConnectionDate);
    
    -- Return the created connection
    SELECT * FROM connections WHERE MeterNumber = p_MeterNumber;
    
    COMMIT;
END;

-- 7. sp_CreateAlert - Create alert
CREATE PROCEDURE sp_CreateAlert(
    IN p_Type VARCHAR(50),
    IN p_Message TEXT,
    IN p_UserID INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Validate user if provided
    IF p_UserID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE UserID = p_UserID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- Insert alert
    INSERT INTO alerts (Type, Message, Status, UserID)
    VALUES (p_Type, p_Message, 'Active', p_UserID);
    
    -- Return the created alert
    SELECT * FROM alerts WHERE AlertID = LAST_INSERT_ID();
    
    COMMIT;
END;

-- 8. sp_GetUserSummary - Get comprehensive user summary
CREATE PROCEDURE sp_GetUserSummary(IN p_UserID INT)
BEGIN
    DECLARE v_user_exists INT;
    
    -- Check if user exists
    SELECT COUNT(*) INTO v_user_exists FROM users WHERE UserID = p_UserID;
    
    IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- Return user summary
    SELECT 
        u.UserID,
        u.Name,
        u.Email,
        u.ConnectionType,
        COUNT(DISTINCT c.ConnectionID) AS TotalConnections,
        SUM(CASE WHEN c.Status = 'Active' THEN 1 ELSE 0 END) AS ActiveConnections,
        COUNT(DISTINCT b.BillID) AS TotalBills,
        SUM(CASE WHEN b.PaymentStatus = 'Unpaid' THEN 1 ELSE 0 END) AS UnpaidBills,
        SUM(CASE WHEN b.PaymentStatus = 'Overdue' THEN 1 ELSE 0 END) AS OverdueBills,
        SUM(CASE WHEN b.PaymentStatus IN ('Unpaid', 'Overdue') THEN b.Amount ELSE 0 END) AS OutstandingAmount,
        COUNT(DISTINCT mr.MeterReadingID) AS TotalReadings,
        AVG(mr.UnitsConsumed) AS AverageConsumption,
        SUM(mr.UnitsConsumed) AS TotalConsumption,
        COUNT(DISTINCT a.AlertID) AS TotalAlerts,
        SUM(CASE WHEN a.Status = 'Active' THEN 1 ELSE 0 END) AS ActiveAlerts,
        COUNT(DISTINCT comp.ComplaintID) AS TotalComplaints,
        SUM(CASE WHEN comp.Status IN ('Open', 'In Progress') THEN 1 ELSE 0 END) AS ActiveComplaints
    FROM users u
    LEFT JOIN connections c ON u.UserID = c.UserID
    LEFT JOIN meter_readings mr ON c.ConnectionID = mr.ConnectionID
    LEFT JOIN bills b ON mr.MeterReadingID = b.MeterReadingID
    LEFT JOIN alerts a ON u.UserID = a.UserID
    LEFT JOIN complaints comp ON u.UserID = comp.UserID
    WHERE u.UserID = p_UserID
    GROUP BY u.UserID, u.Name, u.Email, u.ConnectionType;
END;

-- 9. sp_GetSystemSummary - Get system-wide summary
CREATE PROCEDURE sp_GetSystemSummary()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users) AS TotalUsers,
        (SELECT COUNT(*) FROM employees) AS TotalEmployees,
        (SELECT COUNT(*) FROM connections WHERE Status = 'Active') AS ActiveConnections,
        (SELECT COUNT(*) FROM bills WHERE PaymentStatus = 'Unpaid') AS PendingBills,
        (SELECT COUNT(*) FROM bills WHERE PaymentStatus = 'Overdue') AS OverdueBills,
        (SELECT COUNT(*) FROM meter_readings) AS TotalReadings,
        (SELECT COUNT(*) FROM water_sources) AS TotalSources,
        (SELECT COUNT(*) FROM alerts WHERE Status = 'Active') AS ActiveAlerts,
        (SELECT COUNT(*) FROM complaints WHERE Status IN ('Open', 'In Progress')) AS ActiveComplaints,
        (SELECT SUM(Amount) FROM bills WHERE PaymentStatus IN ('Unpaid', 'Overdue')) AS TotalOutstanding,
        (SELECT AVG(UnitsConsumed) FROM meter_readings) AS AverageConsumption;
END; 