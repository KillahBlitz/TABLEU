import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedInitialAdmins, seedInitialRoles } from './config/seeder.js';
import { setIO } from './socket.js';
import Sitemap from './models/Sitemap.js';
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
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 5e6
});

setIO(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
});

io.on('connection', (socket) => {
  socket.join('sitemap-room');

  const isAdmin = () => socket.user?.role === 'admin';

  socket.on('sitemap:cursor', (data) => {
    socket.to('sitemap-room').emit('sitemap:cursor', { ...data, socketId: socket.id });
  });

  socket.on('sitemap:node:upsert', async (node) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      const updated = await Sitemap.findOneAndUpdate(
        { key: 'main', 'nodes.id': node.id },
        { $set: { 'nodes.$': node } },
        { new: true }
      );
      if (!updated) {
        await Sitemap.findOneAndUpdate({ key: 'main' }, { $push: { nodes: node } }, { upsert: true });
      }
      socket.to('sitemap-room').emit('sitemap:node:upsert', node);
    } catch (err) { console.error('node:upsert', err.message); }
  });

  socket.on('sitemap:node:delete', async ({ id }) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      await Sitemap.findOneAndUpdate(
        { key: 'main' },
        { $pull: { nodes: { id }, edges: { $or: [{ fromNodeId: id }, { toNodeId: id }] } } },
        { upsert: true }
      );
      socket.to('sitemap-room').emit('sitemap:node:delete', { id });
    } catch (err) { console.error('node:delete', err.message); }
  });

  socket.on('sitemap:edge:upsert', async (edge) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      const updated = await Sitemap.findOneAndUpdate(
        { key: 'main', 'edges.id': edge.id },
        { $set: { 'edges.$': edge } },
        { new: true }
      );
      if (!updated) {
        await Sitemap.findOneAndUpdate({ key: 'main' }, { $push: { edges: edge } }, { upsert: true });
      }
      socket.to('sitemap-room').emit('sitemap:edge:upsert', edge);
    } catch (err) { console.error('edge:upsert', err.message); }
  });

  socket.on('sitemap:edge:delete', async ({ id }) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      await Sitemap.findOneAndUpdate({ key: 'main' }, { $pull: { edges: { id } } }, { upsert: true });
      socket.to('sitemap-room').emit('sitemap:edge:delete', { id });
    } catch (err) { console.error('edge:delete', err.message); }
  });

  socket.on('sitemap:library:upsert', async (item) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      const updated = await Sitemap.findOneAndUpdate(
        { key: 'main', 'library.id': item.id },
        { $set: { 'library.$': item } },
        { new: true }
      );
      if (!updated) {
        await Sitemap.findOneAndUpdate({ key: 'main' }, { $push: { library: item } }, { upsert: true });
      }
      socket.to('sitemap-room').emit('sitemap:library:upsert', item);
    } catch (err) { console.error('library:upsert', err.message); }
  });

  socket.on('sitemap:library:delete', async ({ id }) => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      await Sitemap.findOneAndUpdate({ key: 'main' }, { $pull: { library: { id } } }, { upsert: true });
      socket.to('sitemap-room').emit('sitemap:library:delete', { id });
    } catch (err) { console.error('library:delete', err.message); }
  });

  socket.on('sitemap:clear', async () => {
    if (!isAdmin()) {
      socket.emit('sitemap:error', { code: 'UNAUTHORIZED', message: 'Admin role required' });
      return;
    }
    try {
      await Sitemap.findOneAndUpdate(
        { key: 'main' },
        { $set: { nodes: [], edges: [] } },
        { upsert: true }
      );
      socket.to('sitemap-room').emit('sitemap:updated', { nodes: [], edges: [] });
    } catch (err) { console.error('sitemap:clear', err.message); }
  });

  socket.on('sitemap:viewport', async (viewport) => {
    try {
      await Sitemap.findOneAndUpdate({ key: 'main' }, { $set: { viewport } }, { upsert: true });
    } catch (_) {}
  });

  socket.on('disconnect', () => {
    io.to('sitemap-room').emit('sitemap:cursor:leave', { socketId: socket.id });
  });
});

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
  httpServer.listen(PORT, () => {
    console.log(`TABLEU Server running on port ${PORT}`);
  });
};

startServer();

export default app;
