import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedInitialAdmins } from './config/seeder.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import epicRoutes from './routes/epicRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/epics', epicRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TABLEU API', timestamp: new Date() });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedInitialAdmins();
  app.listen(PORT, () => {
    console.log(`TABLEU Server running on port ${PORT}`);
  });
};

startServer();

export default app;
