import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

export default app;
