const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');

    // Disconnect and reconnect to ensure clean state
    await mongoose.disconnect();
    await mongoose.connect(mongoUri);
    console.log('Reconnected to MongoDB');

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

resetDatabase(); 