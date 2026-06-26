const Folder = require('../models/Folder');
const Document = require('../models/Document');

// @desc  Create folder
const createFolder = async (req, res, next) => {
  try {
    const { name, workspaceId, parentId, color, description } = req.body;
    let pathArr = [];
    if (parentId) {
      const parent = await Folder.findById(parentId);
      if (!parent) return res.status(404).json({ success: false, message: 'Parent folder not found' });
      pathArr = [...parent.path, parent._id];
    }
    const folder = await Folder.create({
      name, workspace: workspaceId, parent: parentId || null,
      createdBy: req.user._id, color, description, path: pathArr,
    });
    res.status(201).json({ success: true, folder });
  } catch (err) { next(err); }
};

// @desc  Get folders
const getFolders = async (req, res, next) => {
  try {
    const { workspaceId, parentId } = req.query;
    const query = { workspace: workspaceId, isDeleted: false };
    if (parentId === 'root') query.parent = null;
    else if (parentId) query.parent = parentId;
    const folders = await Folder.find(query).populate('createdBy', 'name avatar').sort({ name: 1 });
    res.json({ success: true, folders });
  } catch (err) { next(err); }
};

// @desc  Get folder
const getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('parent', 'name').populate('createdBy', 'name avatar').populate('path', 'name');
    if (!folder || folder.isDeleted) return res.status(404).json({ success: false, message: 'Folder not found' });
    res.json({ success: true, folder });
  } catch (err) { next(err); }
};

// @desc  Update folder
const updateFolder = async (req, res, next) => {
  try {
    const { name, color, description } = req.body;
    const folder = await Folder.findByIdAndUpdate(req.params.id, { name, color, description }, { new: true });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    res.json({ success: true, folder });
  } catch (err) { next(err); }
};

// @desc  Delete folder
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    await Folder.updateMany({ parent: req.params.id }, { isDeleted: true, deletedAt: new Date() });
    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) { next(err); }
};

module.exports = { createFolder, getFolders, getFolder, updateFolder, deleteFolder };
