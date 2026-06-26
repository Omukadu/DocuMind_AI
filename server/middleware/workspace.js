const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');

const requireWorkspaceMember = (...roles) => async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.isActive) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() === req.user._id.toString()) {
      req.workspace = workspace;
      req.workspaceRole = 'owner';
      return next();
    }

    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
      status: 'active',
    });

    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a workspace member' });
    }

    if (roles.length && !roles.includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient workspace permissions' });
    }

    req.workspace = workspace;
    req.workspaceRole = member.role;
    req.workspaceMember = member;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireWorkspaceMember };
