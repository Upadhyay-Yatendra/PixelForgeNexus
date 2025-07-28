import { Router } from 'express';
import {
  getProjects,
  myProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignDev,
  removeDev
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.get('/', authorize(['admin', 'project_lead']), getProjects);
router.get('/my', authorize('developer'), myProjects);
router.post('/', authorize(['admin', 'project_lead']), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize(['admin', 'project_lead']), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/assign', authorize(['admin', 'project_lead']), assignDev);
router.delete(
  '/:id/assign/:devId',
  authorize(['admin', 'project_lead']),
  removeDev
);

export default router;
