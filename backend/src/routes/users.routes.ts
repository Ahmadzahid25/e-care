import { Router } from 'express';
import { authenticateToken, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../utils/schemas.js';
import { uploadAvatar } from '../middleware/upload.js';
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar as uploadAvatarHandler,
} from '../controllers/users.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireUser);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/password', validate(changePasswordSchema), changePassword);
router.post('/avatar', uploadAvatar, uploadAvatarHandler);

export default router;
