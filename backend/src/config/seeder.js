import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { connectDB } from './db.js';

dotenv.config();

export const seedInitialRoles = async () => {
  const initialRoles = [
    {
      name: 'devRH',
      label: 'devRH',
      color: '#00E5FF',
      description: 'Desarrollador de Recursos Humanos'
    },
    {
      name: 'devCONTA',
      label: 'devCONTA',
      color: '#00FFCC',
      description: 'Desarrollador de Contabilidad'
    },
    {
      name: 'TECHLEAD',
      label: 'TECHLEAD',
      color: '#B388FF',
      description: 'Líder Técnico de Desarrollo'
    },
    {
      name: 'PMO',
      label: 'PMO',
      color: '#FFEA00',
      description: 'Oficina de Gestión de Proyectos'
    }
  ];

  for (const r of initialRoles) {
    const existing = await Role.findOne({ name: r.name });
    if (!existing) {
      await Role.create(r);
      console.log(`Seeded role: ${r.name}`);
    }
  }
};

export const seedInitialAdmins = async () => {
  const initialAdmins = [
    {
      name: 'Jacobo Monroy',
      email: 'jacobo.monroy@tableu.io',
      role: 'admin',
      jobRole: 'TECHLEAD',
      avatarColor: '#00E5FF'
    },
    {
      name: 'Christopher Figueroa',
      email: 'christopher.figueroa@tableu.io',
      role: 'admin',
      jobRole: 'TECHLEAD',
      avatarColor: '#00FFCC'
    },
    {
      name: 'Lizbeth Loza',
      email: 'lizbeth.loza@tableu.io',
      role: 'admin',
      jobRole: 'PMO',
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
    await seedInitialRoles();
    await seedInitialAdmins();
    await mongoose.connection.close();
    console.log('Seeder completed successfully.');
    process.exit(0);
  }
};

runSeederDirectly();
