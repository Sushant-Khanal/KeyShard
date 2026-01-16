import express from 'express';
import dotenv from 'dotenv';
import redis from './middleware/redis-client.js';
import goDb from './middleware/dbConnection.js'; // Axios instance for Go DB
import userSignupRoute from './routes/userSignUp.js';
import userLoginRoute from './routes/userLogin.js';
import passwordFetchRoute from './routes/password.js';
import testRoute from './routes/test.js';
import challengeCreateRoute from './middleware/challenge.js';

dotenv.config();

const app = express();
app.set('trust proxy', true);

const startServer = async () => {
  try {
    // Connect to Redis
    await redis.connect();
    console.log('Redis connected');

    // Middleware
    app.use(express.json());

    // Routes
    app.use('/api', userSignupRoute);
    app.use('/api', userLoginRoute);
    app.use('/api', passwordFetchRoute);
    app.use('/api', testRoute);
    app.use('/api', challengeCreateRoute);

    // Root route
    app.get('/', async (req, res) => {
      try {
        const response = await goDb.get('/'); // test Go DB connection
        res.send(`Node backend connected to Go DB: ${response.data}`);
      } catch (err) {
        console.error('Error connecting to Go DB:', err.message);
        res.status(500).send('Cannot reach Go backend');
      }
    });

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Node backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start
startServer();
