const express = require('express');
const router = express.Router();
const {
  uploadDocuments, reprocessDocument,
  getDocuments, getDocument, updateDocument, saveNotes,
  deleteDocument, bulkDelete, downloadDocument, toggleFavorite, moveDocuments,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
router.post('/upload', upload.array('files', 10), uploadDocuments);
router.get('/', getDocuments);
router.post('/bulk-delete', bulkDelete);
router.post('/move', moveDocuments);
router.route('/:id').get(getDocument).put(updateDocument).delete(deleteDocument);
router.get('/:id/download', downloadDocument);
router.post('/:id/favorite', toggleFavorite);
router.patch('/:id/notes', saveNotes);
router.post('/:id/reprocess', reprocessDocument);

module.exports = router;
