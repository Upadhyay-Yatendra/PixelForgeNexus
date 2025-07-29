import { Router } from 'express';
import {
  getUsers,
  getRecentUsers,
  createUser,
  updateUser,
  deleteUser,
  getDevelopers
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();
//this route is to allow project leads to see all devs
router.get('/developers', protect, getDevelopers);
// to get recent users for admin only
router.get('/recent', protect, authorize('admin'), getRecentUsers);
// Only admin beyond this point

router.use(protect, authorize('admin'));
router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);

export default router;
