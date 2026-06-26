const AuditLog = require('../models/AuditLog');

const seedAuditLogs = async (users, workspaces, documents) => {
  const [alice, david, bob, carol, eva] = users;
  const [legalWs, hrWs, opsWs] = workspaces;

  const hours = (n) => new Date(Date.now() - n * 60 * 60 * 1000);
  const days  = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const auditData = [
    // ── Registration ──────────────────────────────────────────────────────────
    { workspace: null,       user: alice._id,  action: 'REGISTER',          resource: 'User',            resourceName: 'alice@documind.ai',          success: true,  ip: '192.168.1.10', createdAt: days(30) },
    { workspace: null,       user: david._id,  action: 'REGISTER',          resource: 'User',            resourceName: 'david@documind.ai',          success: true,  ip: '192.168.1.11', createdAt: days(28) },
    { workspace: null,       user: bob._id,    action: 'REGISTER',          resource: 'User',            resourceName: 'bob@documind.ai',            success: true,  ip: '192.168.1.12', createdAt: days(25) },
    { workspace: null,       user: carol._id,  action: 'REGISTER',          resource: 'User',            resourceName: 'carol@documind.ai',          success: true,  ip: '192.168.1.13', createdAt: days(23) },
    { workspace: null,       user: eva._id,    action: 'REGISTER',          resource: 'User',            resourceName: 'eva@documind.ai',            success: true,  ip: '192.168.1.14', createdAt: days(21) },

    // ── Login / Logout ─────────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'LOGIN',             resource: 'User',            resourceName: 'alice@documind.ai',          success: true,  ip: '192.168.1.10', createdAt: days(2) },
    { workspace: legalWs._id, user: alice._id, action: 'LOGIN',             resource: 'User',            resourceName: 'alice@documind.ai',          success: true,  ip: '203.0.113.45', createdAt: days(1) },
    { workspace: hrWs._id,    user: david._id, action: 'LOGIN',             resource: 'User',            resourceName: 'david@documind.ai',          success: true,  ip: '192.168.1.11', createdAt: hours(3) },
    { workspace: null,        user: bob._id,   action: 'LOGIN',             resource: 'User',            resourceName: 'bob@documind.ai',            success: false, ip: '192.168.1.15', errorMessage: 'Invalid password attempt', createdAt: days(3) },
    { workspace: null,        user: bob._id,   action: 'LOGIN',             resource: 'User',            resourceName: 'bob@documind.ai',            success: true,  ip: '192.168.1.12', createdAt: days(2) },
    { workspace: hrWs._id,    user: david._id, action: 'LOGOUT',            resource: 'User',            resourceName: 'david@documind.ai',          success: true,  ip: '192.168.1.11', createdAt: hours(2) },
    { workspace: legalWs._id, user: alice._id, action: 'LOGOUT',            resource: 'User',            resourceName: 'alice@documind.ai',          success: true,  ip: '192.168.1.10', createdAt: hours(20) },

    // ── Workspace Creation ─────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'CREATE_WORKSPACE',  resource: 'Workspace',       resourceName: 'Legal Team',                 success: true,  ip: '192.168.1.10', createdAt: days(29) },
    { workspace: hrWs._id,    user: david._id, action: 'CREATE_WORKSPACE',  resource: 'Workspace',       resourceName: 'HR Team',                    success: true,  ip: '192.168.1.11', createdAt: days(27) },
    { workspace: opsWs._id,   user: bob._id,   action: 'CREATE_WORKSPACE',  resource: 'Workspace',       resourceName: 'Operations Team',            success: true,  ip: '192.168.1.12', createdAt: days(24) },

    // ── Document Uploads ───────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'UPLOAD_DOCUMENTS',  resource: 'Document',        resourceName: 'vendor-contract-techsupply.pdf', details: { count: 1, totalSize: 245760 }, success: true, ip: '192.168.1.10', createdAt: days(20) },
    { workspace: legalWs._id, user: alice._id, action: 'UPLOAD_DOCUMENTS',  resource: 'Document',        resourceName: 'nda-apex-partners.pdf',      details: { count: 1, totalSize: 98304 },  success: true, ip: '192.168.1.10', createdAt: days(18) },
    { workspace: hrWs._id,    user: david._id, action: 'UPLOAD_DOCUMENTS',  resource: 'Document',        resourceName: 'remote-work-policy-2025.pdf',details: { count: 1, totalSize: 153600 }, success: true, ip: '192.168.1.11', createdAt: days(15) },
    { workspace: opsWs._id,   user: bob._id,   action: 'UPLOAD_DOCUMENTS',  resource: 'Document',        resourceName: 'q1-2025-operations-report.xlsx', details: { count: 1, totalSize: 409600 }, success: true, ip: '192.168.1.12', createdAt: days(10) },
    { workspace: hrWs._id,    user: david._id, action: 'UPLOAD_DOCUMENTS',  resource: 'Document',        resourceName: 'code-of-conduct-2025.pdf',   details: { count: 1, totalSize: 204800 }, success: true, ip: '192.168.1.11', createdAt: days(12) },

    // ── Member Management ──────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'INVITE_MEMBER',     resource: 'WorkspaceMember', resourceName: 'david@documind.ai',           success: true, ip: '192.168.1.10', createdAt: days(22) },
    { workspace: legalWs._id, user: alice._id, action: 'INVITE_MEMBER',     resource: 'WorkspaceMember', resourceName: 'bob@documind.ai',             success: true, ip: '192.168.1.10', createdAt: days(21) },
    { workspace: hrWs._id,    user: david._id, action: 'INVITE_MEMBER',     resource: 'WorkspaceMember', resourceName: 'carol@documind.ai',           success: true, ip: '192.168.1.11', createdAt: days(20) },
    { workspace: hrWs._id,    user: david._id, action: 'INVITE_MEMBER',     resource: 'WorkspaceMember', resourceName: 'eva@documind.ai',             success: true, ip: '192.168.1.11', createdAt: days(19) },
    { workspace: legalWs._id, user: alice._id, action: 'ROLE_CHANGE',       resource: 'WorkspaceMember', resourceName: 'carol@documind.ai',           details: { from: 'viewer', to: 'editor' }, success: true, ip: '192.168.1.10', createdAt: days(2) },

    // ── AI Activity ────────────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'AI_SUMMARY',        resource: 'Document',        resourceName: 'Vendor Contract — TechSupply Inc', success: true, ip: '192.168.1.10', createdAt: days(8) },
    { workspace: hrWs._id,    user: david._id, action: 'AI_SUMMARY',        resource: 'Document',        resourceName: 'Remote Work Policy 2025',     success: true, ip: '192.168.1.11', createdAt: days(6) },
    { workspace: legalWs._id, user: alice._id, action: 'AI_SUMMARY',        resource: 'Document',        resourceName: 'Mutual NDA — Apex Partners',  success: true, ip: '192.168.1.10', createdAt: days(5) },
    { workspace: hrWs._id,    user: david._id, action: 'AI_SUMMARY',        resource: 'Document',        resourceName: 'Code of Conduct Policy',      success: true, ip: '192.168.1.11', createdAt: days(4) },

    // ── Document Operations ────────────────────────────────────────────────────
    { workspace: legalWs._id, user: alice._id, action: 'SHARE_DOCUMENT',    resource: 'Document',        resourceName: 'Standard Employment Agreement 2025', success: true, ip: '192.168.1.10', createdAt: days(4) },
    { workspace: hrWs._id,    user: david._id, action: 'UPDATE_DOCUMENT',   resource: 'Document',        resourceName: 'Code of Conduct Policy',      success: true, ip: '192.168.1.11', createdAt: days(3) },
    { workspace: legalWs._id, user: alice._id, action: 'DELETE_DOCUMENT',   resource: 'Document',        resourceName: 'Draft Contract v1',           success: true, ip: '192.168.1.10', createdAt: days(12) },
    { workspace: legalWs._id, user: alice._id, action: 'PASSWORD_RESET',    resource: 'User',            resourceName: 'alice@documind.ai',           success: true, ip: '192.168.1.10', createdAt: days(14) },
  ];

  const createdLogs = [];
  for (const log of auditData) {
    const entry = await AuditLog.create(log);
    createdLogs.push(entry);
  }
  console.log(`  ✓ Audit logs: ${createdLogs.length} created`);
  return createdLogs;
};

module.exports = seedAuditLogs;
