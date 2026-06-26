const express = require('express');
const router = express.Router();
const {
  createWorkspace, getWorkspaces, getWorkspace, updateWorkspace,
  getMembers, inviteMember, updateMemberRole, removeMember, getStats,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getWorkspaces).post(createWorkspace);
router.route('/:id').get(getWorkspace).put(updateWorkspace);
router.get('/:id/stats', getStats);
router.route('/:id/members').get(getMembers).post(inviteMember);
router.route('/:id/members/:userId').put(updateMemberRole).delete(removeMember);

module.exports = router;
