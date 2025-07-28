import { Router } from 'express';
import {
  register,
  login,
  verifyMFA,
  setupMFA,
  confirmMFA,
  disableMFA,
  logout,
  currentUser,
  validateLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.post('/register', protect, authorize('admin'), register);
router.post('/login', validateLogin, login);
router.post('/verify-mfa', verifyMFA);
router.post('/logout', protect, logout);
router.get('/me', protect, currentUser);
router.post('/setup-mfa', protect, setupMFA);
router.post('/confirm-mfa', protect, confirmMFA);
router.post('/disable-mfa', protect, disableMFA);

export default router;
