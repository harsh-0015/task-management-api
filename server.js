// server.js
require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Start server function
const startServer = async () => {
    try {
        // Test database connection first
        await testConnection();
        
        // Start the server
        const server = app.listen(PORT, () => {
            console.log('🚀 Task Management API Server Started');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📖 API Documentation: http://localhost:${PORT}/`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log('-----------------------------------');
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            console.log(`\n📪 Received ${signal}. Starting graceful shutdown...`);
            
            server.close((err) => {
                if (err) {
                    console.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }
                
                console.log('✅ Server closed successfully');
                console.log('👋 Goodbye!');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                console.log('⏰ Force closing server...');
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('❌ Uncaught Exception:', err);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();