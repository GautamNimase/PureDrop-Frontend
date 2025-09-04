const mongoose = require('mongoose');

// Prefer unified env var name; gracefully fall back for compatibility
const getMongoUri = () => {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/watersystem'
  );
};

const connectDB = async (app) => {
  try {
    // Recommended settings and timeouts
    mongoose.set('strictQuery', true);

    const mongoUri = getMongoUri();

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 0,
      retryWrites: true
    });

    console.log('✅ MongoDB connected');

    // Connection event helpers for visibility
    const connection = mongoose.connection;
    connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    if (app) {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
