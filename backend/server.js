import app from './app.js';
import dotenv from 'dotenv';
import connectMongo from './config/mongo.js';
import { pool, initializeDatabase } from './config/postgres.js';
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n✓ ${signal} received. Starting graceful shutdown...`);

  try {
    // Close HTTP server
    if (server) {
      server.close(() => {
        console.log('✓ Express server closed');
      });
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');

    // Close PostgreSQL connection pool
    await pool.end();
    console.log('✓ PostgreSQL connection pool closed');

    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

/**
 * Start Server Function
 */
let server;
const startServer = async () => {
  try {
    console.log('\n Starting Task Management API...');
    console.log(` Environment: ${NODE_ENV}`);

    // Connect to MongoDB
    await connectMongo();

    // Initialize PostgreSQL
    await initializeDatabase();

    // Start Express Server
    server = app.listen(PORT, () => {
      console.log('\nServer running successfully');
      console.log(`Base URL: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log('API Docs: Available at /api/docs (if Swagger is configured)');
      console.log(
        '\nPress Ctrl+C to stop the server\n'
      );
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      throw error;
    });

    // Graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Optionally exit on unhandled rejection
      // process.exit(1);
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error(' Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error(' Server failed to start:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();