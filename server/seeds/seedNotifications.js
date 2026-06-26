const Notification = require('../models/Notification');

const seedNotifications = async (users, workspaces, documents) => {
  const [alice, david, bob, carol, eva] = users;
  const [legalWs, hrWs, opsWs] = workspaces;

  const now = Date.now();
  const mins = (n) => new Date(now - n * 60 * 1000);
  const hours = (n) => new Date(now - n * 60 * 60 * 1000);
  const days = (n) => new Date(now - n * 24 * 60 * 60 * 1000);

  const notificationsData = [
    // For Alice
    { user: alice._id, workspace: legalWs._id, type: 'team_activity', category: 'member_joined', title: 'New member joined Legal Team', message: 'Bob Martinez joined the Legal Team workspace as Editor.', actor: david._id, isRead: false, createdAt: hours(1) },
    { user: alice._id, workspace: legalWs._id, type: 'ai_activity', category: 'ai_summary_ready', title: 'AI Summary generated', message: 'AI summary for "Vendor Contract — TechSupply Inc" has been generated successfully.', targetDocument: documents[0]?._id, isRead: true, createdAt: hours(3) },
    { user: alice._id, workspace: legalWs._id, type: 'document_activity', category: 'document_shared', title: 'Document shared externally', message: 'David Chen created a share link for "Mutual NDA — Apex Partners".', actor: david._id, targetDocument: documents[2]?._id, isRead: false, createdAt: hours(5) },
    { user: alice._id, workspace: hrWs._id, type: 'team_activity', category: 'invitation_received', title: 'Workspace invitation', message: 'David Chen invited you to join HR Team workspace as Admin.', actor: david._id, isRead: true, createdAt: days(1) },

    // For David
    { user: david._id, workspace: legalWs._id, type: 'document_activity', category: 'document_uploaded', title: 'New documents uploaded', message: 'Alice Johnson uploaded 2 new documents to the Contracts folder.', actor: alice._id, isRead: false, createdAt: mins(45) },
    { user: david._id, workspace: hrWs._id, type: 'ai_activity', category: 'ai_summary_ready', title: 'AI Summary ready', message: 'AI analysis of "Remote Work Policy 2025" is complete with 5 key insights.', targetDocument: documents[5]?._id, isRead: true, createdAt: hours(2) },
    { user: david._id, workspace: hrWs._id, type: 'team_activity', category: 'role_changed', title: 'Role updated', message: "Carol Williams' role in HR Team has been updated to Editor.", actor: alice._id, isRead: false, createdAt: hours(6) },
    { user: david._id, workspace: legalWs._id, type: 'document_activity', category: 'document_uploaded', title: 'Document uploaded', message: 'Bob Martinez uploaded "Partnership Agreement — DataFlow Ltd" to Agreements.', actor: bob._id, isRead: true, createdAt: days(1) },

    // For Bob
    { user: bob._id, workspace: legalWs._id, type: 'team_activity', category: 'invitation_received', title: 'Workspace invitation', message: 'Alice Johnson invited you to join Legal Team workspace as Editor.', actor: alice._id, isRead: true, createdAt: days(2) },
    { user: bob._id, workspace: opsWs._id, type: 'document_activity', category: 'document_uploaded', title: 'Upload completed', message: 'Your upload of "Q1 2025 Operations Report" was successful.', isRead: false, createdAt: hours(4) },
    { user: bob._id, workspace: opsWs._id, type: 'ai_activity', category: 'ai_summary_ready', title: 'AI Summary generated', message: 'AI summary for "Q1 2025 Operations Report" is ready.', targetDocument: documents[8]?._id, isRead: false, createdAt: hours(4) },

    // For Carol
    { user: carol._id, workspace: hrWs._id, type: 'team_activity', category: 'invitation_received', title: 'Workspace invitation', message: 'David Chen invited you to join HR Team workspace as Editor.', actor: david._id, isRead: true, createdAt: days(3) },
    { user: carol._id, workspace: hrWs._id, type: 'document_activity', category: 'document_shared', title: 'Document shared with you', message: '"Standard Employment Agreement 2025" has been shared with external access.', targetDocument: documents[7]?._id, isRead: false, createdAt: days(1) },

    // For Eva
    { user: eva._id, workspace: hrWs._id, type: 'team_activity', category: 'invitation_received', title: 'Workspace invitation', message: 'David Chen invited you to join HR Team workspace as Viewer.', actor: david._id, isRead: false, createdAt: days(2) },
    { user: eva._id, workspace: opsWs._id, type: 'team_activity', category: 'invitation_received', title: 'Workspace invitation', message: 'Bob Martinez invited you to join Operations Team workspace as Editor.', actor: bob._id, isRead: true, createdAt: days(4) },
  ];

  const created = [];
  for (const n of notificationsData) {
    created.push(await Notification.create(n));
  }
  console.log(`  ✓ Notifications: ${created.length} created`);
  return created;
};

module.exports = seedNotifications;
