import { Router } from 'express';
import {
  upload,
  uploadDocument,
  projectDocuments,
  downloadDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.post(
  '/upload/:pid',
  authorize(['admin', 'project_lead']),
  upload,
  uploadDocument
);

router.get('/project/:pid', projectDocuments);
router.get('/download/:id', downloadDocument);
router.delete('/:id', authorize(['admin', 'project_lead']), deleteDocument);

export default router;
