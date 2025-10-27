import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db/database';
import apiRoutes from './routes/api.routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes (must come before static files)
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Katakana SRS API is running' });
});

// Serve static frontend files (Angular build)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Catch-all route for Angular routing (must be last)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Initialize database and start server
const startServer = () => {
  try {
    initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Application: http://localhost:${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
