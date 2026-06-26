require('dotenv').config();
const mongoose = require('mongoose');

const MODELS = [
  'User', 'Workspace', 'WorkspaceMember', 'Folder',
  'Document', 'DocumentVersion', 'Chat', 'Message',
  'Notification', 'Share', 'AuditLog',
];

const clear = async () => {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documind_ai';

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  console.log('🗑️  Clearing all collections...');

  for (const model of MODELS) {
    try {
      const M = require(`../models/${model}`);
      const { deletedCount } = await M.deleteMany({});
      console.log(`  ✓ ${model}: ${deletedCount} documents removed`);
    } catch (err) {
      console.warn(`  ⚠️  ${model}: ${err.message}`);
    }
  }

  console.log('\n✅ Database cleared successfully');
  await mongoose.disconnect();
  process.exit(0);
};

clear().catch((err) => {
  console.error('❌ Clear failed:', err);
  process.exit(1);
});
