import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './modules/auth/routes/auth.routes';
import studentRoutes from './modules/students/routes/student.routes';
import lecturerRoutes from './modules/lecturers/routes/lecturer.routes';
import courseRoutes from './modules/courses/routes/course.routes';
import enrollmentRoutes from './modules/enrollments/routes/enrollment.routes';
import attendanceRoutes from './modules/attendance/routes/attendance.routes';
import recognitionRoutes from './modules/recognition/routes/recognition.routes';
import reportsRoutes from './modules/reports/routes/reports.routes';
import dashboardRoutes from './modules/dashboard/route/dashboard.routes';

import { errorHandler, notFound } from './shared/middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10mb for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/students`, studentRoutes);
app.use(`${API}/lecturers`, lecturerRoutes);
app.use(`${API}/courses`, courseRoutes);
app.use(`${API}/enrollments`, enrollmentRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/recognition`, recognitionRoutes);
app.use(`${API}/reports`, reportsRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
