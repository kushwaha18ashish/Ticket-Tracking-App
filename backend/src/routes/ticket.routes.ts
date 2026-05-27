import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import * as ticketIssueController from '../controllers/ticketIssue.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', ticketController.getStats);
router.get('/activity/recent', ticketController.getRecentActivity);
router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicket);
router.get('/:id/activity', ticketController.getActivity);
router.patch('/:id', ticketController.updateTicket);
router.patch('/:id/status', ticketController.updateStatus);
router.post('/:id/promote', ticketController.promote);
router.post('/:id/comments', ticketController.addComment);
router.post('/:id/issues', ticketIssueController.createIssue);
router.patch('/:id/issues/:issueId', ticketIssueController.updateIssue);
router.delete('/:id/issues/:issueId', ticketIssueController.deleteIssue);
router.delete('/:id', ticketController.deleteTicket);

export default router;
