import { Router } from 'express';
import { fetchNotifications, createNotification, dismissNotification } from '../controllers/notificationController';

const router = Router();

router.get('/', fetchNotifications);
router.post('/', createNotification);
router.patch('/:id/dismiss', dismissNotification);

export default router;