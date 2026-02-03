
import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
