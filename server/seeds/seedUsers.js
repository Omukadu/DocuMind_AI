const User = require('../models/User');

const seedUsers = async () => {
  const users = [
    {
      name: 'Alice Johnson',
      email: 'alice@documind.ai',
      password: 'Password123!',
      role: 'superadmin',
      isVerified: true,
      isActive: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      name: 'David Chen',
      email: 'david@documind.ai',
      password: 'Password123!',
      role: 'admin',
      isVerified: true,
      isActive: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      name: 'Bob Martinez',
      email: 'bob@documind.ai',
      password: 'Password123!',
      role: 'user',
      isVerified: true,
      isActive: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      name: 'Carol Williams',
      email: 'carol@documind.ai',
      password: 'Password123!',
      role: 'user',
      isVerified: true,
      isActive: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      name: 'Eva Rossi',
      email: 'eva@documind.ai',
      password: 'Password123!',
      role: 'user',
      isVerified: true,
      isActive: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  ];

  const created = [];
  for (const u of users) {
    const user = await User.create(u);
    created.push(user);
    console.log(`  ✓ User: ${user.name} <${user.email}> [${user.role}]`);
  }
  return created;
};

module.exports = seedUsers;
