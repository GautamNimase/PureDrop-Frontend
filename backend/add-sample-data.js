const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

// Import models
const User = require('./models/User');
const Employee = require('./models/Employee');
const WaterSource = require('./models/WaterSource');
const Connection = require('./models/Connection');
const MeterReading = require('./models/MeterReading');
const Bill = require('./models/Bill');
const Alert = require('./models/Alert');
const Complaint = require('./models/Complaint');

const addSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await WaterSource.deleteMany({});
    await Connection.deleteMany({});
    await MeterReading.deleteMany({});
    await Bill.deleteMany({});
    await Alert.deleteMany({});
    await Complaint.deleteMany({});

    // Add sample users
    const user1 = await User.create({
      Name: 'John Doe',
      Email: 'john@example.com',
      Phone: '1234567890',
      Address: '123 Main St',
      ConnectionType: 'Residential'
    });

    const user2 = await User.create({
      Name: 'Jane Smith',
      Email: 'jane@example.com',
      Phone: '0987654321',
      Address: '456 Oak Ave',
      ConnectionType: 'Commercial'
    });

    const user3 = await User.create({
      Name: 'Bob Wilson',
      Email: 'bob@example.com',
      Phone: '5551234567',
      Address: '789 Pine Rd',
      ConnectionType: 'Industrial'
    });

    // Add sample employees
    const employee1 = await Employee.create({
      Name: 'Alice Johnson',
      Role: 'Manager',
      Contact: 'alice@example.com'
    });

    const employee2 = await Employee.create({
      Name: 'Bob Smith',
      Role: 'Technician',
      Contact: 'bob@example.com'
    });

    const employee3 = await Employee.create({
      Name: 'Carol Lee',
      Role: 'Clerk',
      Contact: 'carol@example.com'
    });

    // Add sample water sources
    const source1 = await WaterSource.create({
      Name: 'Main Reservoir',
      Type: 'Reservoir',
      Capacity: 1000000.00
    });

    const source2 = await WaterSource.create({
      Name: 'City Well #1',
      Type: 'Well',
      Capacity: 500000.00
    });

    const source3 = await WaterSource.create({
      Name: 'River Station A',
      Type: 'River',
      Capacity: 750000.00
    });

    // Add sample connections
    const connection1 = await Connection.create({
      UserID: user1._id,
      SourceID: source1._id,
      MeterNumber: 'MTR001',
      ConnectionDate: new Date('2023-01-01'),
      Status: 'Active'
    });

    const connection2 = await Connection.create({
      UserID: user2._id,
      SourceID: source2._id,
      MeterNumber: 'MTR002',
      ConnectionDate: new Date('2023-02-15'),
      Status: 'Active'
    });

    const connection3 = await Connection.create({
      UserID: user3._id,
      SourceID: source1._id,
      MeterNumber: 'MTR003',
      ConnectionDate: new Date('2023-03-01'),
      Status: 'Active'
    });

    // Add sample meter readings
    const reading1 = await MeterReading.create({
      ConnectionID: connection1._id,
      ReadingDate: new Date('2023-03-01'),
      UnitsConsumed: 120.00
    });

    const reading2 = await MeterReading.create({
      ConnectionID: connection2._id,
      ReadingDate: new Date('2023-03-02'),
      UnitsConsumed: 80.00
    });

    const reading3 = await MeterReading.create({
      ConnectionID: connection3._id,
      ReadingDate: new Date('2023-03-03'),
      UnitsConsumed: 150.00
    });

    // Add sample alerts
    await Alert.create({
      Type: 'High Consumption',
      Message: 'Customer 1 exceeded monthly limit',
      Status: 'Active',
      UserID: user1._id
    });

    await Alert.create({
      Type: 'Payment Overdue',
      Message: 'Bill 2 is overdue by 15 days',
      Status: 'Resolved',
      UserID: user2._id
    });

    await Alert.create({
      Type: 'Water Quality',
      Message: 'pH levels below normal range',
      Status: 'Active'
    });

    // Add sample complaints
    await Complaint.create({
      UserID: user1._id,
      Type: 'Service',
      Description: 'No water supply for 2 days',
      Status: 'Open',
      Date: new Date('2023-06-01')
    });

    await Complaint.create({
      UserID: user2._id,
      Type: 'Billing',
      Description: 'Incorrect bill amount for last month',
      Status: 'Resolved',
      Date: new Date('2023-06-02')
    });

    await Complaint.create({
      UserID: user3._id,
      Type: 'Quality',
      Description: 'Water is muddy and smells bad',
      Status: 'In Progress',
      Date: new Date('2023-06-03')
    });

    console.log('Sample data added successfully!');
    console.log('Users:', await User.countDocuments());
    console.log('Employees:', await Employee.countDocuments());
    console.log('Water Sources:', await WaterSource.countDocuments());
    console.log('Connections:', await Connection.countDocuments());
    console.log('Meter Readings:', await MeterReading.countDocuments());
    console.log('Bills:', await Bill.countDocuments());
    console.log('Alerts:', await Alert.countDocuments());
    console.log('Complaints:', await Complaint.countDocuments());

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addSampleData(); 