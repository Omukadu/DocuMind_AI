const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');

const ownerPermissions = {
  canUpload: true,
  canDelete: true,
  canShare: true,
  canInvite: true,
  canManageWorkspace: true,
};

const editorPermissions = {
  canUpload: true,
  canDelete: false,
  canShare: true,
  canInvite: false,
  canManageWorkspace: false,
};

const viewerPermissions = {
  canUpload: false,
  canDelete: false,
  canShare: false,
  canInvite: false,
  canManageWorkspace: false,
};

const seedWorkspaces = async (users) => {
  const [alice, david, bob, carol, eva] = users;

  const workspaceData = [
    {
      name: 'Legal Team',
      description: 'Legal contracts, NDAs, and compliance documentation',
      owner: alice._id,
      plan: 'enterprise',
      storage: { used: 524288000 },
      aiQueriesUsed: 142,
      settings: { aiQueriesLimit: 2000, maxStorage: 214748364800 },
      members: [
        { user: alice._id, role: 'owner', permissions: ownerPermissions },
        { user: david._id, role: 'admin', permissions: ownerPermissions },
        { user: bob._id, role: 'editor', permissions: editorPermissions },
        { user: carol._id, role: 'viewer', permissions: viewerPermissions },
      ],
    },
    {
      name: 'HR Team',
      description: 'Employee agreements, policies, and HR documentation',
      owner: david._id,
      plan: 'pro',
      storage: { used: 209715200 },
      aiQueriesUsed: 87,
      settings: { aiQueriesLimit: 1000, maxStorage: 107374182400 },
      members: [
        { user: david._id, role: 'owner', permissions: ownerPermissions },
        { user: alice._id, role: 'admin', permissions: ownerPermissions },
        { user: carol._id, role: 'editor', permissions: editorPermissions },
        { user: eva._id, role: 'viewer', permissions: viewerPermissions },
      ],
    },
    {
      name: 'Operations Team',
      description: 'Operational reports, vendor contracts, and invoices',
      owner: bob._id,
      plan: 'free',
      storage: { used: 104857600 },
      aiQueriesUsed: 31,
      settings: { aiQueriesLimit: 500, maxStorage: 53687091200 },
      members: [
        { user: bob._id, role: 'owner', permissions: ownerPermissions },
        { user: eva._id, role: 'editor', permissions: editorPermissions },
      ],
    },
  ];

  const created = [];
  for (const ws of workspaceData) {
    const { members, ...wsFields } = ws;
    const workspace = await Workspace.create(wsFields);

    for (const m of members) {
      await WorkspaceMember.create({
        workspace: workspace._id,
        user: m.user,
        role: m.role,
        status: 'active',
        permissions: m.permissions,
        invitedBy: ws.owner,
        joinedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
      });
    }

    created.push(workspace);
    console.log(`  ✓ Workspace: ${workspace.name} [${workspace.plan}] — ${members.length} members`);
  }

  return created;
};

module.exports = seedWorkspaces;
