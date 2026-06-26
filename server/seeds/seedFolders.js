const Folder = require('../models/Folder');

const seedFolders = async (users, workspaces) => {
  const [legalWs, hrWs, opsWs] = workspaces;
  const [alice, david, bob] = users;

  const folderData = [
    // Legal Team folders
    { name: 'Contracts', workspace: legalWs._id, createdBy: alice._id, color: '#6366f1', description: 'Active and archived contracts' },
    { name: 'NDAs', workspace: legalWs._id, createdBy: alice._id, color: '#8b5cf6', description: 'Non-disclosure agreements' },
    { name: 'Agreements', workspace: legalWs._id, createdBy: david._id, color: '#a78bfa', description: 'Service and vendor agreements' },
    { name: 'Compliance', workspace: legalWs._id, createdBy: alice._id, color: '#ec4899', description: 'Regulatory compliance documents' },

    // HR Team folders
    { name: 'Policies', workspace: hrWs._id, createdBy: david._id, color: '#10b981', description: 'Company policies and procedures' },
    { name: 'Employee Agreements', workspace: hrWs._id, createdBy: david._id, color: '#34d399', description: 'Employment contracts and agreements' },
    { name: 'Onboarding', workspace: hrWs._id, createdBy: david._id, color: '#6ee7b7', description: 'New hire onboarding materials' },

    // Operations Team folders
    { name: 'Reports', workspace: opsWs._id, createdBy: bob._id, color: '#f59e0b', description: 'Monthly and quarterly reports' },
    { name: 'Invoices', workspace: opsWs._id, createdBy: bob._id, color: '#fbbf24', description: 'Vendor and client invoices' },
    { name: 'Vendor Docs', workspace: opsWs._id, createdBy: bob._id, color: '#fcd34d', description: 'Vendor contracts and documentation' },
  ];

  const created = [];
  for (const f of folderData) {
    const folder = await Folder.create({ ...f, path: [] });
    created.push(folder);
    console.log(`  ✓ Folder: ${folder.name} in workspace ${f.workspace}`);
  }

  return created;
};

module.exports = seedFolders;
