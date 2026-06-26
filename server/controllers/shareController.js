const Share = require('../models/Share');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { logAction } = require('../utils/auditLogger');

// @desc  Create share link
const createShare = async (req, res, next) => {
  try {
    const { documentId, password, expiresAt, allowDownload = true, isPublic = true } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const share = await Share.create({
      token: uuidv4(), document: documentId, workspace: doc.workspace,
      createdBy: req.user._id, isPublic, password: hashedPassword,
      hasPassword: !!password, expiresAt: expiresAt || null, allowDownload,
    });

    await Document.findByIdAndUpdate(documentId, { isShared: true });

    await logAction({
      workspace: doc.workspace, user: req.user._id,
      action: 'SHARE_DOCUMENT', resource: 'Document',
      resourceId: doc._id, resourceName: doc.name, req,
    });

    res.status(201).json({
      success: true, share: { ...share.toObject(), password: undefined },
      shareUrl: `${process.env.CLIENT_URL}/shared/${share.token}`,
    });
  } catch (err) { next(err); }
};

// @desc  Get document shares
const getShares = async (req, res, next) => {
  try {
    const shares = await Share.find({ document: req.params.documentId, isActive: true })
      .populate('createdBy', 'name email');
    res.json({ success: true, shares });
  } catch (err) { next(err); }
};

// @desc  Access shared document (public)
const accessSharedDocument = async (req, res, next) => {
  try {
    const share = await Share.findOne({ token: req.params.token, isActive: true }).select('+password');
    if (!share) return res.status(404).json({ success: false, message: 'Share link not found or expired' });

    if (share.expiresAt && share.expiresAt < new Date()) {
      await Share.findByIdAndUpdate(share._id, { isActive: false });
      return res.status(410).json({ success: false, message: 'Share link has expired' });
    }

    if (share.hasPassword) {
      const { password } = req.body;
      if (!password) return res.status(401).json({ success: false, message: 'Password required', requiresPassword: true });
      const match = await bcrypt.compare(password, share.password);
      if (!match) return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const doc = await Document.findById(share.document).populate('uploadedBy', 'name');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    await Share.findByIdAndUpdate(share._id, {
      $inc: { viewCount: 1 },
      $push: { accessLog: { accessedAt: new Date(), ip: req.ip, userAgent: req.headers['user-agent'] } },
    });

    res.json({ success: true, document: doc, allowDownload: share.allowDownload });
  } catch (err) { next(err); }
};

// @desc  Revoke share
const revokeShare = async (req, res, next) => {
  try {
    await Share.findByIdAndUpdate(req.params.shareId, { isActive: false });
    res.json({ success: true, message: 'Share revoked' });
  } catch (err) { next(err); }
};

module.exports = { createShare, getShares, accessSharedDocument, revokeShare };
