import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sprint from './src/models/Sprint.js';
import Epic from './src/models/Epic.js';
import Story from './src/models/Story.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const cleanDatabase = async () => {
  await connectDB();

  await Sprint.deleteMany({});
  await Epic.deleteMany({});
  await Story.deleteMany({});

  console.log('Successfully cleaned up all test sprints, epics, and stories.');
  await mongoose.connection.close();
  process.exit(0);
};

cleanDatabase();
