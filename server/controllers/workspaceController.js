const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Document = require('../models/Document');
const Folder = require('../models/Folder');
const User = require('../models/User');
const { logAction } = require('../utils/auditLogger');
const { createNotification } = require('../services/notificationService');

// @desc  Create workspace
const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.create({ name, description, owner: req.user._id });
    await WorkspaceMember.create({
      workspace: workspace._id, user: req.user._id,
      role: 'owner', status: 'active', joinedAt: new Date(),
      permissions: { canUpload: true, canDelete: true, canShare: true, canInvite: true, canManageWorkspace: true },
    });
    await logAction({ workspace: workspace._id, user: req.user._id, action: 'CREATE_WORKSPACE', resource: 'Workspace', resourceId: workspace._id, resourceName: workspace.name, req });
    res.status(201).json({ success: true, workspace });
  } catch (err) { next(err); }
};

// @desc  Get user workspaces
const getWorkspaces = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({ user: req.user._id, status: 'active' }).populate('workspace');
    const workspaces = members.map(m => ({ ...m.workspace.toObject(), role: m.role })).filter(w => w.isActive);
    res.json({ success: true, workspaces });
  } catch (err) { next(err); }
};

// @desc  Get single workspace
const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('owner', 'name email avatar');
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    const [memberCount, docCount] = await Promise.all([
      WorkspaceMember.countDocuments({ workspace: workspace._id, status: 'active' }),
      Document.countDocuments({ workspace: workspace._id, isDeleted: false }),
    ]);
    res.json({ success: true, workspace: { ...workspace.toObject(), memberCount, docCount } });
  } catch (err) { next(err); }
};

// @desc  Update workspace
const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description, settings } = req.body;
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id, { name, description, settings }, { new: true, runValidators: true }
    );
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    res.json({ success: true, workspace });
  } catch (err) { next(err); }
};

// @desc  Get workspace members
const getMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({ workspace: req.params.id, status: 'active' })
      .populate('user', 'name email avatar lastLogin')
      .populate('invitedBy', 'name email');
    res.json({ success: true, members });
  } catch (err) { next(err); }
};

// @desc  Invite member
const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'viewer' } = req.body;
    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ success: false, message: 'User not found. They must register first.' });

    const existing = await WorkspaceMember.findOne({ workspace: req.params.id, user: invitee._id });
    if (existing) return res.status(400).json({ success: false, message: 'User is already a member' });

    const member = await WorkspaceMember.create({
      workspace: req.params.id, user: invitee._id, role,
      invitedBy: req.user._id, joinedAt: new Date(), status: 'active',
    });

    await createNotification({
      user: invitee._id, workspace: req.params.id, type: 'team_activity',
      category: 'invitation_received',
      title: 'Workspace Invitation',
      message: `${req.user.name} invited you to join workspace as ${role}`,
      actor: req.user._id,
    });

    await logAction({ workspace: req.params.id, user: req.user._id, action: 'INVITE_MEMBER', resource: 'WorkspaceMember', resourceId: invitee._id, resourceName: invitee.email, req });
    res.status(201).json({ success: true, member });
  } catch (err) { next(err); }
};

// @desc  Update member role
const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const member = await WorkspaceMember.findOneAndUpdate(
      { workspace: req.params.id, user: req.params.userId },
      { role }, { new: true }
    ).populate('user', 'name email avatar');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) { next(err); }
};

// @desc  Remove member
const removeMember = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove workspace owner' });
    }
    await WorkspaceMember.findOneAndDelete({ workspace: req.params.id, user: req.params.userId });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

// @desc  Get workspace stats
const getStats = async (req, res, next) => {
  try {
    const workspaceId = req.params.id;
    const [docCount, memberCount, folderCount, workspace] = await Promise.all([
      Document.countDocuments({ workspace: workspaceId, isDeleted: false }),
      WorkspaceMember.countDocuments({ workspace: workspaceId, status: 'active' }),
      Folder.countDocuments({ workspace: workspaceId, isDeleted: false }),
      Workspace.findById(workspaceId),
    ]);
    const recentDocs = await Document.find({ workspace: workspaceId, isDeleted: false })
      .sort({ createdAt: -1 }).limit(5).populate('uploadedBy', 'name avatar');
    res.json({
      success: true,
      stats: {
        totalDocuments: docCount,
        totalMembers: memberCount,
        totalFolders: folderCount,
        storageUsed: workspace?.storage?.used || 0,
        storageLimit: workspace?.settings?.maxStorage || 107374182400,
        aiQueriesUsed: workspace?.aiQueriesUsed || 0,
        aiQueriesLimit: workspace?.settings?.aiQueriesLimit || 1000,
        recentDocuments: recentDocs,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, getMembers, inviteMember, updateMemberRole, removeMember, getStats };
