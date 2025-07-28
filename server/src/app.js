import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Security middleware ---------- */
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"] }
  }
}));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW,10),
  max: parseInt(process.env.RATE_LIMIT_MAX,10),
  message: 'Too many requests, slow down!'
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssClean());
app.use(morgan('dev'));

/* ---------- Routes ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);

/* ---------- Error handling ---------- */
app.use(notFound);
app.use(errorHandler);

/* ---------- Start ---------- */
(async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`🚀  PixelForge Nexus API running on port ${PORT}`)
  );
})();
