require('dotenv').config();
const mongoose = require('mongoose');

const seedUsers         = require('./seedUsers');
const seedWorkspaces    = require('./seedWorkspaces');
const seedFolders       = require('./seedFolders');
const seedDocuments     = require('./seedDocuments');
const seedChats         = require('./seedChats');
const seedNotifications = require('./seedNotifications');
const seedAuditLogs     = require('./seedAuditLogs');

const seed = async () => {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documind_ai';

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  console.log('🗑️  Clearing existing data...');
  const models = ['User', 'Workspace', 'WorkspaceMember', 'Folder', 'Document',
    'DocumentVersion', 'Chat', 'Message', 'Notification', 'Share', 'AuditLog'];
  for (const m of models) {
    try { await require(`../models/${m}`).deleteMany({}); } catch (_) {}
  }
  console.log('  ✓ Cleared\n');

  console.log('👤 Seeding users...');
  const users = await seedUsers();

  console.log('\n🏢 Seeding workspaces...');
  const workspaces = await seedWorkspaces(users);

  console.log('\n📁 Seeding folders...');
  const folders = await seedFolders(users, workspaces);

  console.log('\n📄 Seeding documents...');
  const documents = await seedDocuments(users, workspaces, folders);

  console.log('\n💬 Seeding AI chats...');
  await seedChats(users, workspaces, documents);

  console.log('\n🔔 Seeding notifications...');
  await seedNotifications(users, workspaces, documents);

  console.log('\n📋 Seeding audit logs...');
  await seedAuditLogs(users, workspaces, documents);

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo accounts (all use password: Password123!)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Superadmin : alice@documind.ai');
  console.log('  Admin      : david@documind.ai');
  console.log('  Editor     : bob@documind.ai');
  console.log('  Viewer     : carol@documind.ai');
  console.log('  Viewer     : eva@documind.ai');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
