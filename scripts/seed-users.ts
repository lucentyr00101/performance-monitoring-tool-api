#!/usr/bin/env bun
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:adminpassword@localhost:27017/?authSource=admin';
const DATABASE_NAME = 'auth_db';
const BCRYPT_ROUNDS = 12;

const users = [
  { email: 'hr@example.com', role: 'hr' },
  { email: 'manager@example.com', role: 'manager' },
  { email: 'csuite@example.com', role: 'csuite' },
  { email: 'employee@example.com', role: 'employee' },
];

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('users');

    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    console.log(`🔐 Hashed password with ${BCRYPT_ROUNDS} rounds`);

    for (const userData of users) {
      const existing = await usersCollection.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      const user = {
        email: userData.email,
        passwordHash,
        role: userData.role,
        status: 'active',
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCollection.insertOne(user);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 User seeding completed!');
    console.log('\nCreated users:');
    users.forEach(u => console.log(`  - ${u.email} / ${u.role} / password123`));

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedUsers();
