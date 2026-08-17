import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { connectDB } from './db.js';

dotenv.config();

export const seedInitialAdmins = async () => {
  const initialAdmins = [
    {
      name: 'Jacobo Monroy',
      email: 'jacobo.monroy@tableu.io',
      role: 'admin',
      avatarColor: '#00E5FF'
    },
    {
      name: 'Christopher Figueroa',
      email: 'christopher.figueroa@tableu.io',
      role: 'admin',
      avatarColor: '#00FFCC'
    },
    {
      name: 'Lizbeth Loza',
      email: 'lizbeth.loza@tableu.io',
      role: 'admin',
      avatarColor: '#FF007F'
    }
  ];

  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

  for (const admin of initialAdmins) {
    const existing = await User.findOne({ email: admin.email });
    if (!existing) {
      await User.create({
        ...admin,
        password: defaultPassword
      });
      console.log(`Seeded admin account: ${admin.email}`);
    }
  }
};

const runSeederDirectly = async () => {
  if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
    await connectDB();
    await seedInitialAdmins();
    await mongoose.connection.close();
    console.log('Seeder completed successfully.');
    process.exit(0);
  }
};

runSeederDirectly();
