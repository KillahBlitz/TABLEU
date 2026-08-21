import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedInitialAdmins, seedInitialRoles } from './config/seeder.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import epicRoutes from './routes/epicRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/epics', epicRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sitemap', sitemapRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TABLEU API', timestamp: new Date() });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedInitialRoles();
  await seedInitialAdmins();
  app.listen(PORT, () => {
    console.log(`TABLEU Server running on port ${PORT}`);
  });
};

startServer();

export default app;
