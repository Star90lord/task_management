import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
const connectMongo = async () => {
  try {
    // Override local DNS just for Node to bypass ISP blocks on SRV records
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ MongoDB Connected Successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    console.log('⚠ MongoDB connection failed, but server will continue. Some features may not work.');
    return null;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ Mongoose connection error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('✓ Mongoose connection closed due to process termination');
  process.exit(0);
});

export default connectMongo;